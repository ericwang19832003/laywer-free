import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'

const syncMockState = vi.hoisted(() => ({
  updateLessonProgress: vi.fn(),
  completeLesson: vi.fn(),
  progress: null as {
    lessonProgress: Record<string, {
      currentSection: number
      answers: Record<number, number>
      submitted: boolean
      completed: boolean
      updatedAt: string | null
    }>
  } | null,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/hooks/use-progress-sync', () => ({
  useProgressSync: () => ({
    progress: syncMockState.progress,
    updateLessonProgress: syncMockState.updateLessonProgress,
    completeLesson: syncMockState.completeLesson,
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

import { LessonPlayer } from '@/components/education/lesson-player'
import { LEARN_TOPICS } from '@/lib/education/learn-topics'

const basicsTopic = LEARN_TOPICS[0]

describe('LessonPlayer', () => {
  beforeEach(() => {
    syncMockState.progress = null
    syncMockState.updateLessonProgress.mockClear()
    syncMockState.completeLesson.mockClear()
  })

  it('advances through lesson sections', () => {
    render(<LessonPlayer topic={basicsTopic} topics={LEARN_TOPICS} />)

    expect(screen.getByText(/section 1 of/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^overview$/i)[0]).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next section/i }))

    expect(screen.getByText(/section 2 of/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^real-world example$/i)[0]).toBeInTheDocument()
  })

  it('resumes saved progress for a topic', () => {
    syncMockState.progress = {
      lessonProgress: {
        basics: {
          currentSection: 2,
          answers: {},
          submitted: false,
          completed: false,
          updatedAt: '2026-03-22T00:00:00.000Z',
        },
      },
    }

    render(<LessonPlayer topic={basicsTopic} topics={LEARN_TOPICS} />)

    expect(screen.getByText(/section 3 of/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^practical checklist$/i)[0]).toBeInTheDocument()
  })

  it('grades the quick check and shows explanations', () => {
    syncMockState.progress = {
      lessonProgress: {
        basics: {
          currentSection: 5,
          answers: {},
          submitted: false,
          completed: false,
          updatedAt: '2026-03-22T00:00:00.000Z',
        },
      },
    }

    render(<LessonPlayer topic={basicsTopic} topics={LEARN_TOPICS} />)

    expect(screen.getAllByText(/^quick check$/i)[0]).toBeInTheDocument()
    const firstQuestion = screen.getByTestId('lesson-question-0')
    const secondQuestion = screen.getByTestId('lesson-question-1')

    fireEvent.click(within(firstQuestion).getByRole('button', { name: /jurisdiction is about court power/i }))
    fireEvent.click(within(secondQuestion).getByRole('button', { name: /because it was filed in the wrong court/i }))
    fireEvent.click(screen.getByRole('button', { name: /grade quick check/i }))

    expect(screen.getByText(/score: 2\/2/i)).toBeInTheDocument()
    expect(screen.getByText(/jurisdiction asks whether the court can hear the case/i)).toBeInTheDocument()
    expect(syncMockState.completeLesson).toHaveBeenCalledWith('basics')
  })
})
