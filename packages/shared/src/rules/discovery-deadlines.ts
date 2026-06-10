function addDays(date: Date | string, days: number): Date {
  const d = new Date(date instanceof Date ? date.getTime() : date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

/** Opposing party has 30 days to respond to served discovery (TRCP 196.2(a)). */
export function discoveryResponseDeadline(servedAt: Date | string): Date {
  return addDays(servedAt, 30)
}

/** Discovery closes 180 days after the answer deadline (TRCP 190.3). */
export function discoveryCutoffDate(answerDeadline: Date | string): Date {
  return addDays(answerDeadline, 180)
}
