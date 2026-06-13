import { NextResponse } from 'next/server'
import { generate, buildUserContextSystem } from '@/lib/gemini'
import { getAuthUser } from '@/lib/supabase-server'
import { sanitizeInput, isValidUUID } from '@/lib/security'

export async function POST(req: Request) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { user, quests, recentCompletedIds = [] } = await req.json()
    if (!user || !quests) {
      return NextResponse.json({ error: 'user and quests required' }, { status: 400 })
    }

    if (!Array.isArray(quests) || quests.length === 0) {
      return NextResponse.json({ error: 'quests must be a non-empty array' }, { status: 400 })
    }

    const hour = new Date().getHours()
    let timeContext = 'evening'
    if (hour < 12) timeContext = 'morning'
    else if (hour < 17) timeContext = 'afternoon'

    // Sanitize quest fields before embedding in prompt
    const questCatalog = quests
      .filter((q: any) => !recentCompletedIds.includes(q.id))
      .slice(0, 20)
      .map((q: any, i: number) => {
        const safeTitle    = sanitizeInput(q.title, 80)
        const safeCategory = sanitizeInput(q.category, 40)
        const safeTier     = sanitizeInput(q.tier, 20)
        const safeXp       = Number.isInteger(q.xp_reward) ? q.xp_reward : 0
        const safeDuration = Number.isInteger(q.duration_minutes) ? q.duration_minutes : 0
        const safeTags     = (Array.isArray(q.tags) ? q.tags : [])
          .slice(0, 3)
          .map((t: unknown) => sanitizeInput(t, 25))
          .join(', ')
        return `${i + 1}. [${isValidUUID(q.id) ? q.id : 'invalid'}] ${safeTitle} | ${safeCategory} | ${safeTier} tier | ${safeXp} XP | ${safeDuration}min | Tags: ${safeTags}`
      })
      .join('\n')

    const safeUsername = sanitizeInput(user.username, 40)

    const text = await generate({
      system: buildUserContextSystem(user),
      prompt: `Available quests:
${questCatalog}

It is ${timeContext} and ${safeUsername}'s streak is ${Number.isInteger(user.streak_count) ? user.streak_count : 0} days.
Total quests completed: ${Number.isInteger(user.total_quests_completed) ? user.total_quests_completed : 0}.

Pick ONE quest that is the best fit for today. Respond in this exact JSON format (no markdown, no extra text):
{"quest_id": "<UUID from the list>", "reasoning": "<1-2 sentences, specific to the user and time of day>"}`,
      maxTokens: 512,
      temperature: 0.6,
    })

    const jsonMatch = /\{[\s\S]*?\}/.exec(text)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Unexpected AI response format' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    // Validate the returned quest_id is actually in our catalog
    const validIds = new Set(quests.slice(0, 20).map((q: any) => q.id))
    if (!validIds.has(parsed.quest_id)) {
      return NextResponse.json({ error: 'Unexpected AI response format' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[AI Advisor]', err)
    return NextResponse.json({ error: 'Advisor unavailable' }, { status: 500 })
  }
}
