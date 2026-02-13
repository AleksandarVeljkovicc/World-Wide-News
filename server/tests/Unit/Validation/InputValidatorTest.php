<?php

declare(strict_types=1);

namespace Tests\Unit\Validation;

use PHPUnit\Framework\TestCase;
use Validation\InputValidator;

class InputValidatorTest extends TestCase
{
    public function testValidStringWithValidInput(): void
    {
        // validString checks for: =, space, (, ), ', ", <, >
        $this->assertTrue(InputValidator::validString('hello'));
        $this->assertTrue(InputValidator::validString('test123'));
        $this->assertTrue(InputValidator::validString('user@example.com'));
    }

    public function testValidStringWithForbiddenCharacters(): void
    {
        $this->assertFalse(InputValidator::validString('hello<script>'));
        $this->assertFalse(InputValidator::validString('test>world'));
        $this->assertFalse(InputValidator::validString("it's"));
        $this->assertFalse(InputValidator::validString('hello world')); // space is forbidden
        $this->assertFalse(InputValidator::validString('test=value')); // = is forbidden
        $this->assertFalse(InputValidator::validString('test(value)')); // parentheses are forbidden
    }

    public function testContainsForbiddenChars(): void
    {
        $this->assertTrue(InputValidator::containsForbiddenChars('hello<script>'));
        $this->assertTrue(InputValidator::containsForbiddenChars('test>world'));
        $this->assertTrue(InputValidator::containsForbiddenChars("it's"));
        $this->assertFalse(InputValidator::containsForbiddenChars('hello world'));
    }

    public function testSanitizeString(): void
    {
        // sanitizeString uses htmlspecialchars, so it converts to HTML entities
        $this->assertEquals('hello&lt;world', InputValidator::sanitizeString('hello<world'));
        $this->assertEquals('test&gt;string', InputValidator::sanitizeString('test>string'));
        $this->assertEquals('it&#039;s', InputValidator::sanitizeString("it's"));
        $this->assertEquals('hello', InputValidator::sanitizeString('  hello  '));
    }

    public function testSanitizeStringWithMultipleForbiddenChars(): void
    {
        // htmlspecialchars converts all forbidden chars to HTML entities
        $this->assertEquals('hello&lt;&#039;world&gt;', InputValidator::sanitizeString("hello<'world>"));
    }

    public function testSanitizeStringWithNull(): void
    {
        $this->assertEquals('', InputValidator::sanitizeString(null));
    }
}
