/**
 * Certificate of Service Template Generator
 *
 * Generates a Texas Certificate of Service following Texas Rules of Civil
 * Procedure Rule 21a. The certificate attests that a copy of the filed
 * document was properly served on the opposing party.
 *
 * Pure function — no side effects, trivially unit-testable.
 */

// ── Types ────────────────────────────────────────────────────────

export interface CertificateInput {
  caseNumber: string
  courtName: string
  yourName: string
  yourAddress: string
  yourPhone: string
  plaintiffName: string
  plaintiffAttorneyName: string
  plaintiffAttorneyAddress: string
  serviceMethod: 'certified_mail' | 'hand_delivery' | 'eservice'
  serviceDate: string // ISO date
  documentTitle?: string // defaults to "DEFENDANT'S ORIGINAL ANSWER"
}

// ── Helpers ──────────────────────────────────────────────────────

const SERVICE_METHOD_LABELS: Record<
  CertificateInput['serviceMethod'],
  string
> = {
  certified_mail: 'certified mail, return receipt requested',
  hand_delivery: 'hand delivery',
  eservice: 'electronic service through eFileTexas.gov',
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Generator ────────────────────────────────────────────────────

export function generateCertificateOfService(
  input: CertificateInput,
): string {
  const docTitle =
    input.documentTitle ?? "DEFENDANT'S ORIGINAL ANSWER"
  const methodLabel = SERVICE_METHOD_LABELS[input.serviceMethod]
  const formattedDate = formatDate(input.serviceDate)

  const lines = [
    `CAUSE NO. ${input.caseNumber}`,
    '',
    `${input.plaintiffName},`,
    '     Plaintiff,',
    '',
    'v.',
    '',
    `${input.yourName},`,
    '     Defendant.',
    '',
    `IN THE ${input.courtName.toUpperCase()}`,
    '',
    '',
    'CERTIFICATE OF SERVICE',
    '',
    `I hereby certify that a true and correct copy of the foregoing ${docTitle} was served on ${input.plaintiffAttorneyName} at ${input.plaintiffAttorneyAddress} by ${methodLabel} on ${formattedDate}.`,
    '',
    '',
    '',
    '___________________________',
    `${input.yourName}, Pro Se Defendant`,
    input.yourAddress,
    input.yourPhone,
  ]

  return lines.join('\n')
}
