import twilio from 'twilio'

export async function sendSms(params: {
  to: string
  body: string
}): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Twilio not configured — missing env vars' }
  }

  try {
    const client = twilio(accountSid, authToken)
    await client.messages.create({
      from: fromNumber,
      to: params.to,
      body: params.body,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Twilio error'
    return { success: false, error: message }
  }
}
