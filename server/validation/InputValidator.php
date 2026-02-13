<?php

declare(strict_types=1);

namespace Validation;

class InputValidator
{
    public static function validString(string $str): bool
    {
        $forbidden = ['=', ' ', '(', ')', "'", '"', '<', '>'];
        foreach ($forbidden as $v) {
            if (str_contains($str, $v)) {
                return false;
            }
        }
        return true;
    }

    public static function containsForbiddenChars(string $str): bool
    {
        $forbidden = ['<', '>', "'"];
        foreach ($forbidden as $char) {
            if (str_contains($str, $char)) {
                return true;
            }
        }
        return false;
    }

    public static function sanitizeString(?string $value): string
    {
        if ($value === null) {
            return '';
        }
        return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
    }

    public static function sanitizeInt(mixed $value): int
    {
        return (int) $value;
    }
}
