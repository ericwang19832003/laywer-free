export function shouldSendSms(params: {
  smsOptIn: boolean
  phone: string | null | undefined
}): boolean {
  return params.smsOptIn === true && Boolean(params.phone)
}
