/**
 * GET /api/ai/search?q=...
 * Semantic quest search using Gemini re-ranking.
 * Fetches quests filtered by user profile, then asks Gemini to rank
 * by relevance to the query. No embeddings or pgvector needed.
 */
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'
import { getUserProfile } from '@/lib/queries'
import { generate } from '@/lib/gemini'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  const trimmed = query?.trim() ?? ''
  if (trimmed.length < 2 || trimmed.length > 200) {
    return NextResponse.json({ error: 'Query must be 2–200 characters' }, { status: 400 })
  }

  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const supabase = createSupabaseServerClient()
    const profile  = await getUserProfile(supabase, user.id)
    if (!profile) return NextResponse.json({ quests: [], fallback: true })

    // Fetch candidate quests filtered by user profile
    const { data: quests } = await supabase
      .from('quests')
      .select('id, title, description, category, tier, xp_reward, duration_minutes, cost_min, cost_max, tags, info')
      .eq('is_active', true)
      .lte('min_age', profile.age)
      .gte('max_age', profile.age)
      .in('personality_match', ['all', profile.personality_type])

    if (!quests || quests.length === 0) {
      return NextResponse.json({ quests: [], fallback: true })
    }

    // Ask Gemini to rank by relevance — return ordered IDs only (cheap output)
    const catalog = quests.map((q, i) =>
      `${i + 1}. [${q.id}] ${q.title} — ${q.description} (${q.category}, tags: ${q.tags?.join(', ')})`
    ).join('\n')

    const text = await generate({
      system: 'You are a quest relevance ranker. Return ONLY a JSON array of quest UUIDs ordered by relevance. No explanation.',
      prompt: `User search query: "${query}"

Quest catalog:
${catalog}

Return the 8 most relevant quest UUIDs as a JSON array, most relevant first.
Example format: ["uuid1","uuid2","uuid3"]
If none are relevant, return [].`,
      maxTokens: 256,
      temperature: 0.2,
    })

    // Parse the UUID array from Gemini response
    const arrayMatch = text.match(/\[[\s\S]*?\]/)
    if (!arrayMatch) return NextResponse.json({ quests: [], fallback: true })

    const rankedIds: string[] = JSON.parse(arrayMatch[0])

    // Return quests in ranked order
    const questMap = Object.fromEntries(quests.map(q => [q.id, q]))
    const ranked = rankedIds
      .filter(id => questMap[id])
      .map(id => questMap[id])
      .slice(0, 8)

    return NextResponse.json({ quests: ranked, semantic: true, query })
  } catch (err) {
    console.error('[AI Search]', err)
    return NextResponse.json({ quests: [], fallback: true })
  }
}
