<?php

declare(strict_types=1);

namespace Core;

class Router
{
    private array $routes = [];
    private array $routeParams = [];

    public function get(string $path, array $controllerAction, array $middleware = []): self
    {
        $this->addRoute('GET', $path, $controllerAction, $middleware);
        return $this;
    }

    public function post(string $path, array $controllerAction, array $middleware = []): self
    {
        $this->addRoute('POST', $path, $controllerAction, $middleware);
        return $this;
    }

    public function put(string $path, array $controllerAction, array $middleware = []): self
    {
        $this->addRoute('PUT', $path, $controllerAction, $middleware);
        return $this;
    }

    public function delete(string $path, array $controllerAction, array $middleware = []): self
    {
        $this->addRoute('DELETE', $path, $controllerAction, $middleware);
        return $this;
    }

    private function addRoute(string $method, string $path, array $controllerAction, array $middleware): void
    {
        $pattern = $this->convertPathToRegex($path);
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'pattern' => $pattern,
            'controller' => $controllerAction[0],
            'action' => $controllerAction[1],
            'middleware' => $middleware,
        ];
    }

    private function convertPathToRegex(string $path): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(string $method, string $uri): void
    {
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = '/' . trim($uri, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $uri, $matches)) {
                $this->routeParams = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                foreach ($route['middleware'] as $middleware) {
                    $middlewareInstance = new $middleware();
                    if (!$middlewareInstance->handle()) {
                        return;
                    }
                }

                $controller = new $route['controller']();
                $action = $route['action'];
                $controller->$action(...array_values($this->routeParams));
                return;
            }
        }

        $this->notFound();
    }

    public function getRouteParams(): array
    {
        return $this->routeParams;
    }

    private function notFound(): void
    {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Not Found']);
    }
}
