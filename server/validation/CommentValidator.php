<?php

declare(strict_types=1);

namespace Validation;

class CommentValidator
{
    public static function validateComment(array $input): array
    {
        $errors = [];
        $comment = trim($input['comment'] ?? '');

        if (empty($comment) || strlen($comment) < 2) {
            $errors['comment'] = 'Comment cannot be less than 2 characters.';
        } elseif (InputValidator::containsForbiddenChars($comment)) {
            $errors['comment'] = "Comment cannot contain the characters: < > '";
        }

        return $errors;
    }
}
