import Anthropic from '@anthropic-ai/sdk'

const SUPPORTED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mediaType = (
    SUPPORTED_MEDIA_TYPES.has(mimeType) ? mimeType : 'image/jpeg'
  ) as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: buffer.toString('base64') },
        },
        {
          type: 'text',
          text: 'Extract all text from this image verbatim. Return only the extracted text, nothing else.',
        },
      ],
    }],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
