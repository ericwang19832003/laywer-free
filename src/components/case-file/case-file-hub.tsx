'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Upload, Tags, Search, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PipelineBar, type StageInfo } from './pipeline-bar'
import {
  AIAssistantPanel,
  type Suggestion,
} from './ai-assistant-panel'
import { BeginnerWalkthrough } from './beginner-walkthrough'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import type { PipelineStage } from '@/lib/schemas/case-file'

// Lazy-load stage components
const EvidenceVault = dynamic(
  () =>
    import('@/components/evidence/evidence-vault').then(
      (mod) => mod.EvidenceVault
    ),
  { loading: () => <StageSkeleton /> }
)

const ExhibitsManager = dynamic(
  () =>
    import('@/components/exhibits/exhibits-manager').then(
      (mod) => mod.ExhibitsManager
    ),
  { loading: () => <StageSkeleton /> }
)

function StageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-warm-border/40" />
      <div className="h-40 rounded-lg bg-warm-border/20" />
      <div className="h-40 rounded-lg bg-warm-border/20" />
    </div>
  )
}

// ── Props ───────────────────────────────────────────────

interface CaseFileHubProps {
  caseId: string
  caseData: {
    id: string
    dispute_type: string
    state: string
    role: string
    county: string | null
    status: string
  }
  initialStage: PipelineStage
  initialCounts: {
    evidence: number
    exhibited: number
    discoveryPacks: number
    discoveryComplete: number
    binders: number
    bindersReady: number
  }
}

export function CaseFileHub({
  caseId,
  caseData,
  initialStage,
  initialCounts,
}: CaseFileHubProps) {
  const router = useRouter()
  const [activeStage, setActiveStage] = useState<PipelineStage>(initialStage)
  const [counts, setCounts] = useState(initialCounts)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  // ── Pipeline stages ─────────────────────────────────────

  const stages: StageInfo[] = [
    {
      key: 'collect',
      label: 'Collect',
      icon: Upload,
      count: `${counts.evidence} items`,
      complete: counts.evidence >= 3,
    },
    {
      key: 'organize',
      label: 'Organize',
      icon: Tags,
      count: `${counts.exhibited} of ${counts.evidence}`,
      complete:
        counts.evidence > 0 && counts.exhibited >= counts.evidence * 0.5,
    },
    {
      key: 'discover',
      label: 'Discover',
      icon: Search,
      count:
        counts.discoveryPacks === 0
          ? 'Not started'
          : counts.discoveryComplete === counts.discoveryPacks
            ? `${counts.discoveryPacks} complete`
            : `${counts.discoveryComplete} of ${counts.discoveryPacks}`,
      complete:
        counts.discoveryPacks > 0 &&
        counts.discoveryComplete === counts.discoveryPacks,
    },
    {
      key: 'prepare',
      label: 'Prepare',
      icon: FileText,
      count: counts.bindersReady > 0 ? 'Ready' : 'Not started',
      complete: counts.bindersReady > 0,
    },
  ]

  // ── Handlers ────────────────────────────────────────────

  const handleStageClick = useCallback(
    (stage: PipelineStage) => {
      setActiveStage(stage)
      router.replace(`/case/${caseId}/case-file?stage=${stage}`, {
        scroll: false,
      })
    },
    [caseId, router]
  )

  const handleSuggestionAction = useCallback(
    (suggestion: Suggestion) => {
      // Navigate to suggested stage if the action payload contains one
      const payload = suggestion as Suggestion & {
        action_type?: string
        action_payload?: { stage?: string }
      }
      if (
        payload.action_type === 'navigate' &&
        payload.action_payload?.stage
      ) {
        handleStageClick(payload.action_payload.stage as PipelineStage)
      }
    },
    [handleStageClick]
  )

  const handleDismissSuggestion = useCallback(
    async (suggestion: Suggestion) => {
      try {
        const supabase = createClient()
        await supabase.functions.invoke('dismiss-suggestion', {
          body: { suggestion_id: suggestion.id },
        })

        // Optimistic removal from local state
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
      } catch {
        toast.error('Failed to dismiss suggestion')
      }
    },
    []
  )

  const refreshSuggestions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/case-file/suggestions`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error('Failed to refresh')
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
    } catch {
      toast.error('Could not refresh suggestions')
    }
  }, [caseId])

  // ── Stage content renderer ──────────────────────────────

  function renderStageContent() {
    switch (activeStage) {
      case 'collect':
        return <EvidenceVault caseId={caseId} initialEvidence={[]} />
      case 'organize':
        return (
          <ExhibitsManager
            caseId={caseId}
            initialSet={null}
            initialExhibits={[]}
            evidenceItems={[]}
          />
        )
      case 'discover':
        return (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-warm-border bg-white p-10 text-center">
            <Search className="h-10 w-10 text-warm-muted" />
            <h3 className="text-lg font-semibold text-warm-text">
              Discovery Tools
            </h3>
            <p className="max-w-sm text-sm text-warm-muted">
              Discovery tools help you request documents and information from the
              other side. This section is coming soon.
            </p>
          </div>
        )
      case 'prepare':
        return (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-warm-border bg-white p-10 text-center">
            <FileText className="h-10 w-10 text-warm-muted" />
            <h3 className="text-lg font-semibold text-warm-text">
              Trial Preparation
            </h3>
            <p className="max-w-sm text-sm text-warm-muted">
              Build organized trial binders with your evidence and exhibits. This
              section is coming soon.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <>
      <SupportiveHeader
        title="Case File"
        subtitle="Collect, organize, and prepare your evidence step by step."
      />

      <BeginnerWalkthrough onStart={() => handleStageClick('collect')} />

      <div className="mb-6">
        <PipelineBar
          stages={stages}
          activeStage={activeStage}
          onStageClick={handleStageClick}
        />
      </div>

      <div className="flex gap-6">
        {/* Main stage content */}
        <div className="min-w-0 flex-1">{renderStageContent()}</div>

        {/* AI Assistant sidebar */}
        <AIAssistantPanel
          caseId={caseId}
          suggestions={suggestions}
          onAction={handleSuggestionAction}
          onDismiss={handleDismissSuggestion}
          onRefresh={refreshSuggestions}
        />
      </div>
    </>
  )
}
