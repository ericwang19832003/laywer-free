'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Trash2, AlertTriangle } from 'lucide-react'

interface ChildInfo {
  name: string
  date_of_birth: string
  relationship: 'biological' | 'adopted' | 'step'
}

interface ChildrenStepProps {
  children: ChildInfo[]
  onChildrenChange: (children: ChildInfo[]) => void
  familySubType: string
}

const requiresChildren = ['custody', 'child_support', 'visitation']

export function ChildrenStep({
  children: childrenList,
  onChildrenChange,
  familySubType,
}: ChildrenStepProps) {
  function updateChild(index: number, field: keyof ChildInfo, value: string) {
    const updated = [...childrenList]
    updated[index] = { ...updated[index], [field]: value }
    onChildrenChange(updated)
  }

  function addChild() {
    onChildrenChange([
      ...childrenList,
      { name: '', date_of_birth: '', relationship: 'biological' },
    ])
  }

  function removeChild(index: number) {
    // Don't allow removing the last child if this sub-type requires children
    if (requiresChildren.includes(familySubType) && childrenList.length <= 1) return
    onChildrenChange(childrenList.filter((_, i) => i !== index))
  }

  const showNoChildrenWarning =
    requiresChildren.includes(familySubType) && childrenList.length === 0

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-warm-text">
          Children Involved in This Case
        </Label>
        <HelpTooltip label="Which children should I list?">
          <p>
            List all children of this relationship, including biological, adopted, and
            children born during the marriage. Include each child&apos;s full legal name,
            date of birth, and their relationship to you.
          </p>
        </HelpTooltip>
      </div>

      {/* No children warning */}
      {showNoChildrenWarning && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">At Least One Child Required</p>
              <p className="text-sm text-warm-muted mt-1">
                You need at least one child to proceed with this type of case.
                Please add the children involved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Children list */}
      <div className="space-y-4">
        {childrenList.map((child, i) => (
          <div
            key={i}
            className="rounded-lg border border-warm-border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-warm-muted">
                Child {i + 1}
              </span>
              {/* Show remove button unless it's the last one and children are required */}
              {!(requiresChildren.includes(familySubType) && childrenList.length <= 1) && (
                <button
                  type="button"
                  onClick={() => removeChild(i)}
                  className="text-xs text-warm-muted hover:text-warm-text flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>

            <div>
              <Label htmlFor={`child-name-${i}`} className="text-xs text-warm-muted">
                Full legal name
              </Label>
              <Input
                id={`child-name-${i}`}
                value={child.name}
                onChange={(e) => updateChild(i, 'name', e.target.value)}
                placeholder="e.g. Emily Rose Garcia"
              />
            </div>

            <div>
              <Label htmlFor={`child-dob-${i}`} className="text-xs text-warm-muted">
                Date of birth
              </Label>
              <Input
                id={`child-dob-${i}`}
                type="date"
                value={child.date_of_birth}
                onChange={(e) => updateChild(i, 'date_of_birth', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`child-relationship-${i}`} className="text-xs text-warm-muted">
                Relationship
              </Label>
              <select
                id={`child-relationship-${i}`}
                value={child.relationship}
                onChange={(e) => updateChild(i, 'relationship', e.target.value)}
                className="mt-1 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="biological">Biological</option>
                <option value="adopted">Adopted</option>
                <option value="step">Step-child</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addChild}
      >
        + Add another child
      </Button>
    </div>
  )
}
