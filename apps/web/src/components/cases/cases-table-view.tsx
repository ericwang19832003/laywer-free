'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CaseEditDialog } from '@/components/cases/case-edit-dialog'
import type { CaseCardData } from '@/components/cases/case-cards'

const DISPUTE_LABELS: Record<string, string> = {
  personal_injury: 'Personal Injury',
  contract: 'Contract',
  landlord_tenant: 'Landlord-Tenant',
  real_estate: 'Real Estate',
  business: 'Business',
  employment: 'Employment',
  debt_collection: 'Debt Defense',
  family: 'Family Law',
  small_claims: 'Small Claims',
  property_damage: 'Property Damage',
  property_damage_negligence: 'Property Damage',
  auto_accident: 'Auto Accident',
  slip_and_fall: 'Slip and Fall',
  dog_bite: 'Dog Bite',
  vehicle_damage: 'Vehicle Damage',
  vandalism: 'Vandalism',
  other: 'Other',
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDeadline(dateString: string): { text: string; className: string } {
  const now = new Date()
  const deadline = new Date(dateString)
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)}d overdue`, className: 'text-destructive font-medium' }
  }
  if (diffDays === 0) return { text: 'Today', className: 'text-amber-600 font-medium' }
  if (diffDays <= 3) return { text: `In ${diffDays}d`, className: 'text-amber-600 font-medium' }
  if (diffDays <= 7) return { text: `In ${diffDays}d`, className: 'text-warm-muted' }
  return {
    text: deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    className: 'text-warm-muted',
  }
}

interface CasesTableViewProps {
  cases: CaseCardData[]
}

function DeleteButton({ caseId }: { caseId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/cases/${caseId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-destructive font-medium hover:underline disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Confirm'}
        </button>
        <span className="text-warm-muted text-xs">/</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-warm-muted hover:text-warm-text"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-warm-muted hover:text-destructive transition-colors p-1 rounded-md hover:bg-red-50"
      aria-label="Delete case"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

export function CasesTableView({ cases }: CasesTableViewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="cases-table">
          <thead>
            <tr className="border-b border-warm-border bg-gray-50/50">
              <th className="text-left text-xs font-medium text-warm-muted px-5 py-3">
                Case Name
              </th>
              <th className="text-left text-xs font-medium text-warm-muted px-5 py-3">
                Type
              </th>
              <th className="text-left text-xs font-medium text-warm-muted px-5 py-3">
                Progress
              </th>
              <th className="text-left text-xs font-medium text-warm-muted px-5 py-3">
                Next Deadline
              </th>
              <th className="text-left text-xs font-medium text-warm-muted px-5 py-3">
                Last Activity
              </th>
              <th className="text-left text-xs font-medium text-warm-muted px-5 py-3 w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-border">
            {cases.map((c) => {
              const progress = c.progress ?? 0
              const disputeLabel = DISPUTE_LABELS[c.dispute_type] || c.dispute_type || 'Case'
              const caseName = c.title || c.description || (c.county ? `${c.county} County ${disputeLabel}` : disputeLabel)

              return (
                <tr
                  key={c.id}
                  className="group hover:bg-gray-50/50 transition-colors"
                  data-testid="cases-table-row"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/case/${c.id}`}
                      className="text-sm font-medium text-warm-text hover:text-calm-indigo transition-colors"
                    >
                      {caseName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-warm-muted">{disputeLabel}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-warm-border/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-calm-indigo rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <span className="text-xs text-warm-muted">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.deadline ? (() => {
                      const { text, className } = formatDeadline(c.deadline.due_at)
                      return (
                        <span className={cn('text-xs', className)}>
                          {text}
                          {c.deadline.label && (
                            <span className="text-warm-muted ml-1">
                              — {c.deadline.label}
                            </span>
                          )}
                        </span>
                      )
                    })() : (
                      <span className="text-xs text-warm-muted italic">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-warm-muted">
                      {c.lastActivity ? formatRelativeDate(c.lastActivity) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CaseEditDialog
                        caseId={c.id}
                        currentTitle={c.title ?? null}
                        currentCounty={c.county ?? null}
                        currentDescription={c.description ?? null}
                      />
                      <DeleteButton caseId={c.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
