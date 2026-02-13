import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../../pages/LoginPage'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../contexts/AuthContext')
vi.mock('../../utils/logger', () => ({
  default: {
    logInput: vi.fn(),
  },
}))
vi.mock('../../utils/errorHandler', () => ({
  default: {
    handleError: vi.fn((err) => err instanceof Error ? err.message : String(err)),
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

describe('LoginPage', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: not authenticated
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      token: null,
      isAdmin: false,
    })
  })

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    // React Bootstrap Form.Check renders checkbox differently, use text content
    expect(screen.getByText('Remember me')).toBeInTheDocument()
    const checkbox = screen.getByText('Remember me').closest('div')?.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sing in/i })).toBeInTheDocument()
  })

  it('should navigate away if already authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 1, username: 'test', info: 'Test', status: 'User' },
      token: 'token',
      isAdmin: false,
    })

    const { container } = render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    // Component returns null when authenticated, so container should be empty
    expect(container.firstChild).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('should handle form submission with remember me unchecked', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    await user.type(screen.getByPlaceholderText('Username'), 'testuser')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sing in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123', false)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('should handle form submission with remember me checked', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    await user.type(screen.getByPlaceholderText('Username'), 'testuser')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    // Find checkbox by finding the input near "Remember me" text
    const rememberMeText = screen.getByText('Remember me')
    const checkbox = rememberMeText.closest('div')?.querySelector('input[type="checkbox"]') as HTMLInputElement
    if (checkbox) {
      await user.click(checkbox)
    }
    await user.click(screen.getByRole('button', { name: /sing in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123', true)
    })
  })

  it('should display error message on login failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockLogin.mockRejectedValue(new Error(errorMessage))

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    await user.type(screen.getByPlaceholderText('Username'), 'testuser')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sing in/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    await user.type(screen.getByPlaceholderText('Username'), 'testuser')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    const submitButton = screen.getByRole('button', { name: /sing in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('should require username and password', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')

    expect(usernameInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })
})
