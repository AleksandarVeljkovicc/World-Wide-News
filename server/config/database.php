<?php

declare(strict_types=1);

return [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') ?: 'php',
    'database' => getenv('DB_NAME') ?: 'news_db',
    'charset' => 'utf8mb4',
];
