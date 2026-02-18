import { createWorker } from 'tesseract.js'

export async function extractTextFromImage(
  buffer: Buffer,
  _mimeType: string
): Promise<string> {
  const worker = await createWorker('eng')
  try {
    const { data } = await worker.recognize(buffer)
    return data.text ?? ''
  } finally {
    await worker.terminate()
  }
}
