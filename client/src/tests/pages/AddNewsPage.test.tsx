import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AddNewsPage from '../../pages/AddNewsPage'
import { api } from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../config/api')
vi.mock('../../contexts/AuthContext')
vi.mock('../../utils/logger', () => ({
  default: {
    logInput: vi.fn(),
  },
}))
vi.mock('../../utils/errorHandler', () => ({
  default: {
    handleError: vi.fn(),
  },
}))

describe('AddNewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 1, username: 'admin', info: 'Admin User', status: 'Administrator' },
      token: 'token',
      isAdmin: true,
    })
    vi.mocked(api.get).mockResolvedValue({
      categories: [{ news_type_id: 1, type: 'Sport' }],
    })
  })

  it('should reject angle brackets in headlines and article text', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <AddNewsPage />
      </BrowserRouter>
    )

    await user.type(screen.getByPlaceholderText('Headline'), 'Headline <tag>')
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.type(screen.getByPlaceholderText('Add text'), 'Article > text')
    await user.click(screen.getByRole('button', { name: /add article/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Headline cannot contain the characters: < >')).not.toHaveLength(0)
      expect(screen.getAllByText('Article cannot contain the characters: < >')).not.toHaveLength(0)
    })
    expect(api.post).not.toHaveBeenCalled()
  })
})
