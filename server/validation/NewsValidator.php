<?php

declare(strict_types=1);

namespace Validation;

use Models\CategoryRepository;

class NewsValidator
{
    public function __construct(
        private readonly CategoryRepository $categoryRepo
    ) {
    }

    public function validateNews(array $input): array
    {
        $errors = [];
        $headline = trim($input['headline'] ?? '');
        $article = trim($input['article'] ?? $input['text'] ?? '');
        $newsTypeId = (int) ($input['type'] ?? $input['news_type_id'] ?? 0);
        $imageBase64 = $input['image'] ?? $input['image_base64'] ?? '';

        if (empty($headline)) {
            $errors['headline'] = 'Headline is empty.';
        } elseif (strlen($headline) < 10) {
            $errors['headline'] = 'Headline cannot be less than 10 characters.';
        } elseif (InputValidator::containsForbiddenChars($headline)) {
            $errors['headline'] = "Headline cannot contain the characters: < > '";
        }

        if (empty($article)) {
            $errors['article'] = 'Article is empty.';
        } elseif (strlen($article) < 10) {
            $errors['article'] = 'Article cannot be less than 10 characters.';
        } elseif (InputValidator::containsForbiddenChars($article)) {
            $errors['article'] = "Article cannot contain the characters: < > '";
        }

        if (!$this->categoryRepo->exists($newsTypeId)) {
            $errors['type'] = 'Category does not exist.';
        }

        if (empty($imageBase64)) {
            $errors['upload'] = 'Please choose an image.';
        }

        return $errors;
    }
}
