<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

// Set up test environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/';
$_GET = [];
$_POST = [];
$_FILES = [];

// Mock database connection for testing
// In real tests, you would use a test database or mock the database interface
