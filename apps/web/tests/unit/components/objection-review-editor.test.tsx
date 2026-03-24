import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ObjectionReviewEditor } from '@/components/objections/objection-review-editor'

// ── Mocks ────────────────────────────────────────

const mockRefresh = vi.fn()
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh, push: mockPush }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// ── Fixtures ─────────────────────────────────────

const makeReview = (overrides = {}) => ({
  id: 'review-001',
  case_id: 'case-001',
  pack_id: 'pack-001',
  response_id: 'resp-001',
  status: 'needs_review',
  model: 'gpt-4o-mini',
  prompt_version: '1.0.0',
  error: null,
  created_at: '2026-02-25T12:00:00Z',
  ...overrides,
})

const makeItem = (overrides = {}) => ({
  id: 'item-001',
  review_id: 'review-001',
  item_type: 'rfp',
  item_no: 1,
  labels: ['relevance', 'overbroad'],
  neutral_summary: 'Respondent objects on relevance and overbreadth grounds.',
  follow_up_flag: false,
  confidence: 0.85,
  status: 'pending',
  created_at: '2026-02-25T12:00:00Z',
  ...overrides,
})

const defaultProps = {
  caseId: 'case-001',
  packId: 'pack-001',
  review: makeReview(),
  initialItems: [
    makeItem(),
    makeItem({
      id: 'item-002',
      item_type: 'rog',
      item_no: 3,
      labels: ['vague_ambiguous'],
      neutral_summary: 'Objects as vague and ambiguous.',
      follow_up_flag: true,
      confidence: 0.6,
    }),
  ],
}

// ── Tests ────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn()
})

describe('ObjectionReviewEditor', () => {
  describe('rendering', () => {
    it('shows the disclaimer box', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      expect(screen.getByText('For organization only. Not legal advice.')).toBeInTheDocument()
    })

    it('displays item count', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      expect(screen.getByText('Objections (2)')).toBeInTheDocument()
    })

    it('displays item titles with type and number', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      expect(screen.getByText('RFP #1')).toBeInTheDocument()
      // ROG #3 appears both in the card and the follow-up panel (since it has follow_up_flag=true)
      const rogTexts = screen.getAllByText('ROG #3')
      expect(rogTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('shows "Unnumbered section" when item_no is null', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem({ item_no: null, item_type: 'unknown' })]}
        />
      )
      expect(screen.getByText('Unnumbered section')).toBeInTheDocument()
    })

    it('shows active labels as selected', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      // The first item has 'relevance' and 'overbroad'
      const relevanceButtons = screen.getAllByText('Relevance')
      expect(relevanceButtons.length).toBeGreaterThan(0)
    })

    it('shows neutral summaries in textareas', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas[0]).toHaveValue('Respondent objects on relevance and overbreadth grounds.')
      expect(textareas[1]).toHaveValue('Objects as vague and ambiguous.')
    })

    it('shows confidence levels', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      expect(screen.getByText('High confidence')).toBeInTheDocument()
      expect(screen.getByText('Medium confidence')).toBeInTheDocument()
    })

    it('shows the Confirm & Save button', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Confirm & Save' })).toBeInTheDocument()
    })

    it('shows back link', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      const backLink = screen.getByText('Back to discovery pack')
      expect(backLink.closest('a')).toHaveAttribute(
        'href',
        '/case/case-001/discovery/packs/pack-001'
      )
    })
  })

  describe('follow-up panel', () => {
    it('shows follow-up summary when items are flagged', () => {
      render(<ObjectionReviewEditor {...defaultProps} />)
      expect(screen.getByText('Items flagged for follow-up (1)')).toBeInTheDocument()
    })

    it('does not show follow-up panel when no items are flagged', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem({ follow_up_flag: false })]}
        />
      )
      expect(screen.queryByText(/Items flagged for follow-up/)).not.toBeInTheDocument()
    })
  })

  describe('label toggling', () => {
    it('can add a label by clicking an unselected one', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem({ labels: ['relevance'] })]}
        />
      )
      // Click 'Privilege' to add it
      const privilegeButton = screen.getByRole('button', { name: 'Privilege' })
      fireEvent.click(privilegeButton)
      expect(privilegeButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('can remove a label (keeping at least one)', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem({ labels: ['relevance', 'overbroad'] })]}
        />
      )
      // Remove 'Overbroad'
      const overbroadButton = screen.getByRole('button', { name: 'Overbroad' })
      fireEvent.click(overbroadButton)
      expect(overbroadButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('prevents removing the last label', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem({ labels: ['relevance'] })]}
        />
      )
      // Try to remove the only label
      const relevanceButton = screen.getByRole('button', { name: 'Relevance' })
      fireEvent.click(relevanceButton)
      // Should still be pressed
      expect(relevanceButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('summary editing', () => {
    it('can update the neutral summary text', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem()]}
        />
      )
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Updated summary.' } })
      expect(textarea).toHaveValue('Updated summary.')
    })
  })

  describe('follow-up toggling', () => {
    it('can toggle follow-up flag on', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem({ follow_up_flag: false })]}
        />
      )
      // Initially no follow-up panel
      expect(screen.queryByText(/Items flagged for follow-up/)).not.toBeInTheDocument()

      // Click the toggle
      const checkbox = screen.getByRole('checkbox', { name: /follow-up/i })
      fireEvent.click(checkbox)

      // Now the follow-up panel appears
      expect(screen.getByText('Items flagged for follow-up (1)')).toBeInTheDocument()
    })
  })

  describe('confirm flow', () => {
    it('sends correct payload on confirm', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ review: makeReview({ status: 'completed' }), items: [] }),
      })
      global.fetch = mockFetch

      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem()]}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Confirm & Save' }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/objections/reviews/review-001/confirm',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        )
      })

      // Verify payload shape
      const call = mockFetch.mock.calls[0]
      const body = JSON.parse(call[1].body)
      expect(body.items).toHaveLength(1)
      expect(body.items[0]).toEqual({
        id: 'item-001',
        labels: ['relevance', 'overbroad'],
        neutral_summary: 'Respondent objects on relevance and overbreadth grounds.',
        follow_up_flag: false,
      })
    })

    it('shows confirmed state after successful save', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ review: makeReview({ status: 'completed' }), items: [] }),
      })

      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem()]}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Confirm & Save' }))

      await waitFor(() => {
        expect(screen.getByText('Review confirmed. Your classifications have been saved.')).toBeInTheDocument()
      })
    })

    it('calls router.refresh() after confirm', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ review: makeReview({ status: 'completed' }), items: [] }),
      })

      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem()]}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Confirm & Save' }))

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('shows error message on API failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Review is not ready for confirmation' }),
      })

      render(
        <ObjectionReviewEditor
          {...defaultProps}
          initialItems={[makeItem()]}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Confirm & Save' }))

      await waitFor(() => {
        expect(screen.getByText('Review is not ready for confirmation')).toBeInTheDocument()
      })
    })
  })

  describe('already confirmed state', () => {
    it('shows read-only confirmed view when review is completed', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          review={makeReview({ status: 'completed' })}
        />
      )
      expect(screen.getByText('Review confirmed. Your classifications have been saved.')).toBeInTheDocument()
      // No Confirm button
      expect(screen.queryByRole('button', { name: 'Confirm & Save' })).not.toBeInTheDocument()
    })

    it('shows follow-up badges on confirmed items that are flagged', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          review={makeReview({ status: 'completed' })}
          initialItems={[makeItem({ follow_up_flag: true })]}
        />
      )
      expect(screen.getByText('Follow up')).toBeInTheDocument()
    })

    it('shows generate meet-and-confer button when follow-up items exist', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          review={makeReview({ status: 'completed' })}
          initialItems={[makeItem({ follow_up_flag: true })]}
        />
      )
      expect(screen.getByRole('button', { name: /meet-and-confer/i })).toBeInTheDocument()
    })

    it('does not show meet-and-confer button when no follow-up items', () => {
      render(
        <ObjectionReviewEditor
          {...defaultProps}
          review={makeReview({ status: 'completed' })}
          initialItems={[makeItem({ follow_up_flag: false })]}
        />
      )
      expect(screen.queryByRole('button', { name: /meet-and-confer/i })).not.toBeInTheDocument()
    })
  })

  describe('meet-and-confer generation', () => {
    it('calls generate endpoint on button click', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          draft: { id: 'draft-001', content_text: 'Note content.', subject: 'Meet and Confer' },
        }),
      })

      render(
        <ObjectionReviewEditor
          {...defaultProps}
          review={makeReview({ status: 'completed' })}
          initialItems={[makeItem({ follow_up_flag: true })]}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /meet-and-confer/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/objections/reviews/review-001/meet-and-confer',
          expect.objectContaining({ method: 'POST' })
        )
      })

      // Verify router.refresh was called (state synced after generation)
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('shows error when generation fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'No items flagged for follow-up.' }),
      })

      render(
        <ObjectionReviewEditor
          {...defaultProps}
          review={makeReview({ status: 'completed' })}
          initialItems={[makeItem({ follow_up_flag: true })]}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /meet-and-confer/i }))

      await waitFor(() => {
        expect(screen.getByText('No items flagged for follow-up.')).toBeInTheDocument()
      })
    })
  })
})
