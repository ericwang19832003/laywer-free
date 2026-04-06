interface FilingFeeCardProps {
  courtType: string
}

const FEE_INFO: Record<string, { range: string; waiver: string }> = {
  jp: {
    range: '$35 – $75',
    waiver: 'If you cannot afford the filing fee, you can file an "Affidavit of Inability to Pay Court Costs" (Texas Rule of Civil Procedure 145).',
  },
  county: {
    range: '$200 – $300',
    waiver: 'If you cannot afford the filing fee, file a "Statement of Inability to Afford Payment of Court Costs" with the clerk.',
  },
  district: {
    range: '$300 – $400',
    waiver: 'If you cannot afford the filing fee, file a "Statement of Inability to Afford Payment of Court Costs" with the clerk.',
  },
  federal: {
    range: '$405',
    waiver: 'If you cannot afford the filing fee, file a motion to proceed In Forma Pauperis (IFP) with a financial affidavit.',
  },
}

export function FilingFeeCard({ courtType }: FilingFeeCardProps) {
  const info = FEE_INFO[courtType] ?? FEE_INFO.district

  return (
    <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
      <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Filing Fee</p>
      <p className="text-base font-semibold text-warm-text">{info.range}</p>
      <p className="text-sm text-warm-muted">{info.waiver}</p>
    </div>
  )
}
