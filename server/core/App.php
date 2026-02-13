<?php

declare(strict_types=1);

namespace Core;

use Core\Interfaces\DatabaseInterface;

class App
{
    private static ?DatabaseInterface $database = null;
    private static array $config = [];
    private static Router $router;

    public static function init(): void
    {
        $dbConfig = require __DIR__ . '/../config/database.php';
        $appConfig = require __DIR__ . '/../config/app.php';
        self::$config = array_merge($dbConfig, $appConfig);

        $dbConfig = [
            'host' => $dbConfig['host'],
            'username' => $dbConfig['username'],
            'password' => $dbConfig['password'],
            'database' => $dbConfig['database'],
            'charset' => $dbConfig['charset'],
        ];

        self::$database = new Database($dbConfig);

        if (!self::$database->connect()) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }

        self::setupCors();
        self::$router = new Router();
        self::registerRoutes();
    }

    private static function setupCors(): void
    {
        $origins = explode(',', self::$config['cors_origins'] ?? '*');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowOrigin = in_array(trim($origin), array_map('trim', $origins)) ? $origin : ($origins[0] ?? '*');

        header('Access-Control-Allow-Origin: ' . $allowOrigin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    private static function registerRoutes(): void
    {
        $routes = require __DIR__ . '/../routes/api.php';
        $routes(self::$router);
    }

    public static function run(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $uri = parse_url($uri, PHP_URL_PATH);
        $basePath = self::getBasePath();
        if ($basePath && str_starts_with($uri, $basePath)) {
            $uri = substr($uri, strlen($basePath)) ?: '/';
        }
        $uri = '/' . trim($uri, '/');
        self::$router->dispatch($method, $uri);
    }

    private static function getBasePath(): string
    {
        $script = $_SERVER['SCRIPT_NAME'] ?? '';
        $path = dirname($script);
        return rtrim($path, '/');
    }

    public static function getDatabase(): DatabaseInterface
    {
        return self::$database;
    }

    public static function getConfig(): array
    {
        return self::$config;
    }
}
