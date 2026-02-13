import { describe, it, expect, beforeEach, vi } from 'vitest'
import ErrorHandler from '../../utils/errorHandler'

describe('ErrorHandler', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('handleError', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error')
      const result = ErrorHandler.handleError(error, { action: 'test' })
      expect(result).toBe('Test error')
    })

    it('should handle error objects with error property', () => {
      const error = { error: 'API error', status: 400 }
      const result = ErrorHandler.handleError(error, { action: 'test' })
      expect(result).toBe('API error')
    })

    it('should return default message for unknown errors', () => {
      const error = { unknown: 'property' }
      const result = ErrorHandler.handleError(error, { action: 'test' })
      expect(result).toBe('An unexpected error occurred')
    })

    it('should handle string errors', () => {
      const error = 'String error'
      const result = ErrorHandler.handleError(error, { action: 'test' })
      expect(result).toBe('An unexpected error occurred')
    })

    it('should store errors in localStorage', () => {
      const error = new Error('Test error')
      ErrorHandler.handleError(error, { action: 'test' })
      
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].message).toBe('Test error')
      expect(errors[0].context).toEqual({ action: 'test' })
    })

    it('should limit errors to 100 entries', () => {
      for (let i = 0; i < 101; i++) {
        ErrorHandler.handleError(new Error(`Error ${i}`), { index: i })
      }
      
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      expect(errors).toHaveLength(100)
      expect(errors[0].message).toBe('Error 1') // First entry removed
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const error = new Error('Test error')
      ErrorHandler.handleError(error, { action: 'test' })
      
      ErrorHandler.clearErrors()
      const errors = localStorage.getItem('app_errors')
      expect(errors).toBeNull()
    })
  })
})
