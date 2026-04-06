'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { calculateChildSupport } from '@/lib/family/child-support-calculator'
import { DollarSign } from 'lucide-react'

interface ChildSupportStepProps {
  grossIncome: string
  federalTax: string
  stateTax: string
  socialSecurity: string
  healthInsurance: string
  unionDues: string
  numberOfChildren: number
  otherChildrenCount: number
  useGuidelineAmount: boolean
  customAmount: string
  customReasoning: string
  incomeUnknown: boolean
  onFieldChange: (field: string, value: string | number | boolean) => void
}

function parseNum(v: string): number {
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function ChildSupportStep({
  grossIncome,
  federalTax,
  stateTax,
  socialSecurity,
  healthInsurance,
  unionDues,
  numberOfChildren,
  otherChildrenCount,
  useGuidelineAmount,
  customAmount,
  customReasoning,
  incomeUnknown,
  onFieldChange,
}: ChildSupportStepProps) {
  const result = useMemo(
    () =>
      calculateChildSupport({
        grossMonthlyIncome: parseNum(grossIncome),
        federalTax: parseNum(federalTax),
        stateTax: parseNum(stateTax),
        socialSecurity: parseNum(socialSecurity),
        healthInsurance: parseNum(healthInsurance),
        unionDues: parseNum(unionDues),
        numberOfChildren,
        otherChildrenCount,
      }),
    [grossIncome, federalTax, stateTax, socialSecurity, healthInsurance, unionDues, numberOfChildren, otherChildrenCount]
  )

  return (
    <div className="space-y-6">
      <HelpTooltip label="How does Texas calculate child support?">
        <div className="space-y-2">
          <p>
            Texas uses a percentage-of-income model. The court takes the obligor&apos;s
            gross monthly income, subtracts certain deductions to get &quot;net monthly
            resources,&quot; then applies a guideline percentage based on the number of children.
          </p>
          <p>
            The guidelines apply to the first $9,200 of net monthly resources. For
            income above that amount, the court has discretion.
          </p>
        </div>
      </HelpTooltip>

      <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
        <input
          type="checkbox"
          checked={incomeUnknown}
          onChange={(e) => onFieldChange('incomeUnknown', e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
        />
        <div>
          <p className="text-sm text-warm-text">I don&apos;t have income details yet</p>
          <p className="text-xs text-warm-muted">
            That&apos;s okay. You can continue and update this later.
          </p>
        </div>
      </label>

      {incomeUnknown && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-3 text-sm text-warm-text">
          <strong>Income details pending.</strong> We&apos;ll save your progress and you can
          come back to finish the calculation later.
        </div>
      )}

      {/* Income */}
      {!incomeUnknown && (
        <div className="rounded-lg border border-warm-border p-4 space-y-4">
        <p className="text-sm font-medium text-warm-text">Monthly Income</p>

        <div>
          <Label htmlFor="cs-gross-income" className="text-xs text-warm-muted">
            Gross monthly income (before taxes)
          </Label>
          <HelpTooltip label="What counts as income?">
            <p>
              Include wages, salary, tips, commissions, bonuses, self-employment income,
              rental income, dividends, interest, and any other recurring income.
            </p>
          </HelpTooltip>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
            <Input
              id="cs-gross-income"
              type="number"
              min={0}
              step="0.01"
              value={grossIncome}
              onChange={(e) => onFieldChange('grossIncome', e.target.value)}
              placeholder="0.00"
              className="pl-7"
            />
          </div>
        </div>
        </div>
      )}

      {/* Deductions */}
      {!incomeUnknown && (
        <div className="rounded-lg border border-warm-border p-4 space-y-4">
        <p className="text-sm font-medium text-warm-text">Monthly Deductions</p>
        <p className="text-xs text-warm-muted">
          Enter monthly amounts for each deduction. These are subtracted from gross income
          to calculate net monthly resources.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cs-federal-tax" className="text-xs text-warm-muted">
              Federal income tax
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
              <Input
                id="cs-federal-tax"
                type="number"
                min={0}
                step="0.01"
                value={federalTax}
                onChange={(e) => onFieldChange('federalTax', e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cs-state-tax" className="text-xs text-warm-muted">
              State income tax
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
              <Input
                id="cs-state-tax"
                type="number"
                min={0}
                step="0.01"
                value={stateTax}
                onChange={(e) => onFieldChange('stateTax', e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cs-social-security" className="text-xs text-warm-muted">
              Social Security / FICA
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
              <Input
                id="cs-social-security"
                type="number"
                min={0}
                step="0.01"
                value={socialSecurity}
                onChange={(e) => onFieldChange('socialSecurity', e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cs-health-insurance" className="text-xs text-warm-muted">
              Health insurance (for you)
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
              <Input
                id="cs-health-insurance"
                type="number"
                min={0}
                step="0.01"
                value={healthInsurance}
                onChange={(e) => onFieldChange('healthInsurance', e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cs-union-dues" className="text-xs text-warm-muted">
              Union dues
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
              <Input
                id="cs-union-dues"
                type="number"
                min={0}
                step="0.01"
                value={unionDues}
                onChange={(e) => onFieldChange('unionDues', e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Children counts */}
      <div className="rounded-lg border border-warm-border p-4 space-y-4">
        <p className="text-sm font-medium text-warm-text">Number of Children</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cs-num-children" className="text-xs text-warm-muted">
              Children in this case
            </Label>
            <Input
              id="cs-num-children"
              type="number"
              min={0}
              max={10}
              value={numberOfChildren}
              onChange={(e) => onFieldChange('numberOfChildren', parseInt(e.target.value, 10) || 0)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cs-other-children" className="text-xs text-warm-muted">
              Other children you support
            </Label>
            <HelpTooltip label="Why does this matter?">
              <p>
                If the obligor supports children from other relationships, Texas law
                reduces the child support percentage. This is called the
                &quot;multiple families&quot; adjustment under &sect; 154.129.
              </p>
            </HelpTooltip>
            <Input
              id="cs-other-children"
              type="number"
              min={0}
              max={10}
              value={otherChildrenCount}
              onChange={(e) => onFieldChange('otherChildrenCount', parseInt(e.target.value, 10) || 0)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Live calculation display */}
      {!incomeUnknown && parseNum(grossIncome) > 0 && numberOfChildren > 0 && (
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-calm-indigo" />
            <p className="text-sm font-semibold text-warm-text">
              Child Support Calculation
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-warm-muted">Net monthly resources</dt>
            <dd className="text-warm-text font-medium text-right">
              {formatCurrency(result.netMonthlyResources)}
            </dd>

            <dt className="text-warm-muted">Guideline percentage</dt>
            <dd className="text-warm-text font-medium text-right">
              {result.guidelinePercentage}%
            </dd>

            <dt className="text-warm-muted">Guideline amount</dt>
            <dd className="text-warm-text font-medium text-right">
              {formatCurrency(result.guidelineAmount)}
            </dd>

            {result.cappedAmount !== null && (
              <>
                <dt className="text-warm-muted">Cap applied ($9,200 limit)</dt>
                <dd className="text-warm-text font-medium text-right">
                  {formatCurrency(result.cappedAmount)}
                </dd>
              </>
            )}

            <dt className="text-warm-text font-semibold border-t border-calm-indigo/20 pt-2 mt-1">
              Recommended monthly amount
            </dt>
            <dd className="text-warm-text font-bold text-right border-t border-calm-indigo/20 pt-2 mt-1">
              {formatCurrency(result.finalAmount)}
            </dd>
          </dl>
        </div>
      )}

      {/* Guideline vs custom */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-warm-text">
          What amount do you want to request?
        </Label>

        <label
          className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition-colors ${
            useGuidelineAmount
              ? 'border-calm-indigo bg-calm-indigo/5'
              : 'border-warm-border hover:bg-warm-bg/50'
          }`}
        >
          <input
            type="radio"
            name="cs-amount-type"
            checked={useGuidelineAmount}
            onChange={() => onFieldChange('useGuidelineAmount', true)}
            className="mt-1 h-4 w-4 shrink-0 text-calm-indigo focus:ring-calm-indigo"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-warm-text">
                Use guideline amount
              </span>
              <span className="rounded-full bg-calm-indigo/10 px-2 py-0.5 text-xs font-medium text-calm-indigo">
                Recommended
              </span>
            </div>
            <p className="text-sm text-warm-muted mt-0.5">
              Request the amount calculated by Texas guidelines. Courts rarely deviate
              from this amount without good reason.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition-colors ${
            !useGuidelineAmount
              ? 'border-calm-indigo bg-calm-indigo/5'
              : 'border-warm-border hover:bg-warm-bg/50'
          }`}
        >
          <input
            type="radio"
            name="cs-amount-type"
            checked={!useGuidelineAmount}
            onChange={() => onFieldChange('useGuidelineAmount', false)}
            className="mt-1 h-4 w-4 shrink-0 text-calm-indigo focus:ring-calm-indigo"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-warm-text">
              Request a different amount
            </span>
            <p className="text-sm text-warm-muted mt-0.5">
              You&apos;ll need to explain why the guideline amount is not appropriate.
            </p>
          </div>
        </label>
      </div>

      {/* Custom amount fields */}
      {!useGuidelineAmount && (
        <div className="space-y-4 rounded-lg border border-warm-border p-4">
          <div>
            <Label htmlFor="cs-custom-amount" className="text-xs text-warm-muted">
              Monthly amount requested
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
              <Input
                id="cs-custom-amount"
                type="number"
                min={0}
                step="0.01"
                value={customAmount}
                onChange={(e) => onFieldChange('customAmount', e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cs-custom-reasoning" className="text-xs text-warm-muted">
              Why should the court deviate from the guideline amount?
            </Label>
            <textarea
              id="cs-custom-reasoning"
              value={customReasoning}
              onChange={(e) => onFieldChange('customReasoning', e.target.value)}
              placeholder="Explain why the guideline amount is not appropriate for your situation..."
              className="mt-1 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ minHeight: '100px' }}
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  )
}
