<?php

declare(strict_types=1);

namespace Tests\Unit\Validation;

use PHPUnit\Framework\TestCase;
use Validation\AuthValidator;
use Models\UserRepository;
use Core\Interfaces\DatabaseInterface;

class AuthValidatorTest extends TestCase
{
    private AuthValidator $validator;
    private $mockUserRepo;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock UserRepository
        $this->mockUserRepo = $this->createMock(UserRepository::class);
        $this->validator = new AuthValidator($this->mockUserRepo);
    }

    public function testValidateLoginWithValidInput(): void
    {
        $input = [
            'username' => 'testuser',
            'password' => 'password123',
        ];

        $errors = $this->validator->validateLogin($input);

        $this->assertEmpty($errors);
    }

    public function testValidateLoginWithEmptyUsername(): void
    {
        $input = [
            'username' => '',
            'password' => 'password123',
        ];

        $errors = $this->validator->validateLogin($input);

        $this->assertArrayHasKey('general', $errors);
        $this->assertEquals('Every information is necessary!', $errors['general']);
    }

    public function testValidateLoginWithEmptyPassword(): void
    {
        $input = [
            'username' => 'testuser',
            'password' => '',
        ];

        $errors = $this->validator->validateLogin($input);

        $this->assertArrayHasKey('general', $errors);
        $this->assertEquals('Every information is necessary!', $errors['general']);
    }

    public function testValidateLoginWithForbiddenCharacters(): void
    {
        $input = [
            'username' => 'test<script>',
            'password' => 'password123',
        ];

        $errors = $this->validator->validateLogin($input);

        $this->assertArrayHasKey('general', $errors);
        $this->assertEquals('Fields contain forbidden characters!', $errors['general']);
    }

    public function testValidateSignupWithValidInput(): void
    {
        $this->mockUserRepo->method('usernameExists')->willReturn(false);
        $this->mockUserRepo->method('emailExists')->willReturn(false);

        $input = [
            'first_name' => 'John',
            'last_name' => 'DoeSmith', // Must be at least 5 characters
            'username' => 'johndoe', // Must not contain spaces or forbidden chars
            'email' => 'john@example.com',
            'password' => 'password123', // Must not contain spaces or forbidden chars
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertEmpty($errors);
    }

    public function testValidateSignupWithShortFirstName(): void
    {
        $input = [
            'first_name' => 'Jo',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('first_name', $errors);
        $this->assertStringContainsString('at least 3 characters', $errors['first_name']);
    }

    public function testValidateSignupWithNonAlphaFirstName(): void
    {
        $input = [
            'first_name' => 'John123',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('first_name', $errors);
        $this->assertStringContainsString('only enter text', $errors['first_name']);
    }

    public function testValidateSignupWithShortLastName(): void
    {
        $input = [
            'first_name' => 'John',
            'last_name' => 'Do',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('last_name', $errors);
        $this->assertStringContainsString('at least 5 characters', $errors['last_name']);
    }

    public function testValidateSignupWithShortPassword(): void
    {
        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'pass',
            'cPassword' => 'pass',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('password', $errors);
        $this->assertStringContainsString('at least 5 characters', $errors['password']);
    }

    public function testValidateSignupWithPasswordMismatch(): void
    {
        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password456',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('cPassword', $errors);
        $this->assertEquals('Wrong reentered password.', $errors['cPassword']);
    }

    public function testValidateSignupWithShortUsername(): void
    {
        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'john',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('username', $errors);
        $this->assertStringContainsString('at least 5 characters', $errors['username']);
    }

    public function testValidateSignupWithExistingUsername(): void
    {
        $this->mockUserRepo->method('usernameExists')->willReturn(true);

        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'existinguser',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('username', $errors);
        $this->assertEquals('Username already exist.', $errors['username']);
    }

    public function testValidateSignupWithInvalidEmail(): void
    {
        $this->mockUserRepo->method('usernameExists')->willReturn(false);
        $this->mockUserRepo->method('emailExists')->willReturn(false);

        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'invalid-email',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('email', $errors);
        $this->assertStringContainsString('valid email', $errors['email']);
    }

    public function testValidateSignupWithExistingEmail(): void
    {
        $this->mockUserRepo->method('usernameExists')->willReturn(false);
        $this->mockUserRepo->method('emailExists')->willReturn(true);

        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('email', $errors);
        $this->assertEquals('Email already exist.', $errors['email']);
    }

    public function testValidateSignupWithMissingCountry(): void
    {
        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => '',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('country', $errors);
        $this->assertEquals('You did not choose a country.', $errors['country']);
    }

    public function testValidateSignupWithShortCity(): void
    {
        $input = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'cPassword' => 'password123',
            'country' => 'Serbia',
            'city' => 'Be',
        ];

        $errors = $this->validator->validateSignup($input);

        $this->assertArrayHasKey('city', $errors);
        $this->assertStringContainsString('at least 3 characters', $errors['city']);
    }
}
