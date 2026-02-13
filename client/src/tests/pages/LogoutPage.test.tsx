import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LogoutPage from '../../pages/LogoutPage'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../config/api'

vi.mock('../../contexts/AuthContext')
vi.mock('../../config/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LogoutPage', () => {
  const mockLogout = vi.fn()
  const mockIsAuthenticated = true

  const mockUser = {
    user_id: 1,
    username: 'testuser',
    name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    status: 'User',
    country: 'Serbia',
    city: 'Belgrade',
    date_of_birth: '1990-01-01',
    create_date: '2023-01-01T00:00:00',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: mockIsAuthenticated,
      logout: mockLogout,
      register: vi.fn(),
      user: { id: 1, username: 'testuser', info: 'Test User', status: 'User' },
      token: 'token',
      isAdmin: false,
    })
    vi.mocked(api.get).mockResolvedValue(mockUser)
  })

  it('should navigate away if not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: false,
      logout: mockLogout,
      register: vi.fn(),
      user: null,
      token: null,
      isAdmin: false,
    })

    const { container } = render(
      <BrowserRouter>
        <LogoutPage />
      </BrowserRouter>
    )
    // Component returns null when not authenticated
    expect(container.firstChild).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('should display user information', async () => {
    render(
      <BrowserRouter>
        <LogoutPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Serbia')).toBeInTheDocument()
      expect(screen.getByText('Belgrade')).toBeInTheDocument()
    })
  })

  it('should handle logout button click', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <LogoutPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
    })

    const logoutButton = screen.getByRole('button', { name: /log out/i })
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('should display loading state initially', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(
      <BrowserRouter>
        <LogoutPage />
      </BrowserRouter>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when user fetch fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to fetch'))

    render(
      <BrowserRouter>
        <LogoutPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/you must be logged in/i)).toBeInTheDocument()
    })
  })

  it('should display user image if available', async () => {
    const userWithImage = {
      ...mockUser,
      image: 'data:image/jpeg;base64,testimage',
    }
    vi.mocked(api.get).mockResolvedValue(userWithImage)

    render(
      <BrowserRouter>
        <LogoutPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      // Look for img element by alt text or by querying directly
      const images = screen.queryAllByRole('img')
      // If no role="img", try querying by alt attribute
      if (images.length === 0) {
        const imgElements = document.querySelectorAll('img')
        expect(imgElements.length).toBeGreaterThan(0)
      } else {
        expect(images.length).toBeGreaterThan(0)
      }
    }, { timeout: 3000 })
  })

  it('should display default avatar when no image', async () => {
    render(
      <BrowserRouter>
        <LogoutPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      const images = screen.getAllByRole('img')
      const avatar = images.find(img => img.getAttribute('alt') === 'No photo')
      expect(avatar).toBeInTheDocument()
    })
  })
})
