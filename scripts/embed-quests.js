/**
 * Generate and store Voyage AI embeddings for all quests.
 * Run once after setting VOYAGE_API_KEY:
 *   node scripts/embed-quests.js
 *
 * Re-run whenever new quests are added (skips already-embedded quests).
 */
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://wlygksomnxowiralustj.supabase.co'
const s = require('./_client')

const VOYAGE_URL   = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3-lite'

function buildQuestText(q) {
  return [
    q.title,
    q.description,
    `Category: ${q.category}`,
    `Tags: ${(q.tags || []).join(', ')}`,
    `Difficulty: ${q.tier}`,
  ].join('\n')
}

async function getEmbeddings(texts) {
  const key = process.env.VOYAGE_API_KEY
  if (!key) throw new Error('Set VOYAGE_API_KEY in scripts/.env')

  const res = await fetch(VOYAGE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: texts, model: VOYAGE_MODEL }),
  })
  if (!res.ok) throw new Error(`Voyage API error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.data.map(d => d.embedding)
}

async function run() {
  // Fetch quests without embeddings
  const { data: quests, error } = await s
    .from('quests')
    .select('id, title, description, category, tags, tier')
    .eq('is_active', true)
    .is('embedding', null)

  if (error) { console.error('DB error:', error.message); return }
  if (!quests || quests.length === 0) {
    console.log('All quests already embedded.')
    return
  }

  console.log(`Embedding ${quests.length} quests…`)

  // Batch in groups of 128 (Voyage AI limit)
  let embedded = 0
  for (let i = 0; i < quests.length; i += 128) {
    const batch = quests.slice(i, i + 128)
    const texts = batch.map(buildQuestText)
    const embeddings = await getEmbeddings(texts)

    for (let j = 0; j < batch.length; j++) {
      const { error: updateErr } = await s
        .from('quests')
        .update({ embedding: `[${embeddings[j].join(',')}]` })
        .eq('id', batch[j].id)

      if (updateErr) {
        console.error(`  Failed to update quest ${batch[j].id}:`, updateErr.message)
      } else {
        embedded++
        console.log(`  ✓ [${embedded}/${quests.length}] ${batch[j].title}`)
      }
    }

    // Rate limit: 100 req/min free tier → small delay between batches
    if (i + 128 < quests.length) {
      await new Promise(r => setTimeout(r, 700))
    }
  }

  console.log(`\nDone — ${embedded} quests embedded with ${VOYAGE_MODEL}.`)
}

run().catch(console.error)
