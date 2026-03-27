const LOB_BASE = 'https://api.lob.com/v1'

interface LobAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

interface LobLetterInput {
  recipientName: string
  recipientAddress: LobAddress
  senderName: string
  senderAddress: LobAddress
  htmlContent: string
}

export interface LobLetterResult {
  id: string
  trackingNumber: string | null
  expectedDeliveryDate: string | null
  url: string
}

export async function sendCertifiedLetter(input: LobLetterInput): Promise<LobLetterResult> {
  const apiKey = process.env.LOB_API_KEY
  if (!apiKey) throw new Error('LOB_API_KEY not configured')

  const res = await fetch(`${LOB_BASE}/letters`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: {
        name: input.recipientName,
        address_line1: input.recipientAddress.line1,
        address_line2: input.recipientAddress.line2 || undefined,
        address_city: input.recipientAddress.city,
        address_state: input.recipientAddress.state,
        address_zip: input.recipientAddress.zip,
      },
      from: {
        name: input.senderName,
        address_line1: input.senderAddress.line1,
        address_line2: input.senderAddress.line2 || undefined,
        address_city: input.senderAddress.city,
        address_state: input.senderAddress.state,
        address_zip: input.senderAddress.zip,
      },
      file: input.htmlContent,
      color: false,
      mail_type: 'usps_first_class',
      extra_service: 'certified',
      return_envelope: false,
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Lob API error: ${res.status} — ${JSON.stringify(err)}`)
  }

  const letter = await res.json()
  return {
    id: letter.id,
    trackingNumber: letter.tracking_number ?? null,
    expectedDeliveryDate: letter.expected_delivery_date ?? null,
    url: letter.url ?? '',
  }
}
