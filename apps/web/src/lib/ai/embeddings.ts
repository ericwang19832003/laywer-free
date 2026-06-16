import OpenAI from 'openai'

const DOCUMENT_EMBEDDING_MODEL = 'text-embedding-3-small'
const DOCUMENT_EMBEDDING_DIMENSIONS = 1536
const MAX_BATCH_SIZE = 100

export async function generateDocumentEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const openai = new OpenAI({ apiKey })
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE)
    const response = await openai.embeddings.create({
      model: DOCUMENT_EMBEDDING_MODEL,
      dimensions: DOCUMENT_EMBEDDING_DIMENSIONS,
      input: batch,
    })
    for (const item of response.data) {
      embeddings.push(item.embedding)
    }
  }

  return embeddings
}

export async function generateDocumentEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateDocumentEmbeddings([text])
  if (!embedding) throw new Error('OpenAI returned no embedding for the input text')
  return embedding
}

export { DOCUMENT_EMBEDDING_MODEL, DOCUMENT_EMBEDDING_DIMENSIONS }
