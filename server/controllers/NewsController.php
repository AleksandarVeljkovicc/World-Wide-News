<?php

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Models\NewsRepository;
use Models\CategoryRepository;
use Validation\NewsValidator;

class NewsController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->newsRepo = new NewsRepository($this->db);
        $this->categoryRepo = new CategoryRepository($this->db);
        $this->validator = new NewsValidator($this->categoryRepo);
    }

    private NewsRepository $newsRepo;
    private CategoryRepository $categoryRepo;
    private NewsValidator $validator;

    private function formatNewsItem(array $row): array
    {
        $item = [
            'news_id' => (int) $row['news_id'],
            'headline' => $row['headline'],
            'type' => $row['type'],
            'published' => $row['published'],
            'views' => (int) ($row['views'] ?? 0),
            'name' => $row['name'] ?? '',
            'last_name' => $row['last_name'] ?? '',
        ];
        if (!empty($row['image'])) {
            $item['image'] = 'data:image/jpeg;base64,' . base64_encode($row['image']);
        }
        return $item;
    }

    private function formatNewsFull(array $row): array
    {
        $item = [
            'news_id' => (int) $row['news_id'],
            'headline' => $row['headline'],
            'text' => $row['text'],
            'type' => $row['type'],
            'published' => $row['published'],
            'views' => (int) ($row['views'] ?? 0),
            'name' => $row['name'] ?? '',
            'last_name' => $row['last_name'] ?? '',
        ];
        if (!empty($row['image'])) {
            $item['image'] = 'data:image/jpeg;base64,' . base64_encode($row['image']);
        }
        return $item;
    }

    public function index(): void
    {
        $category = $this->getGetParam('category');

        $news = $this->newsRepo->getLatestByCategory($category);
        $items = array_map(fn($r) => $this->formatNewsItem($r), $news);

        $popular = $this->newsRepo->getMostPopularThisMonth();
        $popularItem = $popular ? $this->formatNewsItem($popular) : null;

        $this->json([
            'news' => $items,
            'category' => $category,
            'popular' => $popularItem,
        ]);
    }

    public function show(string $id): void
    {
        $newsId = (int) $id;
        $news = $this->newsRepo->getById($newsId);

        if (!$news) {
            $this->json(['error' => 'News not found'], 404);
            return;
        }

        $this->newsRepo->incrementViews($newsId);
        $news['views'] = ((int) ($news['views'] ?? 0)) + 1;

        $this->json($this->formatNewsFull($news));
    }

    public function categories(): void
    {
        $categories = $this->categoryRepo->getAll();
        $this->json(['categories' => $categories]);
    }

    public function listForAdmin(): void
    {
        $search = $this->getGetParam('search');
        $news = $search
            ? $this->newsRepo->search($search)
            : $this->newsRepo->getAllForAdmin();

        $items = array_map(fn($r) => $this->formatNewsItem($r), $news);
        $this->json(['news' => $items]);
    }

    public function store(): void
    {
        $token = $this->getBearerToken();
        if (!$token || !$this->verifyJwt($token)) {
            $this->json(['error' => 'Unauthorized'], 401);
            return;
        }
        $payload = $this->validateJwt($token);
        if (($payload['status'] ?? '') !== 'Administrator') {
            $this->json(['error' => 'Forbidden'], 403);
            return;
        }

        $input = $this->getJsonInputAndLog('news_store');
        $postData = $this->getPostData();
        if (!empty($postData)) {
            $input = array_merge($input, $postData);
        }

        $headline = trim($input['headline'] ?? '');
        $article = trim($input['article'] ?? $input['text'] ?? '');
        $newsTypeId = (int) ($input['type'] ?? $input['news_type_id'] ?? 0);
        $imageBase64 = $input['image'] ?? $input['image_base64'] ?? '';

        $errors = $this->validator->validateNews($input);

        if (!empty($errors)) {
            $this->json(['success' => false, 'errors' => $errors], 400);
            return;
        }

        $imageData = '';
        if (preg_match('/^data:image\/(\w+);base64,/', $imageBase64, $matches)) {
            $imageData = substr($imageBase64, strpos($imageBase64, ',') + 1);
            $imageData = base64_decode($imageData);
        } else {
            $imageData = base64_decode($imageBase64) ?: $imageBase64;
        }
        if (empty($imageData)) {
            $this->json(['success' => false, 'errors' => ['upload' => 'Invalid image.']], 400);
            return;
        }

        $id = $this->newsRepo->create([
            'headline' => $headline,
            'text' => $article,
            'news_type_id' => $newsTypeId,
            'author' => (int) $payload['user_id'],
            'image' => $imageData,
        ]);

        $this->json(['success' => true, 'news_id' => $id, 'message' => 'Successfully added new article.']);
    }

    public function destroy(string $id): void
    {
        $token = $this->getBearerToken();
        if (!$token || !$this->verifyJwt($token)) {
            $this->json(['error' => 'Unauthorized'], 401);
            return;
        }
        $payload = $this->validateJwt($token);
        if (($payload['status'] ?? '') !== 'Administrator') {
            $this->json(['error' => 'Forbidden'], 403);
            return;
        }

        $newsId = (int) $id;
        if ($this->newsRepo->softDelete($newsId)) {
            $this->json(['success' => true, 'message' => 'Article deleted.']);
        } else {
            $this->json(['success' => false, 'error' => 'Failed to delete'], 500);
        }
    }
}
