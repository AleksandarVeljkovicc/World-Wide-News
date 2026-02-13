import { describe, it, expect } from 'vitest'
import {
  validateForbiddenChars,
  getForbiddenCharsError,
  sanitizeString,
  validateEmail,
  validateMinLength,
  validateAlphaOnly,
} from '../../validation/InputValidator'

describe('InputValidator', () => {
  describe('validateForbiddenChars', () => {
    it('should return true for valid strings', () => {
      expect(validateForbiddenChars('hello world')).toBe(true)
      expect(validateForbiddenChars('test123')).toBe(true)
      expect(validateForbiddenChars('user@example.com')).toBe(true)
    })

    it('should return false for strings containing <', () => {
      expect(validateForbiddenChars('hello<world')).toBe(false)
      expect(validateForbiddenChars('<script>')).toBe(false)
    })

    it('should return false for strings containing >', () => {
      expect(validateForbiddenChars('hello>world')).toBe(false)
      expect(validateForbiddenChars('</script>')).toBe(false)
    })

    it('should return false for strings containing apostrophe', () => {
      expect(validateForbiddenChars("hello'world")).toBe(false)
      expect(validateForbiddenChars("it's")).toBe(false)
    })

    it('should return false for strings containing multiple forbidden chars', () => {
      expect(validateForbiddenChars("hello<'world>")).toBe(false)
    })
  })

  describe('getForbiddenCharsError', () => {
    it('should return correct error message', () => {
      expect(getForbiddenCharsError('Username')).toBe(
        'Username cannot contain the characters: < > \''
      )
      expect(getForbiddenCharsError('Comment')).toBe(
        'Comment cannot contain the characters: < > \''
      )
    })
  })

  describe('sanitizeString', () => {
    it('should remove forbidden characters', () => {
      expect(sanitizeString('hello<world')).toBe('helloworld')
      expect(sanitizeString('test>string')).toBe('teststring')
      expect(sanitizeString("it's")).toBe('its')
      expect(sanitizeString('hello"world')).toBe('helloworld')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('')
    })

    it('should handle strings with multiple forbidden chars', () => {
      expect(sanitizeString("hello<'world>")).toBe('helloworld')
    })
  })

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.email@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.com')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('user space@example.com')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validateMinLength', () => {
    it('should return true for strings meeting minimum length', () => {
      expect(validateMinLength('hello', 3)).toBe(true)
      expect(validateMinLength('test', 4)).toBe(true)
      expect(validateMinLength('  hello  ', 3)).toBe(true) // trimmed
    })

    it('should return false for strings below minimum length', () => {
      expect(validateMinLength('hi', 3)).toBe(false)
      expect(validateMinLength('', 1)).toBe(false)
      expect(validateMinLength('  a  ', 3)).toBe(false) // trimmed to 1 char
    })

    it('should handle edge cases', () => {
      expect(validateMinLength('exact', 5)).toBe(true)
      expect(validateMinLength('short', 6)).toBe(false)
    })
  })

  describe('validateAlphaOnly', () => {
    it('should return true for alphabetic strings', () => {
      expect(validateAlphaOnly('hello')).toBe(true)
      expect(validateAlphaOnly('WORLD')).toBe(true)
      expect(validateAlphaOnly('HelloWorld')).toBe(true)
      expect(validateAlphaOnly('  hello  ')).toBe(true) // trimmed
    })

    it('should return false for strings with numbers', () => {
      expect(validateAlphaOnly('hello123')).toBe(false)
      expect(validateAlphaOnly('test1')).toBe(false)
    })

    it('should return false for strings with special characters', () => {
      expect(validateAlphaOnly('hello-world')).toBe(false)
      expect(validateAlphaOnly('test@')).toBe(false)
      expect(validateAlphaOnly('hello world')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(validateAlphaOnly('')).toBe(false)
    })
  })
})
