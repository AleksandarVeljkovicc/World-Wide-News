import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import SignupPage from '../../pages/SignupPage'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../contexts/AuthContext')
vi.mock('../../utils/logger', () => ({
  default: {
    logInput: vi.fn(),
  },
}))

describe('SignupPage', () => {
  const mockRegister = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: false,
      logout: vi.fn(),
      register: mockRegister,
      user: null,
      token: null,
      isAdmin: false,
    })
  })

  it('should allow apostrophes in registration inputs', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue(undefined)

    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    await user.type(screen.getByPlaceholderText('Username'), "user'name")
    await user.type(screen.getByPlaceholderText('Password'), "pass'word")
    await user.type(screen.getByPlaceholderText('Confirm password'), "pass'word")
    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com')
    await user.type(screen.getByPlaceholderText('First name'), 'O\'Connor')
    await user.type(screen.getByPlaceholderText('Last name'), 'Smith')
    await user.selectOptions(screen.getByRole('combobox'), 'Serbia')
    await user.click(screen.getByRole('button', { name: /sing up/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "user'name",
          password: "pass'word",
          first_name: "O'Connor",
        })
      )
    })
  })
})
