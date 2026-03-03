'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface ClaimDetailsStepProps {
  claimSubType: string
  formValues: Record<string, string | boolean>
  onFieldChange: (field: string, value: string | boolean) => void
}

function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  rows?: number
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      style={{ minHeight: `${rows * 24}px` }}
      rows={rows}
    />
  )
}

function SecurityDepositForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lease-start-date" className="text-sm font-medium text-warm-text">
            Lease start date
          </Label>
          <Input
            id="lease-start-date"
            type="date"
            value={(formValues.leaseStartDate as string) ?? ''}
            onChange={(e) => onFieldChange('leaseStartDate', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="lease-end-date" className="text-sm font-medium text-warm-text">
            Lease end date
          </Label>
          <Input
            id="lease-end-date"
            type="date"
            value={(formValues.leaseEndDate as string) ?? ''}
            onChange={(e) => onFieldChange('leaseEndDate', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="deposit-amount" className="text-sm font-medium text-warm-text">
          Security deposit amount
        </Label>
        <HelpTooltip label="What amount should I enter?">
          <p>Enter the total amount of your security deposit as stated in your lease agreement.</p>
        </HelpTooltip>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
          <Input
            id="deposit-amount"
            type="number"
            min="0"
            step="0.01"
            value={(formValues.depositAmount as string) ?? ''}
            onChange={(e) => onFieldChange('depositAmount', e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="move-out-date" className="text-sm font-medium text-warm-text">
          Move-out date
        </Label>
        <Input
          id="move-out-date"
          type="date"
          value={(formValues.moveOutDate as string) ?? ''}
          onChange={(e) => onFieldChange('moveOutDate', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="deductions" className="text-sm font-medium text-warm-text">
          What did the landlord deduct?
        </Label>
        <HelpTooltip label="What should I include?">
          <p>
            Describe each deduction the landlord made from your deposit. If the landlord didn&apos;t
            provide an itemized list within 30 days of move-out, note that here.
          </p>
        </HelpTooltip>
        <TextArea
          id="deductions"
          value={(formValues.deductions as string) ?? ''}
          onChange={(v) => onFieldChange('deductions', v)}
          placeholder="e.g. Landlord deducted $500 for carpet cleaning and $300 for painting, but the carpet was already stained when I moved in..."
        />
      </div>
    </div>
  )
}

function BreachOfContractForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="contract-date" className="text-sm font-medium text-warm-text">
          Date of the contract or agreement
        </Label>
        <Input
          id="contract-date"
          type="date"
          value={(formValues.contractDate as string) ?? ''}
          onChange={(e) => onFieldChange('contractDate', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="what-was-promised" className="text-sm font-medium text-warm-text">
          What was promised?
        </Label>
        <HelpTooltip label="How should I describe this?">
          <p>
            Summarize the key terms of the agreement. What did the other party agree to do
            or provide? Be specific about deadlines, amounts, and deliverables.
          </p>
        </HelpTooltip>
        <TextArea
          id="what-was-promised"
          value={(formValues.whatWasPromised as string) ?? ''}
          onChange={(v) => onFieldChange('whatWasPromised', v)}
          placeholder="e.g. The contractor agreed to remodel the kitchen by March 1 for $8,000..."
        />
      </div>
      <div>
        <Label htmlFor="what-happened" className="text-sm font-medium text-warm-text">
          What happened?
        </Label>
        <HelpTooltip label="What should I include?">
          <p>
            Describe how the other party failed to fulfill their obligations. Include dates and
            specific details about what went wrong.
          </p>
        </HelpTooltip>
        <TextArea
          id="what-happened"
          value={(formValues.whatHappened as string) ?? ''}
          onChange={(v) => onFieldChange('whatHappened', v)}
          placeholder="e.g. The contractor stopped showing up after demolishing the old kitchen, never completed the work..."
        />
      </div>
      <div>
        <Label htmlFor="breach-date" className="text-sm font-medium text-warm-text">
          When did the breach occur?
        </Label>
        <Input
          id="breach-date"
          type="date"
          value={(formValues.breachDate as string) ?? ''}
          onChange={(e) => onFieldChange('breachDate', e.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  )
}

function ConsumerRefundForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="purchase-date" className="text-sm font-medium text-warm-text">
          Date of purchase
        </Label>
        <Input
          id="purchase-date"
          type="date"
          value={(formValues.purchaseDate as string) ?? ''}
          onChange={(e) => onFieldChange('purchaseDate', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="product-service" className="text-sm font-medium text-warm-text">
          Product or service purchased
        </Label>
        <Input
          id="product-service"
          value={(formValues.productService as string) ?? ''}
          onChange={(e) => onFieldChange('productService', e.target.value)}
          placeholder="e.g. Home appliance repair service"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="amount-paid" className="text-sm font-medium text-warm-text">
          Amount paid
        </Label>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
          <Input
            id="amount-paid"
            type="number"
            min="0"
            step="0.01"
            value={(formValues.amountPaid as string) ?? ''}
            onChange={(e) => onFieldChange('amountPaid', e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="what-went-wrong" className="text-sm font-medium text-warm-text">
          What went wrong?
        </Label>
        <HelpTooltip label="What should I describe?">
          <p>
            Explain how the product or service failed to meet expectations. Was it defective?
            Was the service not performed? Was it misrepresented?
          </p>
        </HelpTooltip>
        <TextArea
          id="what-went-wrong"
          value={(formValues.whatWentWrong as string) ?? ''}
          onChange={(v) => onFieldChange('whatWentWrong', v)}
          placeholder="e.g. The appliance broke again within a week of the repair..."
        />
      </div>
      <div>
        <Label htmlFor="refund-attempts" className="text-sm font-medium text-warm-text">
          What steps have you taken to get a refund?
        </Label>
        <TextArea
          id="refund-attempts"
          value={(formValues.refundAttempts as string) ?? ''}
          onChange={(v) => onFieldChange('refundAttempts', v)}
          placeholder="e.g. I called the company 3 times and sent a written complaint on Jan 15..."
        />
      </div>
    </div>
  )
}

function PropertyDamageForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="what-was-damaged" className="text-sm font-medium text-warm-text">
          What was damaged?
        </Label>
        <TextArea
          id="what-was-damaged"
          value={(formValues.whatWasDamaged as string) ?? ''}
          onChange={(v) => onFieldChange('whatWasDamaged', v)}
          placeholder="e.g. My fence, driveway, and landscaping..."
        />
      </div>
      <div>
        <Label htmlFor="damage-date" className="text-sm font-medium text-warm-text">
          When did the damage occur?
        </Label>
        <Input
          id="damage-date"
          type="date"
          value={(formValues.damageDate as string) ?? ''}
          onChange={(e) => onFieldChange('damageDate', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="how-damaged" className="text-sm font-medium text-warm-text">
          How was it damaged?
        </Label>
        <HelpTooltip label="What details help?">
          <p>
            Describe how the damage happened. Include who caused it, the circumstances, and
            whether it was intentional or negligent.
          </p>
        </HelpTooltip>
        <TextArea
          id="how-damaged"
          value={(formValues.howDamaged as string) ?? ''}
          onChange={(v) => onFieldChange('howDamaged', v)}
          placeholder="e.g. My neighbor's contractor drove heavy equipment over my property..."
        />
      </div>
      <div>
        <Label htmlFor="repair-estimates" className="text-sm font-medium text-warm-text">
          Repair estimates received
        </Label>
        <HelpTooltip label="Why do I need estimates?">
          <p>
            Having at least two repair estimates helps establish the fair cost of repairs and
            strengthens your case. Include the name of the company and the amount quoted.
          </p>
        </HelpTooltip>
        <TextArea
          id="repair-estimates"
          value={(formValues.repairEstimates as string) ?? ''}
          onChange={(v) => onFieldChange('repairEstimates', v)}
          placeholder="e.g. ABC Fencing: $2,500 for fence replacement. XYZ Landscaping: $1,200 for lawn restoration..."
        />
      </div>
    </div>
  )
}

function CarAccidentForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="accident-date" className="text-sm font-medium text-warm-text">
          Date of the accident
        </Label>
        <Input
          id="accident-date"
          type="date"
          value={(formValues.accidentDate as string) ?? ''}
          onChange={(e) => onFieldChange('accidentDate', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="accident-location" className="text-sm font-medium text-warm-text">
          Location of the accident
        </Label>
        <Input
          id="accident-location"
          value={(formValues.accidentLocation as string) ?? ''}
          onChange={(e) => onFieldChange('accidentLocation', e.target.value)}
          placeholder="e.g. Intersection of Main St and 5th Ave, Austin, TX"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="accident-description" className="text-sm font-medium text-warm-text">
          What happened?
        </Label>
        <HelpTooltip label="What should I include?">
          <p>
            Describe the accident in detail: what you were doing, what the other driver did,
            road conditions, weather, and any witnesses. Stick to facts.
          </p>
        </HelpTooltip>
        <TextArea
          id="accident-description"
          value={(formValues.accidentDescription as string) ?? ''}
          onChange={(v) => onFieldChange('accidentDescription', v)}
          placeholder="e.g. I was stopped at a red light when the other driver rear-ended my vehicle..."
          rows={5}
        />
      </div>
      <div>
        <Label htmlFor="fault-reason" className="text-sm font-medium text-warm-text">
          Why is the other party at fault?
        </Label>
        <TextArea
          id="fault-reason"
          value={(formValues.faultReason as string) ?? ''}
          onChange={(v) => onFieldChange('faultReason', v)}
          placeholder="e.g. The other driver was texting and ran the red light according to the police report..."
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
        <input
          type="checkbox"
          checked={Boolean(formValues.hasInsurance)}
          onChange={(e) => onFieldChange('hasInsurance', e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
        />
        <span className="text-sm text-warm-text">I have auto insurance for this vehicle</span>
      </label>
    </div>
  )
}

function NeighborDisputeForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dispute-nature" className="text-sm font-medium text-warm-text">
          Nature of the dispute
        </Label>
        <HelpTooltip label="What types of disputes qualify?">
          <p>
            Common neighbor disputes include property damage, boundary disagreements, noise,
            tree or vegetation issues, water drainage, and nuisance conditions.
          </p>
        </HelpTooltip>
        <TextArea
          id="dispute-nature"
          value={(formValues.disputeNature as string) ?? ''}
          onChange={(v) => onFieldChange('disputeNature', v)}
          placeholder="e.g. My neighbor's tree fell on my fence during a storm and they refuse to pay for repairs..."
        />
      </div>
      <div>
        <Label htmlFor="your-address" className="text-sm font-medium text-warm-text">
          Your property address
        </Label>
        <Input
          id="your-address"
          value={(formValues.yourPropertyAddress as string) ?? ''}
          onChange={(e) => onFieldChange('yourPropertyAddress', e.target.value)}
          placeholder="e.g. 123 Oak St, Austin, TX 78701"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="neighbor-address" className="text-sm font-medium text-warm-text">
          Neighbor&apos;s property address
        </Label>
        <Input
          id="neighbor-address"
          value={(formValues.neighborPropertyAddress as string) ?? ''}
          onChange={(e) => onFieldChange('neighborPropertyAddress', e.target.value)}
          placeholder="e.g. 125 Oak St, Austin, TX 78701"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="dispute-duration" className="text-sm font-medium text-warm-text">
          How long has this been going on?
        </Label>
        <Input
          id="dispute-duration"
          value={(formValues.disputeDuration as string) ?? ''}
          onChange={(e) => onFieldChange('disputeDuration', e.target.value)}
          placeholder="e.g. About 6 months, since September 2025"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="resolution-attempts" className="text-sm font-medium text-warm-text">
          What have you done to try to resolve this?
        </Label>
        <TextArea
          id="resolution-attempts"
          value={(formValues.resolutionAttempts as string) ?? ''}
          onChange={(v) => onFieldChange('resolutionAttempts', v)}
          placeholder="e.g. I spoke with my neighbor twice, sent a written letter on Jan 10, and contacted the HOA..."
        />
      </div>
    </div>
  )
}

function UnpaidLoanForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="loan-date" className="text-sm font-medium text-warm-text">
          Date of the loan
        </Label>
        <Input
          id="loan-date"
          type="date"
          value={(formValues.loanDate as string) ?? ''}
          onChange={(e) => onFieldChange('loanDate', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="loan-amount" className="text-sm font-medium text-warm-text">
          Loan amount
        </Label>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
          <Input
            id="loan-amount"
            type="number"
            min="0"
            step="0.01"
            value={(formValues.loanAmount as string) ?? ''}
            onChange={(e) => onFieldChange('loanAmount', e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="loan-terms" className="text-sm font-medium text-warm-text">
          Loan terms
        </Label>
        <HelpTooltip label="What terms should I describe?">
          <p>
            Include any agreed-upon repayment schedule, interest rate, due date, or other
            conditions. If the loan was verbal, describe the terms as you understood them.
          </p>
        </HelpTooltip>
        <TextArea
          id="loan-terms"
          value={(formValues.loanTerms as string) ?? ''}
          onChange={(v) => onFieldChange('loanTerms', v)}
          placeholder="e.g. I lent $5,000 to be repaid in monthly installments of $500 over 10 months..."
        />
      </div>
      <div>
        <Label htmlFor="payments-made" className="text-sm font-medium text-warm-text">
          Payments made so far
        </Label>
        <TextArea
          id="payments-made"
          value={(formValues.paymentsMade as string) ?? ''}
          onChange={(v) => onFieldChange('paymentsMade', v)}
          placeholder="e.g. They paid $1,000 in January and $500 in February, then stopped..."
        />
      </div>
      <div>
        <Label htmlFor="amount-still-owed" className="text-sm font-medium text-warm-text">
          Amount still owed
        </Label>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
          <Input
            id="amount-still-owed"
            type="number"
            min="0"
            step="0.01"
            value={(formValues.amountStillOwed as string) ?? ''}
            onChange={(e) => onFieldChange('amountStillOwed', e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>
    </div>
  )
}

function OtherClaimForm({
  formValues,
  onFieldChange,
}: Pick<ClaimDetailsStepProps, 'formValues' | 'onFieldChange'>) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="incident-date" className="text-sm font-medium text-warm-text">
          Date of the incident
        </Label>
        <Input
          id="incident-date"
          type="date"
          value={(formValues.incidentDate as string) ?? ''}
          onChange={(e) => onFieldChange('incidentDate', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="claim-description" className="text-sm font-medium text-warm-text">
          Describe your claim in detail
        </Label>
        <HelpTooltip label="What should I include?">
          <p>
            Provide a complete description of what happened, when it happened, who was involved,
            and how you were affected financially. Include dates and dollar amounts where possible.
          </p>
        </HelpTooltip>
        <TextArea
          id="claim-description"
          value={(formValues.claimDescription as string) ?? ''}
          onChange={(v) => onFieldChange('claimDescription', v)}
          placeholder="Describe what happened, when, and how you were financially affected..."
          rows={6}
        />
      </div>
    </div>
  )
}

export function ClaimDetailsStep({
  claimSubType,
  formValues,
  onFieldChange,
}: ClaimDetailsStepProps) {
  return (
    <div className="space-y-6">
      {(() => {
        switch (claimSubType) {
          case 'security_deposit':
            return <SecurityDepositForm formValues={formValues} onFieldChange={onFieldChange} />
          case 'breach_of_contract':
            return <BreachOfContractForm formValues={formValues} onFieldChange={onFieldChange} />
          case 'consumer_refund':
            return <ConsumerRefundForm formValues={formValues} onFieldChange={onFieldChange} />
          case 'property_damage':
            return <PropertyDamageForm formValues={formValues} onFieldChange={onFieldChange} />
          case 'car_accident':
            return <CarAccidentForm formValues={formValues} onFieldChange={onFieldChange} />
          case 'neighbor_dispute':
            return <NeighborDisputeForm formValues={formValues} onFieldChange={onFieldChange} />
          case 'unpaid_loan':
            return <UnpaidLoanForm formValues={formValues} onFieldChange={onFieldChange} />
          case 'other':
          default:
            return <OtherClaimForm formValues={formValues} onFieldChange={onFieldChange} />
        }
      })()}
    </div>
  )
}
