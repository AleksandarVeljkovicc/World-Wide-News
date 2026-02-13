import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import NewsPage from '../../pages/NewsPage'
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  }
})

describe('NewsPage', () => {
  const mockArticle = {
    news_id: 1,
    headline: 'Test Article',
    text: 'Article content here',
    type: 'Sport',
    published: '2023-01-01T00:00:00',
    views: 100,
    name: 'John',
    last_name: 'Doe',
  }

  const mockComments = [
    {
      comments_id: 1,
      news_id: 1,
      comment: 'Great article!',
      date: '2023-01-01T10:00:00',
      name: 'Jane',
      last_name: 'Smith',
      user_id: 2,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: false,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      token: null,
      isAdmin: false,
    })
  })

  it('should display loading state initially', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display article content after loading', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: [] })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument()
      expect(screen.getByText('Article content here')).toBeInTheDocument()
    })
  })

  it('should display "Article not found" when article does not exist', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Not found'))

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Article not found.')).toBeInTheDocument()
    })
  })

  it('should display comments', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: mockComments })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Great article!')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('should not show comment form when not authenticated', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: [] })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Comment')).not.toBeInTheDocument()
    })
  })

  it('should show comment form when authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 1, username: 'test', info: 'Test User', status: 'User' },
      token: 'token',
      isAdmin: false,
    })

    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: [] })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Comment')).toBeInTheDocument()
    })
  })

  it('should handle comment submission', async () => {
    const user = userEvent.setup()
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 1, username: 'test', info: 'Test User', status: 'User' },
      token: 'token',
      isAdmin: false,
    })

    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: [] })
      .mockResolvedValueOnce({ comments: [] })

    vi.mocked(api.post).mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Comment')).toBeInTheDocument()
    })

    const commentInput = screen.getByPlaceholderText('Comment')
    await user.type(commentInput, 'Test comment')
    await user.click(screen.getByRole('button', { name: /comment/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/news/1/comments', {
        comment: 'Test comment',
      })
    })
  })

  it('should validate comment length', async () => {
    const user = userEvent.setup()
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 1, username: 'test', info: 'Test User', status: 'User' },
      token: 'token',
      isAdmin: false,
    })

    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: [] })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Comment')).toBeInTheDocument()
    })

    const commentInput = screen.getByPlaceholderText('Comment')
    await user.type(commentInput, 'A')
    await user.click(screen.getByRole('button', { name: /comment/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Comment cannot be less than 2 characters.')
      ).toBeInTheDocument()
    })
  })

  it('should allow admin to delete any comment', async () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 1, username: 'admin', info: 'Admin User', status: 'Administrator' },
      token: 'token',
      isAdmin: true,
    })

    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: mockComments })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Remove comment')).toBeInTheDocument()
    })
  })

  it('should allow users to delete only their own comments', async () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 2, username: 'jane', info: 'Jane Smith', status: 'User' },
      token: 'token',
      isAdmin: false,
    })

    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: mockComments })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Remove comment')).toBeInTheDocument()
    })
  })

  it('should not allow users to delete other users comments', async () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      logout: vi.fn(),
      register: vi.fn(),
      user: { id: 3, username: 'other', info: 'Other User', status: 'User' },
      token: 'token',
      isAdmin: false,
    })

    vi.mocked(api.get)
      .mockResolvedValueOnce(mockArticle)
      .mockResolvedValueOnce({ comments: mockComments })

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Remove comment')).not.toBeInTheDocument()
    })
  })
})
