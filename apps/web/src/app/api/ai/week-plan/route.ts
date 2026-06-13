import { NextResponse } from 'next/server'
import { generateWithTools, buildUserContextSystem } from '@/lib/gemini'
import type { GeminiContent, FunctionDeclaration } from '@/lib/gemini'
import { getAuthUser } from '@/lib/supabase-server'
import { sanitizeInput, isValidUUID } from '@/lib/security'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'get_quest_details',
    description: 'Get full details for a quest by its ID',
    parameters: {
      type: 'object',
      properties: { quest_id: { type: 'string', description: 'Quest UUID' } },
      required: ['quest_id'],
    },
  },
  {
    name: 'assign_quest_to_day',
    description: 'Assign a quest to a specific day of the week',
    parameters: {
      type: 'object',
      properties: {
        day:      { type: 'string', enum: DAYS },
        quest_id: { type: 'string', description: 'Quest UUID' },
        reason:   { type: 'string', description: 'Why this quest on this day (1 sentence)' },
      },
      required: ['day', 'quest_id', 'reason'],
    },
  },
  {
    name: 'explain_week_plan',
    description: 'Submit the completed week plan with a summary',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: '2-3 sentence overview of the week' },
      },
      required: ['summary'],
    },
  },
]

export async function POST(req: Request) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { user, quests } = await req.json()
    if (!user || !quests) {
      return NextResponse.json({ error: 'user and quests required' }, { status: 400 })
    }

    if (!Array.isArray(quests) || quests.length === 0) {
      return NextResponse.json({ error: 'quests must be a non-empty array' }, { status: 400 })
    }

    const questMap: Record<string, any> = {}
    for (const q of quests) {
      if (isValidUUID(q.id)) questMap[q.id] = q
    }

    const weekPlan: Record<string, { quest: any; reason: string }> = {}
    let weekSummary = ''

    // Sanitize quest fields before embedding in prompt
    const questCatalog = quests.slice(0, 30).map((q: any) => {
      const safeTitle    = sanitizeInput(q.title, 80)
      const safeCategory = sanitizeInput(q.category, 40)
      const safeTier     = sanitizeInput(q.tier, 20)
      const safeXp       = Number.isInteger(q.xp_reward) ? q.xp_reward : 0
      const safeDuration = Number.isInteger(q.duration_minutes) ? q.duration_minutes : 0
      return `[${isValidUUID(q.id) ? q.id : 'invalid'}] ${safeTitle} | ${safeCategory} | Tier ${safeTier} | ${safeXp} XP | ${safeDuration}min`
    }).join('\n')

    const contents: GeminiContent[] = [
      {
        role: 'user',
        parts: [{
          text: `Available quests:\n${questCatalog}

Plan a 7-day SideQuest week for ${user.username}.

Rules:
1. Use assign_quest_to_day for each of the 7 days (Monday–Sunday)
2. Ensure diversity: cover at least 4 different categories
3. Respect the 5 pillars: healthy, creative, growth, peace, social connection
4. Order by difficulty: easier on weekdays, bigger challenges on weekend
5. No category should repeat on consecutive days
6. Use get_quest_details if you need more info about a specific quest
7. End with explain_week_plan

Start planning now.`,
        }],
      },
    ]

    let iterations = 0
    const MAX_ITER = 15

    while (iterations < MAX_ITER) {
      const response = await generateWithTools({
        system:   buildUserContextSystem(user),
        contents,
        tools:    TOOLS,
        maxTokens: 1024,
      })

      iterations++
      contents.push({ role: 'model', parts: response.parts })

      const calls = response.parts.filter(p => p.functionCall)
      if (calls.length === 0) break

      let finished = false
      const results = calls.map(part => {
        const { name, args } = part.functionCall!
        let result = ''

        if (name === 'get_quest_details') {
          const q = questMap[args.quest_id as string]
          result = q
            ? JSON.stringify({ title: q.title, description: q.description, category: q.category, tier: q.tier, xp_reward: q.xp_reward, duration_minutes: q.duration_minutes, tags: q.tags })
            : 'Quest not found'
        }

        if (name === 'assign_quest_to_day') {
          const day   = args.day as string
          const quest = questMap[args.quest_id as string]
          if (quest && DAYS.includes(day)) {
            weekPlan[day] = { quest, reason: args.reason as string }
            result = `Assigned "${quest.title}" to ${day}`
          } else {
            result = 'Invalid day or quest ID'
          }
        }

        if (name === 'explain_week_plan') {
          weekSummary = args.summary as string
          result      = 'Week plan complete.'
          finished    = true
        }

        return { functionResponse: { name, response: { result } } }
      })

      contents.push({ role: 'user', parts: results })
      if (finished) break
    }

    const plan = DAYS.map(day => ({
      day,
      quest:  weekPlan[day]?.quest  ?? null,
      reason: weekPlan[day]?.reason ?? null,
    }))

    return NextResponse.json({ plan, summary: weekSummary, daysPlanned: Object.keys(weekPlan).length })
  } catch (err) {
    console.error('[AI Week Plan]', err)
    return NextResponse.json({ error: 'Week planner unavailable' }, { status: 500 })
  }
}
