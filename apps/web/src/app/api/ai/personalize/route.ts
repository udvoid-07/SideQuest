import { NextResponse } from 'next/server'
import { generate, buildUserContextSystem } from '@/lib/gemini'
import { getAuthUser } from '@/lib/supabase-server'
import { sanitizeInput } from '@/lib/security'

export async function POST(req: Request) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { quest, user } = await req.json()
    if (!quest || !user) {
      return NextResponse.json({ error: 'quest and user required' }, { status: 400 })
    }

    // Sanitize all user-controlled fields before embedding in prompts
    const safeUsername = sanitizeInput(user.username, 40)
    const safeCity     = sanitizeInput(user.city, 60)
    const safePersonality = sanitizeInput(user.personality_type, 30)
    const safeTitle    = sanitizeInput(quest.title, 100)
    const safeDesc     = sanitizeInput(quest.description, 300)
    const safeCategory = sanitizeInput(quest.category, 50)
    const safeTags     = (Array.isArray(quest.tags) ? quest.tags : [])
      .slice(0, 5)
      .map((t: unknown) => sanitizeInput(t, 30))
      .join(', ')

    const text = await generate({
      system: buildUserContextSystem({ ...user, username: safeUsername, city: safeCity, personality_type: safePersonality }),
      prompt: `Rewrite this quest description to feel personally relevant to ${safeUsername} in ${safeCity}.
Make it specific: mention that they can actually do this where they live.
For a ${safePersonality}, calibrate the social exposure appropriately.
Keep it under 60 words. Plain text only — no markdown, no bold, no bullet points, no preamble.

[QUEST DATA]
Title: ${safeTitle}
Original description: ${safeDesc}
Category: ${safeCategory}
Tags: ${safeTags}
[END QUEST DATA]`,
      maxTokens: 200,
      temperature: 0.8,
    })

    return NextResponse.json({ description: text || quest.description })
  } catch (err) {
    console.error('[AI Personalize]', err)
    return NextResponse.json({ error: 'Failed to personalize quest' }, { status: 500 })
  }
}
