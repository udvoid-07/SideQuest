// ── Voyage AI embeddings + pgvector RAG ──────────────────
// Voyage AI is Anthropic's recommended embedding partner.
// voyage-3-lite: 512 dims, free tier 200M tokens/month

const VOYAGE_URL   = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3-lite'

export async function embedText(text: string): Promise<number[]> {
  const key = process.env.VOYAGE_API_KEY
  if (!key || key === 'your_voyage_api_key') {
    throw new Error('VOYAGE_API_KEY not configured. Get a free key at voyageai.com/api-keys')
  }

  const res = await fetch(VOYAGE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: [text], model: VOYAGE_MODEL }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Voyage AI error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.data[0].embedding as number[]
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const key = process.env.VOYAGE_API_KEY
  if (!key || key === 'your_voyage_api_key') {
    throw new Error('VOYAGE_API_KEY not configured.')
  }

  // Voyage AI max 128 texts per batch
  const chunks: string[][] = []
  for (let i = 0; i < texts.length; i += 128) {
    chunks.push(texts.slice(i, i + 128))
  }

  const allEmbeddings: number[][] = []
  for (const chunk of chunks) {
    const res = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: chunk, model: VOYAGE_MODEL }),
    })
    if (!res.ok) throw new Error(`Voyage AI error ${res.status}`)
    const data = await res.json()
    allEmbeddings.push(...data.data.map((d: { embedding: number[] }) => d.embedding))
  }
  return allEmbeddings
}

// ── Build quest text for embedding ───────────────────────
// Rich text: title + description + category + tags → better semantic matching

export function buildQuestEmbedText(quest: {
  title: string
  description: string
  category: string
  tags: string[]
  tier: string
}): string {
  return [
    quest.title,
    quest.description,
    `Category: ${quest.category}`,
    `Tags: ${quest.tags.join(', ')}`,
    `Difficulty: ${quest.tier}`,
  ].join('\n')
}

// ── Vector cast helper for Supabase ──────────────────────
// pgvector expects the embedding as a JSON array string cast to vector type

export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}
