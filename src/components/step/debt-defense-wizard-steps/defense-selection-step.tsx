'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Clock,
  UserX,
  FileText,
  Calculator,
  ShieldAlert,
  Scale,
  Mail,
  Shield,
} from 'lucide-react'

interface DefenseSelectionStepProps {
  selectedDefenses: string[]
  defenseDetails: Record<string, unknown>
  onDefensesChange: (defenses: string[]) => void
  onDefenseDetailsChange: (details: Record<string, unknown>) => void
  solStatus: 'expired' | 'active' | 'unknown'
}

interface DefenseCard {
  key: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  hasFollowUp: boolean
}

const DEFENSE_CARDS: DefenseCard[] = [
  {
    key: 'statute_of_limitations',
    icon: Clock,
    title: 'Statute of Limitations',
    description: 'The debt is too old to be collected through the courts',
    hasFollowUp: false,
  },
  {
    key: 'lack_of_standing',
    icon: UserX,
    title: 'Lack of Standing',
    description: "The plaintiff can't prove they own this debt",
    hasFollowUp: true,
  },
  {
    key: 'insufficient_evidence',
    icon: FileText,
    title: 'Insufficient Evidence',
    description:
      "The plaintiff hasn't proven the debt exists or the amount is correct",
    hasFollowUp: true,
  },
  {
    key: 'wrong_amount',
    icon: Calculator,
    title: 'Wrong Amount / Already Paid',
    description: 'The amount claimed is incorrect or already paid',
    hasFollowUp: true,
  },
  {
    key: 'identity_theft',
    icon: ShieldAlert,
    title: 'Identity Theft',
    description: 'This debt was opened fraudulently in my name',
    hasFollowUp: true,
  },
  {
    key: 'fdcpa_violations',
    icon: Scale,
    title: 'FDCPA Violations',
    description: 'The debt collector violated fair debt collection laws',
    hasFollowUp: true,
  },
  {
    key: 'improper_service',
    icon: Mail,
    title: 'Improper Service',
    description: 'I was not properly served with the lawsuit papers',
    hasFollowUp: true,
  },
  {
    key: 'general_denial',
    icon: Shield,
    title: 'General Denial',
    description: 'Deny all allegations as a baseline defense',
    hasFollowUp: false,
  },
]

const FDCPA_VIOLATIONS = [
  'Called before 8am or after 9pm',
  'Made threats of violence or criminal prosecution',
  'Contacted me at work after being told not to',
  'Failed to send a written validation notice within 5 days',
  'Continued collecting while I disputed the debt',
  'Used false or misleading representations',
]

const SERVICE_OPTIONS = [
  { value: '', label: 'Select how you were served...' },
  { value: 'in_person', label: 'In person' },
  { value: 'left_at_door', label: 'Left at door' },
  { value: 'by_mail', label: 'By mail' },
  { value: 'dont_know', label: "Don't know" },
  { value: 'never_received', label: 'Never received' },
]

export function DefenseSelectionStep({
  selectedDefenses,
  defenseDetails,
  onDefensesChange,
  onDefenseDetailsChange,
  solStatus,
}: DefenseSelectionStepProps) {
  // Auto-select statute_of_limitations if SOL is expired
  useEffect(() => {
    if (
      solStatus === 'expired' &&
      !selectedDefenses.includes('statute_of_limitations')
    ) {
      onDefensesChange([...selectedDefenses, 'statute_of_limitations'])
    }
  }, [solStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleDefense(key: string) {
    if (selectedDefenses.includes(key)) {
      onDefensesChange(selectedDefenses.filter((d) => d !== key))
    } else {
      onDefensesChange([...selectedDefenses, key])
    }
  }

  function updateDetail(key: string, value: unknown) {
    onDefenseDetailsChange({ ...defenseDetails, [key]: value })
  }

  function getDetail<T>(key: string, fallback: T): T {
    return (defenseDetails[key] as T) ?? fallback
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-warm-text">Select Your Defenses</h2>
        <p className="text-sm text-warm-muted mt-1">
          Choose all defenses that apply to your situation. You can select multiple.
        </p>
      </div>

      <div className="space-y-3">
        {DEFENSE_CARDS.map((defense) => {
          const isSelected = selectedDefenses.includes(defense.key)
          const Icon = defense.icon

          return (
            <div key={defense.key}>
              {/* Defense card */}
              <button
                type="button"
                onClick={() => toggleDefense(defense.key)}
                className={`w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleDefense(defense.key)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <Icon className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-text">{defense.title}</p>
                  <p className="text-xs text-warm-muted mt-0.5">{defense.description}</p>
                </div>
              </button>

              {/* SOL auto-select note */}
              {defense.key === 'statute_of_limitations' &&
                isSelected &&
                solStatus === 'expired' && (
                  <div className="ml-11 mt-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-warm-text">
                    Based on your dates, this defense appears strong.
                  </div>
                )}

              {/* General denial info */}
              {defense.key === 'general_denial' && isSelected && (
                <div className="ml-11 mt-2 rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
                  A general denial is the simplest defense &mdash; it denies everything and
                  puts the burden on the plaintiff to prove their case.
                </div>
              )}

              {/* Follow-up: Lack of Standing */}
              {defense.key === 'lack_of_standing' && isSelected && (
                <div className="ml-11 mt-2 space-y-3 rounded-lg border border-warm-border bg-warm-bg/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-warm-text">
                      Is the plaintiff the original creditor?
                    </p>
                    <div className="mt-2 space-y-2">
                      {['yes', 'no'].map((val) => (
                        <label
                          key={val}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="standing-original-creditor"
                            value={val}
                            checked={
                              getDetail<string>(
                                'standing_is_original_creditor',
                                ''
                              ) === val
                            }
                            onChange={() =>
                              updateDetail('standing_is_original_creditor', val)
                            }
                            className="h-4 w-4 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                          />
                          <span className="text-sm text-warm-text capitalize">
                            {val}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {getDetail<string>('standing_is_original_creditor', '') === 'no' && (
                    <div>
                      <p className="text-sm font-medium text-warm-text">
                        Has the plaintiff shown documentation proving they purchased this
                        debt?
                      </p>
                      <div className="mt-2 space-y-2">
                        {['yes', 'no', "don't know"].map((val) => (
                          <label
                            key={val}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="standing-docs"
                              value={val}
                              checked={
                                getDetail<string>('standing_has_docs', '') === val
                              }
                              onChange={() => updateDetail('standing_has_docs', val)}
                              className="h-4 w-4 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                            />
                            <span className="text-sm text-warm-text capitalize">
                              {val}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up: Insufficient Evidence */}
              {defense.key === 'insufficient_evidence' && isSelected && (
                <div className="ml-11 mt-2 space-y-3 rounded-lg border border-warm-border bg-warm-bg/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-warm-text">
                      Has the plaintiff provided the original signed credit agreement?
                    </p>
                    <div className="mt-2 space-y-2">
                      {['yes', 'no', "don't know"].map((val) => (
                        <label
                          key={val}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="evidence-agreement"
                            value={val}
                            checked={
                              getDetail<string>('evidence_has_agreement', '') === val
                            }
                            onChange={() =>
                              updateDetail('evidence_has_agreement', val)
                            }
                            className="h-4 w-4 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                          />
                          <span className="text-sm text-warm-text capitalize">
                            {val}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up: Wrong Amount */}
              {defense.key === 'wrong_amount' && isSelected && (
                <div className="ml-11 mt-2 space-y-3 rounded-lg border border-warm-border bg-warm-bg/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-warm-text">
                      What amount do you believe is correct?
                    </p>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
                        $
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={getDetail<string>('wrong_amount_correct', '')}
                        onChange={(e) =>
                          updateDetail('wrong_amount_correct', e.target.value)
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-text">
                      Have you made payments not reflected in their claim?
                    </p>
                    <div className="mt-2 space-y-2">
                      {['yes', 'no'].map((val) => (
                        <label
                          key={val}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="wrong-amount-payments"
                            value={val}
                            checked={
                              getDetail<string>(
                                'wrong_amount_unreflected_payments',
                                ''
                              ) === val
                            }
                            onChange={() =>
                              updateDetail('wrong_amount_unreflected_payments', val)
                            }
                            className="h-4 w-4 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                          />
                          <span className="text-sm text-warm-text capitalize">
                            {val}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up: Identity Theft */}
              {defense.key === 'identity_theft' && isSelected && (
                <div className="ml-11 mt-2 space-y-3 rounded-lg border border-warm-border bg-warm-bg/30 p-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getDetail<boolean>(
                        'identity_theft_police_report',
                        false
                      )}
                      onChange={(e) =>
                        updateDetail('identity_theft_police_report', e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
                    />
                    <span className="text-sm text-warm-text">
                      Have you filed a police report?
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getDetail<boolean>(
                        'identity_theft_ftc_report',
                        false
                      )}
                      onChange={(e) =>
                        updateDetail('identity_theft_ftc_report', e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
                    />
                    <span className="text-sm text-warm-text">
                      Have you filed an FTC Identity Theft Report?
                    </span>
                  </label>
                </div>
              )}

              {/* Follow-up: FDCPA Violations */}
              {defense.key === 'fdcpa_violations' && isSelected && (
                <div className="ml-11 mt-2 space-y-3 rounded-lg border border-warm-border bg-warm-bg/30 p-3">
                  <p className="text-sm font-medium text-warm-text">
                    Which violations apply?
                  </p>
                  {FDCPA_VIOLATIONS.map((violation) => {
                    const violations = getDetail<string[]>(
                      'fdcpa_violation_list',
                      []
                    )
                    const isChecked = violations.includes(violation)
                    return (
                      <label
                        key={violation}
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? violations.filter((v) => v !== violation)
                              : [...violations, violation]
                            updateDetail('fdcpa_violation_list', updated)
                          }}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
                        />
                        <span className="text-sm text-warm-text">{violation}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* Follow-up: Improper Service */}
              {defense.key === 'improper_service' && isSelected && (
                <div className="ml-11 mt-2 space-y-3 rounded-lg border border-warm-border bg-warm-bg/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-warm-text">
                      How were you served?
                    </p>
                    <select
                      value={getDetail<string>('improper_service_method', '')}
                      onChange={(e) =>
                        updateDetail('improper_service_method', e.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-text">
                      Were you personally handed the documents?
                    </p>
                    <div className="mt-2 space-y-2">
                      {['yes', 'no'].map((val) => (
                        <label
                          key={val}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="service-personal"
                            value={val}
                            checked={
                              getDetail<string>(
                                'improper_service_personal',
                                ''
                              ) === val
                            }
                            onChange={() =>
                              updateDetail('improper_service_personal', val)
                            }
                            className="h-4 w-4 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                          />
                          <span className="text-sm text-warm-text capitalize">
                            {val}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
