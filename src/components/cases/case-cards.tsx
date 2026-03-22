'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import {
  ChevronRight,
  AlertCircle,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  FileText,
  Scale,
  Building2,
  Briefcase,
  Home,
  Car,
  Users,
  FileCheck,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Activity,
  Users as UsersIcon,
  MessageSquare,
  Bell,
  ArrowUpDown,
  Filter,
  X,
  Archive,
  Download,
  Square,
  CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CaseCardData {
  id: string
  description: string
  county: string
  role: string
  court_type: string
  dispute_type: string
  created_at: string
  progress?: number
  nextAction?: string
  deadline?: {
    due_at: string
    label: string
  }
  lastActivity?: string
  status?: 'active' | 'pending' | 'settled' | 'closed'
  opposingParty?: string
  yourName?: string
}

interface CaseCardsProps {
  cases: CaseCardData[]
  onCaseAction?: (caseId: string, action: 'view' | 'delete' | 'archive') => void
}

type ViewMode = 'card' | 'list' | 'timeline'
type SortOption = 'date-created' | 'date-deadline' | 'progress' | 'name' | 'last-activity'
type FilterStatus = 'all' | 'active' | 'pending' | 'settled' | 'closed'
type FilterRole = 'all' | 'plaintiff' | 'defendant'
type FilterType = 'all' | 'personal_injury' | 'contract' | 'landlord_tenant' | 'real_estate' | 'business' | 'employment' | 'other'

const DISPUTE_ICONS: Record<string, React.ElementType> = {
  personal_injury: Car,
  contract: FileText,
  landlord_tenant: Home,
  real_estate: Building2,
  business: Briefcase,
  employment: Users,
  other: Scale,
}

const DISPUTE_COLORS: Record<string, string> = {
  personal_injury: 'bg-orange-100 text-orange-700 border-orange-200',
  contract: 'bg-blue-100 text-blue-700 border-blue-200',
  landlord_tenant: 'bg-green-100 text-green-700 border-green-200',
  real_estate: 'bg-purple-100 text-purple-700 border-purple-200',
  business: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  employment: 'bg-amber-100 text-amber-700 border-amber-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
}

const DISPUTE_LABELS: Record<string, string> = {
  personal_injury: 'Personal Injury',
  contract: 'Contract',
  landlord_tenant: 'Landlord-Tenant',
  real_estate: 'Real Estate',
  business: 'Business',
  employment: 'Employment',
  other: 'Other',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  settled: 'bg-blue-100 text-blue-700 border-blue-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  settled: 'Settled',
  closed: 'Closed',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getCaseAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

function QuickNoteDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!note.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note }),
      })
      if (res.ok) {
        setNote('')
        setOpen(false)
      }
    } catch {
      console.error('Failed to save note')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text transition-colors">
          <MessageSquare className="h-3.5 w-3.5" />
          Add Note
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a quick note to track important information about this case.
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your note..."
          className="w-full h-32 p-3 border border-warm-border rounded-lg resize-none text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!note.trim() || saving}>
            {saving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SetReminderDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() || !date) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, dueAt: date }),
      })
      if (res.ok) {
        setTitle('')
        setDate('')
        setOpen(false)
      }
    } catch {
      console.error('Failed to set reminder')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text transition-colors">
          <Bell className="h-3.5 w-3.5" />
          Set Reminder
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Create a reminder for an important deadline or task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-warm-text">Reminder Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Filing deadline approaching"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-warm-text">Due Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !date || saving}>
            {saving ? 'Saving...' : 'Set Reminder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CaseCardView({ caseData, onAction, isSelected, onSelect }: { caseData: CaseCardData; onAction?: (action: 'view' | 'delete' | 'archive') => void; isSelected?: boolean; onSelect?: (selected: boolean) => void }) {
  const [showMenu, setShowMenu] = useState(false)

  const Icon = DISPUTE_ICONS[caseData.dispute_type] || Scale
  const colorClass = DISPUTE_COLORS[caseData.dispute_type] || DISPUTE_COLORS.other
  const status = caseData.status || 'active'
  const statusColorClass = STATUS_COLORS[status]
  const caseAge = getCaseAge(caseData.created_at)

  const daysUntil = caseData.deadline ? getDaysUntilDeadline(caseData.deadline.due_at) : null
  const isUrgent = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0
  const isOverdue = daysUntil !== null && daysUntil < 0
  const progress = caseData.progress ?? 0

  return (
    <Card className={cn('group hover:shadow-lg hover:border-primary/30 transition-all duration-300', isSelected && 'ring-2 ring-calm-indigo')}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onSelect?.(!isSelected)}
            className={cn(
              'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
              isSelected ? 'bg-calm-indigo border-calm-indigo' : 'border-warm-border hover:border-calm-indigo/50'
            )}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border shrink-0', colorClass)}>
            <Icon className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-warm-text truncate pr-4">
                  {caseData.description || 'Your Case'}
                </h3>
                {caseData.yourName && (
                  <p className="text-xs text-warm-muted mt-0.5">
                    Filed by {caseData.yourName}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {caseData.county && (
                    <Badge variant="outline" className="text-xs">
                      {caseData.county}
                    </Badge>
                  )}
                  <Badge className={cn('text-xs', colorClass)}>
                    {DISPUTE_LABELS[caseData.dispute_type] || 'Case'}
                  </Badge>
                  <Badge variant={caseData.role === 'plaintiff' ? 'default' : 'secondary'} className="text-xs">
                    {caseData.role === 'plaintiff' ? 'Plaintiff' : 'Defendant'}
                  </Badge>
                  <Badge className={cn('text-xs', statusColorClass)}>
                    {STATUS_LABELS[status]}
                  </Badge>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-warm-border/40 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4 text-warm-muted" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border bg-popover shadow-lg py-1">
                      <Link
                        href={`/case/${caseData.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-warm-border/40 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                      <QuickNoteDialog caseId={caseData.id} />
                      <SetReminderDialog caseId={caseData.id} />
                      {onAction && (
                        <>
                          <hr className="my-1 border-warm-border" />
                          <button
                            onClick={() => {
                              onAction('archive')
                              setShowMenu(false)
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-warm-muted hover:bg-warm-border/40 w-full transition-colors"
                          >
                            <FileCheck className="h-4 w-4" />
                            Archive
                          </button>
                          <button
                            onClick={() => {
                              onAction('delete')
                              setShowMenu(false)
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-2 bg-warm-bg/50 rounded-lg">
                <p className="text-xs text-warm-muted">Case Age</p>
                <p className="text-sm font-semibold text-warm-text">{caseAge} days</p>
              </div>
              <div className="text-center p-2 bg-warm-bg/50 rounded-lg">
                <p className="text-xs text-warm-muted">Progress</p>
                <p className="text-sm font-semibold text-warm-text">{progress}%</p>
              </div>
              <div className="text-center p-2 bg-warm-bg/50 rounded-lg">
                <p className="text-xs text-warm-muted">Last Activity</p>
                <p className="text-sm font-semibold text-warm-text truncate">
                  {caseData.lastActivity ? formatRelativeDate(caseData.lastActivity) : 'None'}
                </p>
              </div>
            </div>

            {caseData.opposingParty && (
              <div className="mt-3 flex items-center gap-2 text-sm text-warm-muted">
                <UsersIcon className="h-4 w-4" />
                <span>vs. {caseData.opposingParty}</span>
              </div>
            )}

            {(caseData.nextAction || caseData.deadline) && (
              <div className="mt-3 pt-3 border-t border-warm-border">
                {caseData.nextAction && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="text-warm-muted">Next:</span>
                    <span className="text-warm-text font-medium">{caseData.nextAction}</span>
                  </div>
                )}
                {caseData.deadline && (
                  <div className={cn(
                    'flex items-center gap-2 text-sm mt-1.5',
                    isOverdue && 'text-red-600',
                    isUrgent && 'text-calm-amber',
                    !isOverdue && !isUrgent && 'text-warm-muted'
                  )}>
                    {isOverdue ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    <span className="truncate">
                      {isOverdue
                        ? `Overdue: ${caseData.deadline.label}`
                        : `${caseData.deadline.label}: ${formatDate(caseData.deadline.due_at)}`
                      }
                      {daysUntil !== null && !isOverdue && (
                        <span className="ml-1 font-medium">
                          ({daysUntil === 0 ? 'Today' : `${daysUntil}d left`})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <Link href={`/case/${caseData.id}`} className="flex-1">
                <Button className="w-full gap-1" size="sm">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <QuickNoteDialog caseId={caseData.id} />
              <SetReminderDialog caseId={caseData.id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CaseListRow({ caseData, onAction, isSelected, onSelect }: { caseData: CaseCardData; onAction?: (action: 'view' | 'delete' | 'archive') => void; isSelected?: boolean; onSelect?: (selected: boolean) => void }) {
  const Icon = DISPUTE_ICONS[caseData.dispute_type] || Scale
  const colorClass = DISPUTE_COLORS[caseData.dispute_type] || DISPUTE_COLORS.other
  const status = caseData.status || 'active'
  const caseAge = getCaseAge(caseData.created_at)
  const daysUntil = caseData.deadline ? getDaysUntilDeadline(caseData.deadline.due_at) : null
  const isUrgent = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0
  const isOverdue = daysUntil !== null && daysUntil < 0

  return (
    <tr className={cn('group hover:bg-warm-bg/50 transition-colors', isSelected && 'bg-calm-indigo/5')}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelect?.(!isSelected)}
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
              isSelected ? 'bg-calm-indigo border-calm-indigo' : 'border-warm-border hover:border-calm-indigo/50'
            )}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border shrink-0', colorClass)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-warm-text truncate max-w-[200px]">
              {caseData.description || 'Your Case'}
            </p>
            {caseData.county && (
              <p className="text-xs text-warm-muted">{caseData.county}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge className={cn('text-xs', colorClass)}>
          {DISPUTE_LABELS[caseData.dispute_type] || 'Case'}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge variant={caseData.role === 'plaintiff' ? 'default' : 'secondary'} className="text-xs">
          {caseData.role === 'plaintiff' ? 'Plaintiff' : 'Defendant'}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge className={cn('text-xs', STATUS_COLORS[status])}>
          {STATUS_LABELS[status]}
        </Badge>
      </td>
      <td className="py-3 px-4 text-sm text-warm-muted">
        {caseAge} days
      </td>
      <td className="py-3 px-4 text-sm text-warm-muted">
        {caseData.lastActivity ? formatRelativeDate(caseData.lastActivity) : '—'}
      </td>
      <td className="py-3 px-4">
        {caseData.deadline ? (
          <span className={cn(
            'text-sm font-medium',
            isOverdue && 'text-red-600',
            isUrgent && 'text-calm-amber',
            !isOverdue && !isUrgent && 'text-warm-muted'
          )}>
            {formatDate(caseData.deadline.due_at)}
            <span className="ml-1 text-xs">
              ({daysUntil === 0 ? 'Today' : `${daysUntil}d`})
            </span>
          </span>
        ) : (
          <span className="text-warm-muted">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/case/${caseData.id}`}>
            <Button variant="ghost" size="icon-xs">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {onAction && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onAction('delete')}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}

function CaseTimelineView({ cases }: { cases: CaseCardData[] }) {
  return (
    <div className="space-y-4">
      {cases.map((caseData) => {
        const Icon = DISPUTE_ICONS[caseData.dispute_type] || Scale
        const colorClass = DISPUTE_COLORS[caseData.dispute_type] || DISPUTE_COLORS.other
        const caseAge = getCaseAge(caseData.created_at)

        return (
          <Card key={caseData.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2', colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-calm-indigo rounded-full flex items-center justify-center">
                    <Activity className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-warm-text">
                        {caseData.description || 'Your Case'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {caseData.county && (
                          <span className="text-xs text-warm-muted">{caseData.county}</span>
                        )}
                        <span className="text-xs text-warm-muted">•</span>
                        <span className="text-xs text-warm-muted">{caseAge} days old</span>
                        <span className="text-xs text-warm-muted">•</span>
                        <span className="text-xs text-warm-muted">
                          {caseData.lastActivity ? `Active ${formatRelativeDate(caseData.lastActivity)}` : 'No recent activity'}
                        </span>
                      </div>
                    </div>
                    <Link href={`/case/${caseData.id}`}>
                      <Button size="sm">
                        Open Case
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge className={cn('text-xs', colorClass)}>
                      {DISPUTE_LABELS[caseData.dispute_type] || 'Case'}
                    </Badge>
                    <Badge variant={caseData.role === 'plaintiff' ? 'default' : 'secondary'} className="text-xs">
                      {caseData.role === 'plaintiff' ? 'Plaintiff' : 'Defendant'}
                    </Badge>
                    {caseData.deadline && (
                      <span className="flex items-center gap-1 text-xs text-warm-muted">
                        <Calendar className="h-3 w-3" />
                        Next: {caseData.deadline.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function CaseCards({ cases, onCaseAction }: CaseCardsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date-created')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterRole, setFilterRole] = useState<FilterRole>('all')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set())

  const toggleCaseSelection = (caseId: string) => {
    const newSelected = new Set(selectedCases)
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId)
    } else {
      newSelected.add(caseId)
    }
    setSelectedCases(newSelected)
  }

  const selectAllCases = () => {
    if (selectedCases.size === filteredAndSortedCases.length) {
      setSelectedCases(new Set())
    } else {
      setSelectedCases(new Set(filteredAndSortedCases.map(c => c.id)))
    }
  }

  const handleBulkArchive = async () => {
    for (const caseId of selectedCases) {
      onCaseAction?.(caseId, 'archive')
    }
    setSelectedCases(new Set())
  }

  const handleBulkDelete = async () => {
    for (const caseId of selectedCases) {
      onCaseAction?.(caseId, 'delete')
    }
    setSelectedCases(new Set())
  }

  const handleExport = () => {
    const exportData = filteredAndSortedCases
      .filter(c => selectedCases.has(c.id))
      .map(c => ({
        id: c.id,
        description: c.description,
        county: c.county,
        role: c.role,
        court_type: c.court_type,
        dispute_type: c.dispute_type,
        status: c.status || 'active',
        created_at: c.created_at,
      }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cases-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSelectedCases(new Set())
  }

  const filteredAndSortedCases = useMemo(() => {
    let result = [...cases]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c =>
        (c.description || '').toLowerCase().includes(query) ||
        (c.county || '').toLowerCase().includes(query) ||
        (c.opposingParty || '').toLowerCase().includes(query) ||
        DISPUTE_LABELS[c.dispute_type]?.toLowerCase().includes(query)
      )
    }

    if (filterStatus !== 'all') {
      result = result.filter(c => (c.status || 'active') === filterStatus)
    }

    if (filterRole !== 'all') {
      result = result.filter(c => c.role === filterRole)
    }

    if (filterType !== 'all') {
      result = result.filter(c => c.dispute_type === filterType)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'date-deadline':
          if (!a.deadline?.due_at) return 1
          if (!b.deadline?.due_at) return -1
          return new Date(a.deadline.due_at).getTime() - new Date(b.deadline.due_at).getTime()
        case 'progress':
          return (b.progress || 0) - (a.progress || 0)
        case 'name':
          return (a.description || '').localeCompare(b.description || '')
        case 'last-activity':
          if (!a.lastActivity) return 1
          if (!b.lastActivity) return -1
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        default:
          return 0
      }
    })

    return result
  }, [cases, searchQuery, sortBy, filterStatus, filterRole, filterType])

  const hasActiveFilters = filterStatus !== 'all' || filterRole !== 'all' || filterType !== 'all' || searchQuery

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setFilterRole('all')
    setFilterType('all')
  }

  if (cases.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted" />
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'card' ? 'bg-calm-indigo text-white' : 'bg-white text-warm-muted hover:bg-warm-bg'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list' ? 'bg-calm-indigo text-white' : 'bg-white text-warm-muted hover:bg-warm-bg'
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'timeline' ? 'bg-calm-indigo text-white' : 'bg-white text-warm-muted hover:bg-warm-bg'
              )}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-created">Date Created</SelectItem>
              <SelectItem value="date-deadline">Deadline</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="last-activity">Last Activity</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-warm-muted">Status</label>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-warm-muted">Role</label>
                <Select value={filterRole} onValueChange={(v) => setFilterRole(v as FilterRole)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="plaintiff">Plaintiff</SelectItem>
                    <SelectItem value="defendant">Defendant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-warm-muted">Case Type</label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="personal_injury">Personal Injury</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="landlord_tenant">Landlord-Tenant</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="self-end">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-warm-muted">
        Showing {filteredAndSortedCases.length} of {cases.length} cases
        {hasActiveFilters && ' (filtered)'}
      </p>

      {filteredAndSortedCases.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <EmptyState
              illustration="folder"
              title="No cases found"
              description={hasActiveFilters ? "Try adjusting your filters or search query." : "Create your first case to get started."}
              action={hasActiveFilters ? {
                label: 'Clear Filters',
                onClick: clearFilters,
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedCases.size > 0 && (
            <Card className="bg-calm-indigo/5 border-calm-indigo/20">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-warm-text">
                      {selectedCases.size} case{selectedCases.size > 1 ? 's' : ''} selected
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCases(new Set())}>
                      Clear selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === 'card' ? (
            <div className="grid gap-4">
              {filteredAndSortedCases.map((caseData) => (
                <CaseCardView
                  key={caseData.id}
                  caseData={caseData}
                  onAction={onCaseAction ? (action) => onCaseAction(caseData.id, action) : undefined}
                  isSelected={selectedCases.has(caseData.id)}
                  onSelect={() => toggleCaseSelection(caseData.id)}
                />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-border">
                      <th className="text-left text-xs font-medium text-warm-muted py-3 px-4">
                        <button
                          onClick={selectAllCases}
                          className="flex items-center gap-2 hover:text-warm-text"
                        >
                          {selectedCases.size === filteredAndSortedCases.length && filteredAndSortedCases.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-calm-indigo" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                          Case
                        </button>
                      </th>
                      <th className="text-left text-xs font-medium text-warm-muted py-3 px-4">Type</th>
                  <th className="text-left text-xs font-medium text-warm-muted py-3 px-4">Role</th>
                  <th className="text-left text-xs font-medium text-warm-muted py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-warm-muted py-3 px-4">Age</th>
                  <th className="text-left text-xs font-medium text-warm-muted py-3 px-4">Activity</th>
                  <th className="text-left text-xs font-medium text-warm-muted py-3 px-4">Deadline</th>
                  <th className="text-left text-xs font-medium text-warm-muted py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCases.map((caseData) => (
                  <CaseListRow
                    key={caseData.id}
                    caseData={caseData}
                    onAction={onCaseAction ? (action) => onCaseAction(caseData.id, action) : undefined}
                    isSelected={selectedCases.has(caseData.id)}
                    onSelect={() => toggleCaseSelection(caseData.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <CaseTimelineView cases={filteredAndSortedCases} />
      )}
        </>
      )}
    </div>
  )
}

export function CaseCardsEmpty() {
  return (
    <div className="py-8">
      <EmptyState
        illustration="folder"
        title="No cases yet"
        description="Start your legal journey by creating your first case. We'll guide you through every step."
        action={{
          label: 'Start Your First Case',
          onClick: () => window.location.href = '/case/new',
        }}
        secondaryAction={{
          label: 'Take assessment first',
          onClick: () => window.location.href = '/assess',
        }}
      />
      <div className="mt-4 p-3 bg-calm-indigo/5 border border-calm-indigo/10 rounded-lg max-w-md mx-auto">
        <p className="text-xs text-warm-muted text-center">
          <strong>Tip:</strong> Not sure which case type to choose?{' '}
          <Link href="/assess" className="text-calm-indigo hover:underline">
            Take our quick assessment
          </Link>
          {' '}for personalized recommendations.
        </p>
      </div>
    </div>
  )
}
