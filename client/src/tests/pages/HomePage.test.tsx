import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../utils/testUtils'
import HomePage from '../../pages/HomePage'
import { api } from '../../config/api'

vi.mock('../../config/api')
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

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({}),
  }
})

describe('HomePage', () => {
  const mockNews = [
    {
      news_id: 1,
      headline: 'Test News Article',
      type: 'Sport',
      published: '2023-01-01T00:00:00',
      views: 100,
      image: 'data:image/jpeg;base64,test',
    },
    {
      news_id: 2,
      headline: 'Another News Article',
      type: 'Politics',
      published: '2023-01-02T00:00:00',
      views: 50,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<HomePage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display news articles after loading', async () => {
    vi.mocked(api.get).mockResolvedValue({ news: mockNews })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Test News Article')).toBeInTheDocument()
      expect(screen.getByText('Another News Article')).toBeInTheDocument()
    })
  })

  it('should display "Latest news" title when no category', async () => {
    vi.mocked(api.get).mockResolvedValue({ news: mockNews })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Latest news')).toBeInTheDocument()
    })
  })

  it('should display "No news found" when empty', async () => {
    vi.mocked(api.get).mockResolvedValue({ news: [] })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('No news found.')).toBeInTheDocument()
    })
  })

  it('should truncate long headlines', async () => {
    const longHeadline = 'A'.repeat(200)
    vi.mocked(api.get).mockResolvedValue({
      news: [
        {
          news_id: 1,
          headline: longHeadline,
          type: 'Sport',
          published: '2023-01-01T00:00:00',
          views: 100,
        },
      ],
    })

    render(<HomePage />)

    await waitFor(() => {
      const displayedText = screen.getByText(/^A{150}\.\.\.$/)
      expect(displayedText).toBeInTheDocument()
    })
  })

  it('should display category tag', async () => {
    vi.mocked(api.get).mockResolvedValue({ news: mockNews })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Sport')).toBeInTheDocument()
      expect(screen.getByText('Politics')).toBeInTheDocument()
    })
  })
})
