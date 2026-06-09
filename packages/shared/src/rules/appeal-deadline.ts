const APPEAL_DAYS: Record<string, number> = {
  CA: 60, // Cal. Rules of Court, rule 8.104
  MN: 60, // Minn. R. Civ. App. P. 104.01, subd. 1
  NJ: 45, // N.J. Ct. R. 2:4-1(a)
  WI: 45, // Wis. Stat. § 808.04(1)
  CO: 49, // C.A.R. 4(a)(1)
  AL: 42, // Ala. R. App. P. 4(a)(1)
  ID: 42, // I.A.R. 14(a)
  MI: 21, // MCR 7.204(A)(1)(a)
  ME: 21, // Me. R. App. P. 2B(b)(1)
  CT: 20, // Conn. Practice Book § 63-1(a)
  RI: 20, // R.I. Super. Ct. App. R. 4(a)
}

export function appealDeadlineDays(state: string): number {
  return APPEAL_DAYS[state.toUpperCase()] ?? 30
}

export function calculateAppealDeadline(judgmentDate: Date | string, state: string): Date {
  const d = new Date(typeof judgmentDate === 'string' ? judgmentDate : judgmentDate.getTime())
  d.setUTCDate(d.getUTCDate() + appealDeadlineDays(state))
  return d
}
