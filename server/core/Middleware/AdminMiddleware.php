<?php

declare(strict_types=1);

namespace Core\Middleware;

use Core\App;

class AdminMiddleware extends AuthMiddleware
{
    public function handle(): bool
    {
        if (!parent::handle()) {
            return false;
        }

        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        preg_match('/Bearer\s+(.*)$/i', $auth, $matches);
        $token = trim($matches[1] ?? '');
        $parts = explode('.', $token);

        if (count($parts) < 2) {
            return false;
        }

        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        if (($payload['status'] ?? '') !== 'Administrator') {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden', 'message' => 'Admin access required']);
            return false;
        }

        return true;
    }
}
