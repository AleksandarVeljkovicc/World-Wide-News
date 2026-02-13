<?php

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Models\CommentRepository;
use Models\UserRepository;
use Validation\CommentValidator;

class CommentController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->commentRepo = new CommentRepository($this->db);
        $this->userRepo = new UserRepository($this->db);
    }

    private CommentRepository $commentRepo;
    private UserRepository $userRepo;

    private function formatComment(array $row): array
    {
        $item = [
            'comments_id' => (int) $row['comments_id'],
            'news_id' => (int) $row['news_id'],
            'comment' => $row['comment'],
            'date' => $row['date'],
            'name' => $row['name'] ?? '',
            'last_name' => $row['last_name'] ?? '',
            'user_id' => isset($row['user_id']) ? (int) $row['user_id'] : null,
        ];
        if (!empty($row['image'])) {
            $item['image'] = 'data:image/jpeg;base64,' . base64_encode($row['image']);
        }
        return $item;
    }

    public function index(string $newsId): void
    {
        $id = (int) $newsId;
        $comments = $this->commentRepo->getByNewsId($id);
        $items = array_map(fn($r) => $this->formatComment($r), $comments);
        $this->json(['comments' => $items]);
    }

    public function store(string $newsId): void
    {
        $token = $this->getBearerToken();
        if (!$token || !$this->verifyJwt($token)) {
            $this->json(['error' => 'Unauthorized'], 401);
            return;
        }
        $payload = $this->validateJwt($token);

        $input = $this->getJsonInputAndLog('comment_store');
        $errors = CommentValidator::validateComment($input);

        if (!empty($errors)) {
            $errorMessage = $errors['comment'] ?? 'Validation failed';
            $this->json(['success' => false, 'error' => $errorMessage], 400);
            return;
        }

        $comment = trim($input['comment'] ?? '');

        $id = $this->commentRepo->create(
            (int) $payload['user_id'],
            (int) $newsId,
            $comment
        );

        $this->json(['success' => true, 'comments_id' => $id, 'message' => 'Comment added.']);
    }

    public function destroy(string $id): void
    {
        $token = $this->getBearerToken();
        if (!$token || !$this->verifyJwt($token)) {
            $this->json(['error' => 'Unauthorized'], 401);
            return;
        }
        $payload = $this->validateJwt($token);

        $commentId = (int) $id;
        $authorId = $this->commentRepo->getCommentAuthor($commentId);
        if ($authorId === null) {
            $this->json(['error' => 'Comment not found'], 404);
            return;
        }

        $userStatus = $payload['status'] ?? '';
        $userId = (int) $payload['user_id'];

        $canDelete = $userStatus === 'Administrator' || $userId === $authorId;
        if (!$canDelete) {
            $this->json(['error' => 'Forbidden'], 403);
            return;
        }

        if ($this->commentRepo->softDelete($commentId)) {
            $this->json(['success' => true, 'message' => 'Comment removed.']);
        } else {
            $this->json(['success' => false, 'error' => 'Failed to delete'], 500);
        }
    }
}
