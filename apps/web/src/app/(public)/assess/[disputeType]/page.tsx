import type { Metadata } from 'next'
import { ASSESSMENT_QUESTIONS, DEFAULT_QUESTIONS } from '@/lib/assessment/questions'
import { AssessmentPageClient } from './client'

const DISPUTE_LABELS: Record<string, string> = {
  small_claims: 'Small Claims',
  personal_injury: 'Personal Injury',
  landlord_tenant: 'Landlord-Tenant',
  contract: 'Contract Dispute',
  property: 'Property Dispute',
  family: 'Family Law',
  debt_defense: 'Debt Defense',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ disputeType: string }>
}): Promise<Metadata> {
  const { disputeType } = await params
  const label = DISPUTE_LABELS[disputeType] ?? 'Legal'
  return {
    title: `Free ${label} Case Assessment | Lawyer Free`,
    description: `Evaluate your ${label.toLowerCase()} case in under 2 minutes. Get a free viability score, court recommendation, and filing fee estimate.`,
    openGraph: {
      title: `Free ${label} Case Assessment`,
      description: `Is your ${label.toLowerCase()} case worth pursuing? Find out in 2 minutes.`,
    },
  }
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ disputeType: string }>
}) {
  const { disputeType } = await params
  const questions = ASSESSMENT_QUESTIONS[disputeType] ?? DEFAULT_QUESTIONS
  const label = DISPUTE_LABELS[disputeType] ?? 'Legal'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <AssessmentPageClient
          disputeType={disputeType}
          disputeLabel={label}
          questions={questions}
        />
      </div>
    </div>
  )
}
