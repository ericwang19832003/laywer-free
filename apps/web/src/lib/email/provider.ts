/**
 * Email Provider Abstraction
 *
 * Provider selection via EMAIL_PROVIDER env var:
 * - 'stub' (default): Logs to console, returns fake message ID
 * - 'resend': Sends real email via Resend API
 *
 * Provider keys are NEVER exposed to the client — this runs server-side only.
 */

export interface SendEmailInput {
  to: string
  subject: string
  body: string
}

export interface SendEmailResult {
  success: boolean
  messageId: string | null
  error?: string
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const provider = process.env.EMAIL_PROVIDER ?? 'stub'

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[EMAIL] RESEND_API_KEY not set — falling back to stub provider')
      return sendEmailStub(input)
    }
    return sendEmailResend(input, apiKey)
  }

  if (provider === 'stub') {
    return sendEmailStub(input)
  }

  return {
    success: false,
    messageId: null,
    error: `Unknown email provider: ${provider}`,
  }
}

/**
 * Stub provider for development.
 * Logs the email to the console and returns a fake message ID.
 */
async function sendEmailStub(input: SendEmailInput): Promise<SendEmailResult> {
  console.log('[EMAIL STUB] Sending email:')
  console.log(`  To: ${input.to}`)
  console.log(`  Subject: ${input.subject}`)
  console.log(`  Body length: ${input.body.length} chars`)
  console.log(`  Body preview: ${input.body.slice(0, 120)}...`)

  // Simulate async send
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    success: true,
    messageId: `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
}

/**
 * Resend provider for production email delivery.
 */
async function sendEmailResend(input: SendEmailInput, apiKey: string): Promise<SendEmailResult> {
  const fromAddress = process.env.EMAIL_FROM_ADDRESS ?? 'noreply@lawyerfree.app'

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      text: input.body,
    })

    if (error) {
      console.error('[EMAIL RESEND] Send failed:', error.message)
      return {
        success: false,
        messageId: null,
        error: error.message,
      }
    }

    return {
      success: true,
      messageId: data?.id ?? null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Resend error'
    console.error('[EMAIL RESEND] Exception:', message)
    return {
      success: false,
      messageId: null,
      error: message,
    }
  }
}
