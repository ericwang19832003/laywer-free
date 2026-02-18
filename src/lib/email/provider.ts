/**
 * Email Provider Abstraction
 *
 * In production, swap the stub for a real provider (Resend, SendGrid, etc.).
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

  if (provider === 'stub') {
    return sendEmailStub(input)
  }

  // Future: add real provider implementations here
  // if (provider === 'resend') return sendEmailResend(input)
  // if (provider === 'sendgrid') return sendEmailSendGrid(input)

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
