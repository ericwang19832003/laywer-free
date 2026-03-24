import { PDFParse } from 'pdf-parse'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText({ first: 5 })
    return result.text ?? ''
  } catch {
    return ''
  } finally {
    await parser.destroy().catch(() => {})
  }
}
