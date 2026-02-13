<?php

declare(strict_types=1);

use Core\Router;
use Controllers\AuthController;
use Controllers\NewsController;
use Controllers\CommentController;
use Core\Middleware\AuthMiddleware;
use Core\Middleware\AdminMiddleware;

return function (Router $router): void {
    $router->post('/api/auth/login', [AuthController::class, 'login']);
    $router->post('/api/auth/register', [AuthController::class, 'register']);
    $router->get('/api/auth/me', [AuthController::class, 'me'], [AuthMiddleware::class]);

    $router->get('/api/news', [NewsController::class, 'index']);
    $router->get('/api/news/categories', [NewsController::class, 'categories']);
    $router->get('/api/news/admin/list', [NewsController::class, 'listForAdmin'], [AuthMiddleware::class, AdminMiddleware::class]);
    $router->get('/api/news/{id}', [NewsController::class, 'show']);
    $router->post('/api/news', [NewsController::class, 'store'], [AuthMiddleware::class, AdminMiddleware::class]);
    $router->delete('/api/news/{id}', [NewsController::class, 'destroy'], [AuthMiddleware::class, AdminMiddleware::class]);

    $router->get('/api/news/{newsId}/comments', [CommentController::class, 'index']);
    $router->post('/api/news/{newsId}/comments', [CommentController::class, 'store'], [AuthMiddleware::class]);
    $router->delete('/api/comments/{id}', [CommentController::class, 'destroy'], [AuthMiddleware::class]);
};
