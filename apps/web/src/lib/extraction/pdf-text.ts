import Anthropic from '@anthropic-ai/sdk'

export async function extractTextFromPdf(buffer: Uint8Array | ArrayBuffer): Promise<string> {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  const base64 = btoa(binary)
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: 'Extract all text from this PDF document verbatim. Return only the extracted text, nothing else.' },
        ],
      }],
    })
    const block = response.content[0]
    return block.type === 'text' ? block.text : ''
  } catch {
    return ''
  }
}
