<?php

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Models\UserRepository;
use Validation\AuthValidator;

class AuthController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->userRepo = new UserRepository($this->db);
        $this->validator = new AuthValidator($this->userRepo);
    }

    private UserRepository $userRepo;
    private AuthValidator $validator;

    public function login(): void
    {
        $input = $this->getJsonInputAndLog('login');
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');
        $remember = (bool) ($input['remember'] ?? false);

        $errors = $this->validator->validateLogin($input);
        if (!empty($errors)) {
            $this->json(['success' => false, 'error' => $errors['general'] ?? 'Validation failed'], 400);
            return;
        }

        $user = $this->userRepo->findByUsername($username);
        if (!$user) {
            $this->json(['success' => false, 'error' => "User with username '{$username}' isn't registered!"], 401);
            return;
        }

        if ($user['password'] !== $password) {
            $this->json(['success' => false, 'error' => "Wrong password for user '{$username}'!"], 401);
            return;
        }

        if ((int) ($user['active'] ?? 1) !== 1) {
            $this->json([
                'success' => false,
                'error' => "Information correct, but the user isn't active!",
                'comment' => $user['comment'] ?? null
            ], 403);
            return;
        }

        $payload = [
            'user_id' => (int) $user['user_id'],
            'username' => $user['username'],
            'info' => trim(($user['name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
            'status' => $user['status'],
        ];

        // Remember me: token 3 months (90 days). Otherwise: session only (24h, cleared when browser closes)
        $expireHours = $remember ? 24 * 90 : 24;
        $token = $this->createJwt($payload, $expireHours);

        $response = [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => (int) $user['user_id'],
                'username' => $user['username'],
                'info' => $payload['info'],
                'status' => $user['status'],
            ],
        ];

        $this->json($response);
    }

    public function register(): void
    {
        $input = $this->getJsonInputAndLog('register');
        $errors = $this->validator->validateSignup($input);

        if (!empty($errors)) {
            $this->json(['success' => false, 'errors' => $errors], 400);
            return;
        }

        $data = [
            'name' => trim($input['first_name'] ?? $input['name'] ?? ''),
            'last_name' => trim($input['last_name'] ?? ''),
            'username' => trim($input['username'] ?? ''),
            'email' => trim($input['email'] ?? ''),
            'password' => trim($input['password'] ?? ''),
            'country' => $input['country'] ?? '',
            'city' => trim($input['city'] ?? '') ?: null,
            'date_of_birth' => $input['date_of_birth'] ?? null,
            'image' => null,
        ];

        if (!empty($input['image_base64'])) {
            $decodedImage = base64_decode($input['image_base64'], true);
            if ($decodedImage !== false) {
                $data['image'] = $decodedImage;
            }
        }

        $this->userRepo->createUser($data);

        $this->json(['success' => true, 'message' => 'Account created successfully']);
    }

    public function me(): void
    {
        $token = $this->getBearerToken();
        if (!$token || !$this->verifyJwt($token)) {
            $this->json(['error' => 'Unauthorized'], 401);
            return;
        }

        $payload = $this->validateJwt($token);
        if (!$payload) {
            $this->json(['error' => 'Invalid token'], 401);
            return;
        }

        $user = $this->userRepo->findById((int) $payload['user_id']);
        if (!$user) {
            $this->json(['error' => 'User not found'], 404);
            return;
        }

        $response = [
            'user_id' => (int) $user['user_id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'last_name' => $user['last_name'],
            'email' => $user['email'],
            'status' => $user['status'],
            'country' => $user['country'],
            'city' => $user['city'],
            'date_of_birth' => $user['date_of_birth'],
            'create_date' => $user['create_date'],
            'image' => null,
        ];

        if (!empty($user['image'])) {
            $response['image'] = 'data:image/jpeg;base64,' . base64_encode($user['image']);
        }

        $this->json($response);
    }
}
