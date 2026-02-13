<?php

declare(strict_types=1);

namespace Core;

use Core\Interfaces\DatabaseInterface;
use Validation\InputValidator;
use Core\Logger;

abstract class Controller
{
    protected DatabaseInterface $db;
    protected array $config;

    public function __construct()
    {
        $this->db = App::getDatabase();
        $this->config = App::getConfig();
    }

    protected function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    protected function getJsonInput(): array
    {
        $input = file_get_contents('php://input');
        $decoded = json_decode($input, true);
        return is_array($decoded) ? $decoded : [];
    }

    protected function getJsonInputAndLog(string $page): array
    {
        $input = $this->getJsonInput();
        if (!empty($input)) {
            Logger::logInput($page, $input);
        }
        return $input;
    }

    protected function getGetParam(string $key, ?string $default = null): ?string
    {
        $value = $_GET[$key] ?? $default;
        if ($value !== null && $value !== '') {
            $sanitized = InputValidator::sanitizeString($value);
            Logger::logInput('GET_' . $key, [$key => $sanitized]);
            return $sanitized;
        }
        return $default;
    }

    protected function getPostData(): array
    {
        $post = $_POST;
        if (!empty($post)) {
            Logger::logInput('POST', $post);
        }
        return $post;
    }

    protected function getBearerToken(): ?string
    {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    protected function validateJwt(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    protected function createJwt(array $payload, int $expireHours = 24): string
    {
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['exp'] = time() + ($expireHours * 3600);
        $payload['iat'] = time();
        $payloadEncoded = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "{$header}.{$payloadEncoded}", $this->config['secret'], true);
        $signatureEncoded = strtr(base64_encode($signature), '+/', '-_');
        return "{$header}.{$payloadEncoded}.{$signatureEncoded}";
    }

    protected function verifyJwt(string $token): bool
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        $expectedSig = hash_hmac('sha256', "{$parts[0]}.{$parts[1]}", $this->config['secret'], true);
        $expectedSigEncoded = strtr(base64_encode($expectedSig), '+/', '-_');
        return hash_equals($expectedSigEncoded, $parts[2]);
    }
}
