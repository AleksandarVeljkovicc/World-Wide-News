<?php

declare(strict_types=1);

namespace Validation;

use Models\UserRepository;

class AuthValidator
{
    public function __construct(
        private readonly UserRepository $userRepo
    ) {
    }

    public function validateLogin(array $input): array
    {
        $errors = [];
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if ($username === '' || $password === '') {
            $errors['general'] = 'Every information is necessary!';
            return $errors;
        }

        if (!InputValidator::validString($username) || !InputValidator::validString($password)) {
            $errors['general'] = 'Fields contain forbidden characters!';
            return $errors;
        }

        return $errors;
    }

    public function validateSignup(array $input): array
    {
        $errors = [];
        $name = trim($input['first_name'] ?? $input['name'] ?? '');
        $lastname = trim($input['last_name'] ?? '');
        $password = trim($input['password'] ?? '');
        $cPassword = trim($input['cPassword'] ?? $input['confirm_password'] ?? '');
        $email = trim($input['email'] ?? '');
        $username = trim($input['username'] ?? '');
        $city = trim($input['city'] ?? '');

        if (empty($name)) {
            $errors['first_name'] = 'You did not enter a name.';
        } elseif (InputValidator::containsForbiddenChars($name)) {
            $errors['first_name'] = "First name cannot contain the characters: < > '";
        } elseif (strlen($name) < 3) {
            $errors['first_name'] = 'Name must be at least 3 characters long.';
        } elseif (!ctype_alpha($name)) {
            $errors['first_name'] = 'You can only enter text.';
        }

        if (empty($lastname)) {
            $errors['last_name'] = 'You did not enter a last name.';
        } elseif (strlen($lastname) < 5) {
            $errors['last_name'] = 'Last name must be at least 5 characters long.';
        } elseif (!ctype_alpha($lastname)) {
            $errors['last_name'] = 'You can only enter text.';
        }

        if (empty($password)) {
            $errors['password'] = 'You did not enter a password.';
        } elseif (strlen($password) < 5) {
            $errors['password'] = 'Password must be at least 5 characters long.';
        } elseif (!InputValidator::validString($password)) {
            $errors['password'] = 'Password field contain forbidden characters.';
        }

        if ($cPassword !== $password) {
            $errors['cPassword'] = 'Wrong reentered password.';
        }

        if (empty($username)) {
            $errors['username'] = 'You did not enter a username.';
        } elseif (strlen($username) < 5) {
            $errors['username'] = 'Username must be at least 5 characters long.';
        } elseif (!InputValidator::validString($username)) {
            $errors['username'] = 'Username field contain forbidden characters.';
        } elseif ($this->userRepo->usernameExists($username)) {
            $errors['username'] = 'Username already exist.';
        }

        if (empty($email)) {
            $errors['email'] = 'You did not enter an email.';
        } elseif (InputValidator::containsForbiddenChars($email)) {
            $errors['email'] = "Email cannot contain the characters: < > '";
        } elseif ($this->userRepo->emailExists($email)) {
            $errors['email'] = 'Email already exist.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'You did not enter a valid email.';
        }

        if (empty($input['country'])) {
            $errors['country'] = 'You did not choose a country.';
        }

        if ($city !== '' && strlen($city) < 3) {
            $errors['city'] = 'City must contain at least 3 characters.';
        } elseif ($city !== '' && !ctype_alpha($city)) {
            $errors['city'] = 'You can only enter text.';
        }

        return $errors;
    }
}
