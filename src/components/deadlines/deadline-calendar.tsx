'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  rationale: string | null
  consequence: string | null
  label: string | null
  auto_generated: boolean
}

interface DeadlineCalendarProps {
  deadlines: Deadline[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** Returns the number of days in a given month (0-indexed). */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Returns the day-of-week (0 = Sunday) of the first day of the month. */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/** Convert a Date to a "YYYY-MM-DD" key string (local time). */
function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Get today's date key in local time. */
function getTodayKey(): string {
  return toDateKey(new Date())
}

/** Number of calendar days from today (negative = overdue). */
function daysUntil(dateStr: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dateStr)
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  return Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Return a dot color class based on urgency. */
function getDotColor(days: number): string {
  if (days <= 0) return 'bg-red-500'
  if (days <= 7) return 'bg-amber-500'
  return 'bg-emerald-500'
}

/** Prefer `label` when present; otherwise format the snake_case key. */
function formatLabel(key: string, label: string | null): string {
  if (label) return label
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Human-readable source badge text. */
function formatSource(source: string): string {
  switch (source) {
    case 'user_confirmed':
      return 'Confirmed'
    case 'court_notice':
      return 'Court notice'
    case 'ai_generated':
      return 'AI generated'
    default:
      return source
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
  }
}

/** Format a date key like "March 15, 2026". */
function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeadlineCalendar({ deadlines }: DeadlineCalendarProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const todayKey = getTodayKey()

  // ── Build a lookup: dateKey → Deadline[] ────────────────────────────────
  const deadlinesByDate = new Map<string, Deadline[]>()
  for (const dl of deadlines) {
    const key = toDateKey(new Date(dl.due_at))
    const existing = deadlinesByDate.get(key)
    if (existing) {
      existing.push(dl)
    } else {
      deadlinesByDate.set(key, [dl])
    }
  }

  function getDeadlinesForDate(dateKey: string): Deadline[] {
    return deadlinesByDate.get(dateKey) ?? []
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1)
        return 11
      }
      return prev - 1
    })
    setSelectedDate(null)
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1)
        return 0
      }
      return prev + 1
    })
    setSelectedDate(null)
  }

  function goToToday() {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(null)
  }

  // ── Grid computation ────────────────────────────────────────────────────

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const dayCells: (number | null)[] = []

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(null)
  }
  // Actual day numbers
  for (let d = 1; d <= daysInMonth; d++) {
    dayCells.push(d)
  }

  // ── Selected date popover data ──────────────────────────────────────────

  const deadlinesForSelectedDate = selectedDate
    ? getDeadlinesForDate(selectedDate)
    : []

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header: < Month Year > [Today] */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium text-warm-text min-w-[160px] text-center">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs text-warm-muted mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {dayCells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />
          }

          const m = String(currentMonth + 1).padStart(2, '0')
          const d = String(day).padStart(2, '0')
          const dateKey = `${currentYear}-${m}-${d}`
          const dayDeadlines = getDeadlinesForDate(dateKey)
          const hasDeadlines = dayDeadlines.length > 0
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate

          // Compute unique dot colors for the day's deadlines
          const dotColors = hasDeadlines
            ? [...new Set(dayDeadlines.map((dl) => getDotColor(daysUntil(dl.due_at))))]
            : []

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                if (hasDeadlines) {
                  setSelectedDate(isSelected ? null : dateKey)
                }
              }}
              className={[
                'relative flex flex-col items-center justify-center h-10 rounded-md text-sm transition-colors',
                isToday
                  ? 'ring-2 ring-calm-indigo ring-offset-1 font-semibold text-calm-indigo'
                  : 'text-warm-text',
                isSelected
                  ? 'bg-calm-indigo/10'
                  : hasDeadlines
                    ? 'hover:bg-warm-bg/50 cursor-pointer'
                    : 'cursor-default',
                !hasDeadlines && !isToday ? 'text-warm-muted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="leading-none">{day}</span>
              {hasDeadlines && (
                <div className="flex gap-0.5 justify-center mt-0.5">
                  {dotColors.map((color) => (
                    <div
                      key={color}
                      className={`w-1.5 h-1.5 rounded-full ${color}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date popover */}
      {selectedDate && deadlinesForSelectedDate.length > 0 && (
        <Card className="mt-3 py-0">
          <CardContent className="py-3">
            <p className="text-xs font-medium text-warm-muted mb-2">
              {formatDateKey(selectedDate)}
            </p>
            {deadlinesForSelectedDate.map((dl) => (
              <div
                key={dl.id}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-warm-text">
                  {formatLabel(dl.key, dl.label)}
                </span>
                <Badge variant="outline" className="text-[11px]">
                  {formatSource(dl.source)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
