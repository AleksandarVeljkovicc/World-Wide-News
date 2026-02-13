<?php

declare(strict_types=1);

return [
    'debug' => getenv('APP_DEBUG') === 'true',
    'secret' => getenv('APP_SECRET') ?: 'your-secret-key-change-in-production',
    'cors_origins' => getenv('CORS_ORIGINS') ?: 'http://localhost:5173',
];
