import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from '../../config/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('getStoredToken', () => {
    it('should get token from localStorage', async () => {
      localStorage.setItem('token', 'local-token')
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      await api.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer local-token',
          }),
        })
      )
    })

    it('should get token from sessionStorage when localStorage is empty', async () => {
      sessionStorage.setItem('token', 'session-token')
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      await api.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer session-token',
          }),
        })
      )
    })

    it('should not include Authorization header when no token', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      await api.get('/test')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const headers = callArgs[1]?.headers as HeadersInit
      expect(headers).not.toHaveProperty('Authorization')
    })
  })

  describe('request', () => {
    it('should make GET request', async () => {
      const mockData = { id: 1, name: 'test' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await api.get<typeof mockData>('/test')

      expect(fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })

    it('should make POST request with body', async () => {
      const requestData = { username: 'test', password: 'pass' }
      const responseData = { success: true }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => responseData,
      } as Response)

      const result = await api.post('/test', requestData)

      expect(fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        })
      )
      expect(result).toEqual(responseData)
    })

    it('should throw error on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request' }),
      } as Response)

      await expect(api.get('/test')).rejects.toEqual({
        status: 400,
        error: 'Bad Request',
      })
    })

    it('should handle JSON parse errors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as Response)

      const result = await api.get('/test')
      expect(result).toEqual({})
    })
  })
})
