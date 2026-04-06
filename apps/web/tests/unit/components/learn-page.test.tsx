import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import LearnPage from '@/app/(authenticated)/learn/page'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/hooks/use-learning-streak', () => ({
  useLearningStreak: () => ({
    streakData: {
      currentStreak: 0,
      weeklyActivity: [false, false, false, false, false, false, false],
    },
    recordStudy: vi.fn(),
    hasStudiedToday: false,
  }),
  useAchievements: () => ({
    achievements: [],
    unlockedCount: 0,
    totalCount: 0,
  }),
}))

vi.mock('@/hooks/use-progress-sync', () => ({
  useProgressSync: () => ({
    progress: null,
    syncStatus: {
      isSyncing: false,
      pendingChanges: false,
    },
    recordStudySession: vi.fn(),
    recordQuizScore: vi.fn(),
    unlockAchievement: vi.fn(),
    forceSync: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  }),
}))

describe('LearnPage topics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens a topic detail panel when a topic is clicked', () => {
    render(<LearnPage />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /court system basics/i }))

    const dialog = screen.getByRole('dialog')

    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/^overview$/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/court system basics/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/^real-world example$/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/^practical checklist$/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/^key takeaways$/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/^common mistakes$/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/^next steps$/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/^learn the rule$/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /start lesson/i })).toHaveAttribute('href', '/learn/basics')
  })

  it('closes the lesson modal when close is clicked', () => {
    render(<LearnPage />)

    const topicButton = screen.getByRole('button', { name: /court system basics/i })

    fireEvent.click(topicButton)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    fireEvent.click(within(dialog).getAllByRole('button', { name: /close/i })[0])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
