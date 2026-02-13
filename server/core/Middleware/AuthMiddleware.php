<?php

declare(strict_types=1);

namespace Core\Middleware;

use Core\App;

class AuthMiddleware
{
    public function handle(): bool
    {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Token required']);
            return false;
        }

        $token = trim($matches[1]);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Invalid token']);
            return false;
        }

        $config = App::getConfig();
        $expectedSig = hash_hmac('sha256', "{$parts[0]}.{$parts[1]}", $config['secret'], true);
        $expectedSigEncoded = strtr(base64_encode($expectedSig), '+/', '-_');

        if (!hash_equals($expectedSigEncoded, $parts[2])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Invalid token']);
            return false;
        }

        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Token expired']);
            return false;
        }

        return true;
    }
}
