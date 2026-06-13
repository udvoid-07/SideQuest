import { NextResponse } from 'next/server'
import { generateWithTools, buildUserContextSystem } from '@/lib/gemini'
import type { GeminiContent, FunctionDeclaration } from '@/lib/gemini'
import { getAuthUser } from '@/lib/supabase-server'
import { sanitizeInput } from '@/lib/security'

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'assign_next_quest',
    description: "Assign a quest from the available pool to the user's queue for tomorrow",
    parameters: {
      type: 'object',
      properties: {
        quest_id:  { type: 'string', description: 'Quest UUID to assign' },
        rationale: { type: 'string', description: 'Why this quest is a good follow-on (1 sentence)' },
      },
      required: ['quest_id', 'rationale'],
    },
  },
  {
    name: 'send_notification',
    description: 'Send a push notification to the user',
    parameters: {
      type: 'object',
      properties: {
        title:   { type: 'string', description: 'Notification title (max 50 chars)' },
        message: { type: 'string', description: 'Notification body (max 100 chars)' },
        type:    { type: 'string', enum: ['streak', 'level_up', 'quest_complete', 'nudge'] },
      },
      required: ['title', 'message', 'type'],
    },
  },
  {
    name: 'log_workflow_complete',
    description: 'Signal that the post-completion workflow is done',
    parameters: {
      type: 'object',
      properties: {
        actions_taken: { type: 'array', items: { type: 'string' }, description: 'Actions taken' },
      },
      required: ['actions_taken'],
    },
  },
]

function processOrchestratorTool(
  name: string,
  args: Record<string, unknown>,
  ctx: {
    actionsTaken: string[]
    notifications: Array<{ title: string; message: string; type: string }>
    nextQuestAssigned: (v: { quest_id: string; rationale: string }) => void
    onDone: () => void
  },
): string {
  if (name === 'assign_next_quest') {
    const v = args as { quest_id: string; rationale: string }
    ctx.nextQuestAssigned(v)
    ctx.actionsTaken.push(`Assigned next quest: ${v.quest_id}`)
    return 'Quest queued for tomorrow'
  }
  if (name === 'send_notification') {
    const n = args as { title: string; message: string; type: string }
    ctx.notifications.push(n)
    ctx.actionsTaken.push(`Notification sent: "${n.title}"`)
    return 'Notification queued'
  }
  if (name === 'log_workflow_complete') {
    ctx.onDone()
    return 'Workflow complete'
  }
  return 'ok'
}

export async function POST(req: Request) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { user, completedQuest, xpEarned, leveledUp, newBadges = [], nextQuests = [] } = await req.json()
    if (!user || !completedQuest) {
      return NextResponse.json({ error: 'user and completedQuest required' }, { status: 400 })
    }

    // Sanitize all user-controlled strings before they enter the AI prompt
    const safeNextQuestCatalog = nextQuests.slice(0, 10)
      .map((q: any) => `[${typeof q.id === 'string' ? q.id.slice(0, 36) : ''}] ${sanitizeInput(q.title, 80)} | ${sanitizeInput(q.category, 40)} | ${sanitizeInput(q.tier, 20)}`)
      .join('\n')
    const nextQuestCatalog = safeNextQuestCatalog

    const actionsTaken: string[] = []
    const notifications: Array<{ title: string; message: string; type: string }> = []
    let nextQuestAssigned: { quest_id: string; rationale: string } | null = null

    const contents: GeminiContent[] = [
      {
        role: 'user',
        parts: [{
          text: `Available follow-on quests:\n${nextQuestCatalog || 'No quests available yet.'}

${sanitizeInput(user.username, 40)} just completed a quest. Decide what post-completion actions to take.

Completed: "${sanitizeInput(completedQuest.title, 100)}" (${sanitizeInput(completedQuest.category, 40)}, ${sanitizeInput(completedQuest.tier, 20)})
XP earned: ${Number.isFinite(xpEarned) ? xpEarned : 0}
Leveled up: ${leveledUp ? `YES — now level ${Number.isInteger(user.level) ? user.level : 1}` : 'no'}
New badges: ${newBadges.length > 0 ? newBadges.map((b: any) => sanitizeInput(b.name, 50)).join(', ') : 'none'}
Current streak: ${Number.isInteger(user.streak_count) ? user.streak_count : 0} days

Your job: call the right tools in the right order.
- If leveled up, send a celebration notification
- If streak milestone (7, 14, 30, 50, 100), send a streak notification
- Always assign a follow-on quest if one is available
- End with log_workflow_complete`,
        }],
      },
    ]

    let iterations = 0
    const MAX_ITER = 8
    let done = false

    while (iterations < MAX_ITER && !done) {
      const response = await generateWithTools({
        system:    buildUserContextSystem(user),
        contents,
        tools:     TOOLS,
        maxTokens: 512,
      })
      iterations++
      contents.push({ role: 'model', parts: response.parts })

      const calls = response.parts.filter(p => p.functionCall)
      if (calls.length === 0) break

      const results = calls.map(part => {
        const { name, args } = part.functionCall!
        const result = processOrchestratorTool(name, args, { actionsTaken, notifications, nextQuestAssigned: (v) => { nextQuestAssigned = v }, onDone: () => { done = true } })
        return { functionResponse: { name, response: { result } } }
      })

      contents.push({ role: 'user', parts: results })
    }

    return NextResponse.json({ actions_taken: actionsTaken, notifications, next_quest: nextQuestAssigned })
  } catch (err) {
    console.error('[AI Orchestrate]', err)
    return NextResponse.json({ error: 'Orchestrator unavailable' }, { status: 500 })
  }
}
