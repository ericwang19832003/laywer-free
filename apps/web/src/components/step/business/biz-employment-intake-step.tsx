'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface BizEmploymentIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function BizEmploymentIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: BizEmploymentIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [employerName, setEmployerName] = useState(
    (existingMetadata?.employer_name as string) || ''
  )
  const [employerSize, setEmployerSize] = useState(
    (existingMetadata?.employer_size as string) || 'small_under_15'
  )
  const [positionTitle, setPositionTitle] = useState(
    (existingMetadata?.position_title as string) || ''
  )
  const [employmentStartDate, setEmploymentStartDate] = useState(
    (existingMetadata?.employment_start_date as string) || ''
  )
  const [employmentEndDate, setEmploymentEndDate] = useState(
    (existingMetadata?.employment_end_date as string) || ''
  )
  const [specificDisputeType, setSpecificDisputeType] = useState(
    (existingMetadata?.specific_dispute_type as string) || 'wrongful_termination'
  )
  const [hrComplaintFiled, setHrComplaintFiled] = useState(
    (existingMetadata?.hr_complaint_filed as boolean) || false
  )
  const [hasEmploymentContract, setHasEmploymentContract] = useState(
    (existingMetadata?.has_employment_contract as boolean) || false
  )
  const [hasEmployeeHandbook, setHasEmployeeHandbook] = useState(
    (existingMetadata?.has_employee_handbook as boolean) || false
  )
  const [disputeDescription, setDisputeDescription] = useState(
    (existingMetadata?.dispute_description as string) || ''
  )
  const [damagesSought, setDamagesSought] = useState(
    (existingMetadata?.damages_sought as string) || ''
  )
  const [caseStage, setCaseStage] = useState(
    (existingMetadata?.guided_answers as Record<string, string>)?.case_stage || 'start'
  )

  const parsedDamagesSought = parseFloat(damagesSought.replace(/[^0-9.]/g, '')) || 0

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  function buildMetadata() {
    return {
      county: county.trim() || null,
      employer_name: employerName.trim() || null,
      employer_size: employerSize,
      position_title: positionTitle.trim() || null,
      employment_start_date: employmentStartDate || null,
      employment_end_date: employmentEndDate || null,
      specific_dispute_type: specificDisputeType,
      hr_complaint_filed: hrComplaintFiled,
      has_employment_contract: hasEmploymentContract,
      has_employee_handbook: hasEmployeeHandbook,
      dispute_description: disputeDescription.trim() || null,
      damages_sought: parsedDamagesSought || null,
      guided_answers: { case_stage: caseStage },
    }
  }

  async function patchTask(
    status: string,
    metadata?: Record<string, unknown>
  ) {
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
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
  }

  const employerSizeLabels: Record<string, string> = {
    small_under_15: 'Small (under 15 employees)',
    medium_15_to_100: 'Medium (15-100)',
    large_over_100: 'Large (over 100)',
  }

  const disputeTypeLabels: Record<string, string> = {
    wrongful_termination: 'Wrongful termination',
    wage_overtime: 'Wage or overtime dispute',
    non_compete_nda: 'Non-compete or NDA violation',
    discrimination_harassment: 'Discrimination or harassment',
  }

  const caseStageLabels: Record<string, string> = {
    start: 'Just getting started',
    demand_sent: 'Already sent a demand letter',
    filed: 'Already filed with the court',
    served: 'Already served the other party',
    in_litigation: 'In active litigation',
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">Case stage</dt>
        <dd className="text-warm-text mt-0.5">
          {caseStageLabels[caseStage] || caseStage}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">County</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Employer</dt>
        <dd className="text-warm-text mt-0.5">
          {employerName.trim() || 'Not provided'}
          {employerName.trim() && ` (${employerSizeLabels[employerSize] || employerSize})`}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Position title</dt>
        <dd className="text-warm-text mt-0.5">
          {positionTitle.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Employment dates</dt>
        <dd className="text-warm-text mt-0.5">
          {employmentStartDate || 'Not provided'}
          {employmentStartDate && ' to '}
          {employmentStartDate && (employmentEndDate || 'Present')}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Main issue</dt>
        <dd className="text-warm-text mt-0.5">
          {disputeTypeLabels[specificDisputeType] || specificDisputeType}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Description of dispute
        </dt>
        <dd className="text-warm-text mt-0.5">
          {disputeDescription.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Damages sought</dt>
        <dd className="text-warm-text mt-0.5">
          {parsedDamagesSought > 0 ? formatCurrency(parsedDamagesSought) : 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Supporting details</dt>
        <dd className="text-warm-text mt-0.5">
          {hrComplaintFiled && 'Filed HR complaint'}
          {hrComplaintFiled && hasEmploymentContract && ' · '}
          {hasEmploymentContract && 'Has employment contract'}
          {(hrComplaintFiled || hasEmploymentContract) && hasEmployeeHandbook && ' · '}
          {hasEmployeeHandbook && 'Has employee handbook'}
          {!hrComplaintFiled && !hasEmploymentContract && !hasEmployeeHandbook && 'None indicated'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About Your Employment Dispute"
      reassurance="Understanding your employment situation helps us protect your rights effectively."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Where are you in your case? */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            How far along are you?
          </label>
          <p className="text-xs text-warm-muted">
            This helps us skip steps you&apos;ve already completed.
          </p>
          <div className="space-y-2">
            {[
              { value: 'start', label: 'Just getting started', desc: 'I haven\'t taken any action yet.' },
              { value: 'demand_sent', label: 'Already sent a demand letter', desc: 'I\'ve sent a demand letter and need to file.' },
              { value: 'filed', label: 'Already filed with the court', desc: 'I\'ve filed my employment dispute case.' },
              { value: 'served', label: 'Already served the other party', desc: 'I\'ve served the other party and am waiting for their response.' },
              { value: 'in_litigation', label: 'In active litigation', desc: 'My case is already in litigation.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  caseStage === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="biz-emp-case-stage"
                  value={option.value}
                  checked={caseStage === option.value}
                  onChange={() => setCaseStage(option.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <span className="text-sm font-medium text-warm-text">{option.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* County */}
        <div className="space-y-2">
          <label
            htmlFor="biz-emp-county"
            className="text-sm font-medium text-warm-text"
          >
            What county do you work/worked in?
          </label>
          <input
            id="biz-emp-county"
            type="text"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Employment disputes are typically filed in the county where you worked.
          </p>
        </div>

        {/* Employer Name */}
        <div className="space-y-2">
          <label
            htmlFor="biz-emp-employer-name"
            className="text-sm font-medium text-warm-text"
          >
            What is your employer&apos;s name?
          </label>
          <input
            id="biz-emp-employer-name"
            type="text"
            placeholder="e.g. Acme Corp, Smith & Associates"
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Employer Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            How large is the company?
          </label>
          <p className="text-xs text-warm-muted">
            Employer size can affect which laws apply to your case.
          </p>
          <div className="space-y-2">
            {[
              { value: 'small_under_15', label: 'Small (under 15 employees)', desc: 'Some federal employment laws may not apply.' },
              { value: 'medium_15_to_100', label: 'Medium (15-100)', desc: 'Most federal employment laws apply.' },
              { value: 'large_over_100', label: 'Large (over 100)', desc: 'All federal employment laws apply, including WARN Act.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  employerSize === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="biz-emp-employer-size"
                  value={option.value}
                  checked={employerSize === option.value}
                  onChange={() => setEmployerSize(option.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <span className="text-sm font-medium text-warm-text">{option.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Position Title */}
        <div className="space-y-2">
          <label
            htmlFor="biz-emp-position"
            className="text-sm font-medium text-warm-text"
          >
            What was your job title?
          </label>
          <input
            id="biz-emp-position"
            type="text"
            placeholder="e.g. Senior Software Engineer, Sales Manager"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Employment Start Date */}
        <div className="space-y-2">
          <label
            htmlFor="biz-emp-start-date"
            className="text-sm font-medium text-warm-text"
          >
            When did you start?
          </label>
          <input
            id="biz-emp-start-date"
            type="date"
            value={employmentStartDate}
            onChange={(e) => setEmploymentStartDate(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Employment End Date */}
        <div className="space-y-2">
          <label
            htmlFor="biz-emp-end-date"
            className="text-sm font-medium text-warm-text"
          >
            When did your employment end?
          </label>
          <input
            id="biz-emp-end-date"
            type="date"
            value={employmentEndDate}
            onChange={(e) => setEmploymentEndDate(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Leave blank if you are still employed.
          </p>
        </div>

        {/* Specific Dispute Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            What is the main issue?
          </label>
          <div className="space-y-2">
            {[
              { value: 'wrongful_termination', label: 'Wrongful termination', desc: 'You were fired without just cause or in violation of the law.' },
              { value: 'wage_overtime', label: 'Wage or overtime dispute', desc: 'You were not paid correctly for hours worked or overtime.' },
              { value: 'non_compete_nda', label: 'Non-compete or NDA violation', desc: 'A dispute over a non-compete agreement or non-disclosure agreement.' },
              { value: 'discrimination_harassment', label: 'Discrimination or harassment', desc: 'You experienced discrimination or harassment in the workplace.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  specificDisputeType === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="biz-emp-dispute-type"
                  value={option.value}
                  checked={specificDisputeType === option.value}
                  onChange={() => setSpecificDisputeType(option.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <span className="text-sm font-medium text-warm-text">{option.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* HR Complaint Filed */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hrComplaintFiled}
              onChange={(e) => setHrComplaintFiled(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                Did you file an HR complaint?
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                Filing an internal complaint can strengthen your case.
              </p>
            </div>
          </label>
        </div>

        {/* Has Employment Contract */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hasEmploymentContract}
              onChange={(e) => setHasEmploymentContract(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                Do you have a written employment contract?
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                A written contract may define termination terms and dispute resolution procedures.
              </p>
            </div>
          </label>
        </div>

        {/* Has Employee Handbook */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hasEmployeeHandbook}
              onChange={(e) => setHasEmployeeHandbook(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                Do you have a copy of the employee handbook?
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                The employee handbook often contains policies relevant to your dispute.
              </p>
            </div>
          </label>
        </div>

        {/* Dispute Description */}
        <div className="space-y-2">
          <label
            htmlFor="biz-emp-description"
            className="text-sm font-medium text-warm-text"
          >
            Briefly describe what happened
          </label>
          <textarea
            id="biz-emp-description"
            placeholder="What happened? Include dates, people involved, and any actions you've taken so far."
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Include details about the events, communications, and any documentation you have.
          </p>
        </div>

        {/* Damages Sought */}
        <div className="space-y-2">
          <label
            htmlFor="biz-emp-damages"
            className="text-sm font-medium text-warm-text"
          >
            How much are you seeking in damages?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="biz-emp-damages"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={damagesSought}
              onChange={(e) => setDamagesSought(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          <p className="text-xs text-warm-muted">
            Include lost wages, benefits, emotional distress, and other monetary losses.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
