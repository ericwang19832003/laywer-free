import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-large'
const EMBEDDING_DIMENSIONS = 3072
const MAX_BATCH_SIZE = 20

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const openai = new OpenAI({ apiKey })
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE)
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    })
    for (const item of response.data) {
      embeddings.push(item.embedding)
    }
  }

  return embeddings
}

export async function generateSingleEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text])
  return embedding
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS }
