import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth, AuthProvider } from '../../contexts/AuthContext'
import { api } from '../../config/api'

// Mock API
vi.mock('../../config/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  describe('login', () => {
    it('should store token in localStorage when remember is true', async () => {
      const mockToken = 'test-token-123'
      const mockUser = {
        id: 1,
        username: 'testuser',
        info: 'Test User',
        status: 'User',
      }

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        token: mockToken,
        user: mockUser,
      })

      // Mock /auth/me call that happens after token is set
      vi.mocked(api.get).mockResolvedValue({
        user_id: 1,
        username: 'testuser',
        name: 'Test',
        last_name: 'User',
        status: 'User',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('testuser', 'password', true)
      })

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe(mockToken)
      })

      await waitFor(() => {
        expect(result.current.token).toBe(mockToken)
      })

      expect(sessionStorage.getItem('token')).toBeNull()
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should store token in sessionStorage when remember is false', async () => {
      const mockToken = 'test-token-456'
      const mockUser = {
        id: 1,
        username: 'testuser',
        info: 'Test User',
        status: 'User',
      }

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        token: mockToken,
        user: mockUser,
      })

      // Mock /auth/me call that happens after token is set
      vi.mocked(api.get).mockResolvedValue({
        user_id: 1,
        username: 'testuser',
        name: 'Test',
        last_name: 'User',
        status: 'User',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('testuser', 'password', false)
      })

      await waitFor(() => {
        expect(sessionStorage.getItem('token')).toBe(mockToken)
      })

      await waitFor(() => {
        expect(result.current.token).toBe(mockToken)
      })

      expect(localStorage.getItem('token')).toBeNull()
    })

    it('should throw error on failed login', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        result.current.login('testuser', 'wrongpass', false)
      ).rejects.toThrow('Invalid credentials')
    })

    it('should clear existing tokens before storing new one', async () => {
      localStorage.setItem('token', 'old-token')
      sessionStorage.setItem('token', 'old-session-token')

      const mockToken = 'new-token'
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        token: mockToken,
        user: { id: 1, username: 'test', info: 'Test', status: 'User' },
      })

      // Mock /auth/me call
      vi.mocked(api.get).mockResolvedValue({
        user_id: 1,
        username: 'test',
        name: 'Test',
        last_name: 'User',
        status: 'User',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('testuser', 'password', true)
      })

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe(mockToken)
      })

      expect(sessionStorage.getItem('token')).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear token from both storages', async () => {
      localStorage.setItem('token', 'test-token')
      sessionStorage.setItem('token', 'test-session-token')

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.token).toBe('test-token')
      })

      await act(() => {
        result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.token).toBeNull()
      })

      expect(localStorage.getItem('token')).toBeNull()
      expect(sessionStorage.getItem('token')).toBeNull()
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        message: 'Account created successfully',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        result.current.register({
          username: 'newuser',
          password: 'password123',
          cPassword: 'password123',
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
          country: 'Serbia',
        })
      ).resolves.not.toThrow()
    })

    it('should throw error on failed registration', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: false,
        errors: { username: 'Username already exists' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        result.current.register({
          username: 'existinguser',
          password: 'password123',
          cPassword: 'password123',
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
          country: 'Serbia',
        })
      ).rejects.toEqual({ username: 'Username already exists' })
    })
  })

  describe('loadUser', () => {
    it('should load user data when token exists', async () => {
      localStorage.setItem('token', 'valid-token')

      vi.mocked(api.get).mockResolvedValue({
        user_id: 1,
        username: 'testuser',
        name: 'Test',
        last_name: 'User',
        status: 'User',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(result.current.user?.username).toBe('testuser')
      expect(result.current.user?.info).toBe('Test User')
    })

    it('should clear token on invalid token', async () => {
      localStorage.setItem('token', 'invalid-token')

      vi.mocked(api.get).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('isAdmin', () => {
    it('should return true for Administrator status', async () => {
      localStorage.setItem('token', 'admin-token')

      vi.mocked(api.get).mockResolvedValue({
        user_id: 1,
        username: 'admin',
        name: 'Admin',
        last_name: 'User',
        status: 'Administrator',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true)
      })
    })

    it('should return false for non-admin status', async () => {
      localStorage.setItem('token', 'user-token')

      vi.mocked(api.get).mockResolvedValue({
        user_id: 1,
        username: 'user',
        name: 'Regular',
        last_name: 'User',
        status: 'User',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false)
      })
    })
  })
})
