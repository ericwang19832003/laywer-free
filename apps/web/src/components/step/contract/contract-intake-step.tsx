'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface ContractIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function ContractIntakeStep({ caseId, taskId, existingMetadata }: ContractIntakeStepProps) {
  const [county, setCounty] = useState((existingMetadata?.county as string) ?? '')
  const [otherPartyName, setOtherPartyName] = useState((existingMetadata?.other_party_name as string) ?? '')
  const [otherPartyType, setOtherPartyType] = useState((existingMetadata?.other_party_type as string) ?? 'individual')
  const [contractDate, setContractDate] = useState((existingMetadata?.contract_date as string) ?? '')
  const [contractAmount, setContractAmount] = useState((existingMetadata?.contract_amount as string) ?? '')
  const [hasWrittenContract, setHasWrittenContract] = useState((existingMetadata?.has_written_contract as boolean) ?? false)
  const [breachDescription, setBreachDescription] = useState((existingMetadata?.breach_description as string) ?? '')
  const [damagesSought, setDamagesSought] = useState((existingMetadata?.damages_sought as string) ?? '')
  const [caseStage, setCaseStage] = useState((existingMetadata?.guided_answers as Record<string, string>)?.case_stage ?? 'start')

  function buildMetadata() {
    return {
      county,
      other_party_name: otherPartyName,
      other_party_type: otherPartyType,
      contract_date: contractDate,
      contract_amount: contractAmount,
      has_written_contract: hasWrittenContract,
      breach_description: breachDescription,
      damages_sought: damagesSought,
      guided_answers: { case_stage: caseStage },
    }
  }

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    const meta = buildMetadata()
    await patchTask('in_progress', meta)
    await patchTask('completed')
  }

  async function handleSave() {
    await patchTask('in_progress', buildMetadata())
  }

  const stages = [
    { value: 'start', label: 'Just starting', desc: 'I haven\'t taken any action yet' },
    { value: 'demand_sent', label: 'Sent a demand', desc: 'I\'ve already sent a demand letter' },
    { value: 'filed', label: 'Filed with court', desc: 'I\'ve already filed a lawsuit' },
    { value: 'served', label: 'Served the other party', desc: 'The other party has been served' },
  ]

  const reviewContent = (
    <dl className="space-y-3 text-sm">
      {county && (
        <>
          <dt className="font-medium text-warm-text">County</dt>
          <dd className="text-warm-muted">{county}</dd>
        </>
      )}
      <dt className="font-medium text-warm-text">Other Party</dt>
      <dd className="text-warm-muted">{otherPartyName || '\u2014'} ({otherPartyType})</dd>
      {contractDate && (
        <>
          <dt className="font-medium text-warm-text">Contract Date</dt>
          <dd className="text-warm-muted">{contractDate}</dd>
        </>
      )}
      {contractAmount && (
        <>
          <dt className="font-medium text-warm-text">Contract Amount</dt>
          <dd className="text-warm-muted">${contractAmount}</dd>
        </>
      )}
      <dt className="font-medium text-warm-text">Written Contract</dt>
      <dd className="text-warm-muted">{hasWrittenContract ? 'Yes' : 'No'}</dd>
      {breachDescription && (
        <>
          <dt className="font-medium text-warm-text">Breach Description</dt>
          <dd className="text-warm-muted">{breachDescription}</dd>
        </>
      )}
      {damagesSought && (
        <>
          <dt className="font-medium text-warm-text">Damages Sought</dt>
          <dd className="text-warm-muted">${damagesSought}</dd>
        </>
      )}
      <dt className="font-medium text-warm-text">Case Stage</dt>
      <dd className="text-warm-muted">{stages.find(s => s.value === caseStage)?.label ?? caseStage}</dd>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About Your Contract Dispute"
      reassurance="Understanding the details of your contract helps us build the strongest possible case."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            County (where the case will be filed)
          </label>
          <input
            type="text"
            value={county}
            onChange={e => setCounty(e.target.value)}
            placeholder="e.g., Harris County"
            className="w-full rounded-lg border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-indigo/20 focus:border-calm-indigo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Other Party&apos;s Name
          </label>
          <input
            type="text"
            value={otherPartyName}
            onChange={e => setOtherPartyName(e.target.value)}
            placeholder="Full legal name"
            className="w-full rounded-lg border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-indigo/20 focus:border-calm-indigo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-2">
            Other Party Type
          </label>
          <div className="flex gap-3">
            {(['individual', 'business'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setOtherPartyType(t)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  otherPartyType === t
                    ? 'border-calm-indigo bg-calm-indigo/5 text-calm-indigo font-medium'
                    : 'border-warm-border text-warm-muted hover:border-warm-text/30'
                }`}
              >
                {t === 'individual' ? 'Individual' : 'Business'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-warm-text mb-1">
              Contract Date
            </label>
            <input
              type="date"
              value={contractDate}
              onChange={e => setContractDate(e.target.value)}
              className="w-full rounded-lg border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-calm-indigo/20 focus:border-calm-indigo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-text mb-1">
              Contract Amount ($)
            </label>
            <input
              type="number"
              value={contractAmount}
              onChange={e => setContractAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-indigo/20 focus:border-calm-indigo"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasWrittenContract"
            checked={hasWrittenContract}
            onChange={e => setHasWrittenContract(e.target.checked)}
            className="h-4 w-4 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo/20"
          />
          <label htmlFor="hasWrittenContract" className="text-sm text-warm-text">
            I have a written contract
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            What did the other party fail to do?
          </label>
          <textarea
            value={breachDescription}
            onChange={e => setBreachDescription(e.target.value)}
            rows={3}
            placeholder="Describe how the contract was breached..."
            className="w-full rounded-lg border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-indigo/20 focus:border-calm-indigo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Damages Sought ($)
          </label>
          <input
            type="number"
            value={damagesSought}
            onChange={e => setDamagesSought(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-indigo/20 focus:border-calm-indigo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-3">
            Where are you in the process?
          </label>
          <div className="grid gap-2">
            {stages.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setCaseStage(s.value)}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  caseStage === s.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:border-warm-text/30'
                }`}
              >
                <p className={`text-sm font-medium ${caseStage === s.value ? 'text-calm-indigo' : 'text-warm-text'}`}>
                  {s.label}
                </p>
                <p className="text-xs text-warm-muted mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepRunner>
  )
}
