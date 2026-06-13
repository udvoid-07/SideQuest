// ── Gemini AI abstraction (replaces Anthropic SDK) ───────
// All calls are server-side only — GOOGLE_API_KEY is never
// prefixed NEXT_PUBLIC_ and never appears in client bundles.

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
export const MODEL = 'gemini-2.5-flash'

function apiKey(): string {
  const key = process.env.GOOGLE_API_KEY
  if (!key) throw new Error('GOOGLE_API_KEY not configured')
  return key
}

// ── Types ─────────────────────────────────────────────────

export interface GeminiPart {
  text?: string
  functionCall?: { name: string; args: Record<string, unknown> }
  functionResponse?: { name: string; response: { result: string } }
}

export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export interface FunctionDeclaration {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

// ── Core: simple text generation ─────────────────────────

export async function generate(options: {
  system: string
  prompt: string
  maxTokens?: number
  temperature?: number
  timeoutMs?: number
}): Promise<string> {
  const key = apiKey()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000)

  let res: Response
  try {
    res = await fetch(`${BASE}/${MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: options.system }] },
        contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens ?? 512,
          temperature:     options.temperature ?? 0.7,
          // Disable thinking for simple generation — thinking tokens count against maxOutputTokens
          // on gemini-2.5-flash and would crowd out the actual response text
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }

  const data = await res.json()
  // Filter out thought parts (thought: true) and join remaining text parts
  const parts: Array<{ text?: string; thought?: boolean }> =
    data.candidates?.[0]?.content?.parts ?? []
  return parts.filter(p => !p.thought && p.text).map(p => p.text).join('') || ''
}

// ── Core: multi-turn with function calling ────────────────

export interface GenerateWithToolsResult {
  parts: GeminiPart[]
  finishReason: string
}

export async function generateWithTools(options: {
  system: string
  contents: GeminiContent[]
  tools: FunctionDeclaration[]
  maxTokens?: number
  timeoutMs?: number
}): Promise<GenerateWithToolsResult> {
  const key = apiKey()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 20000)

  let res: Response
  try {
    res = await fetch(`${BASE}/${MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: options.system }] },
        contents: options.contents,
        tools: [{ function_declarations: options.tools }],
        tool_config: { function_calling_config: { mode: 'AUTO' } },
        // 2048 to absorb thinking token overhead from gemini-2.5-flash
        generationConfig: { maxOutputTokens: options.maxTokens ?? 2048 },
      }),
    })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const candidate = data.candidates?.[0]
  // Exclude thought parts — only return actual content/function-call parts
  const parts: GeminiPart[] = (candidate?.content?.parts ?? [])
    .filter((p: GeminiPart & { thought?: boolean }) => !p.thought)
  return {
    parts,
    finishReason: candidate?.finishReason ?? 'STOP',
  }
}

// ── Shared system prompt ──────────────────────────────────

export function buildUserContextSystem(user: {
  username: string
  age: number
  city: string
  personality_type: string
  fitness_level: number
  budget_tier: number
  streak_count: number
  total_quests_completed: number
}): string {
  const budgetLabel  = ['Free only', 'Under ₹500', '₹500–₹2000', 'No limit'][user.budget_tier - 1]
  const fitnessLabel = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Active', 'Athletic'][user.fitness_level - 1]

  return `You are the SideQuest AI — a personal adventure advisor that helps people experience life beyond their routine. You make real-world experiences feel achievable, exciting, and personally relevant.

You are helping ${user.username}, a ${user.age}-year-old ${user.personality_type} based in ${user.city}. Their fitness level is ${fitnessLabel} and budget comfort is ${budgetLabel}. They have completed ${user.total_quests_completed} quests and are on a ${user.streak_count}-day streak.

Core principle: push people just outside their comfort zone — not into anxiety, but into growth. For introverts, gentle steps. For extroverts, bolder challenges. Always grounded, never preachy.

Response style: warm, direct, specific. No filler phrases. Treat the user as an intelligent adult who wants real help, not encouragement.`
}

// ── Dev logging ───────────────────────────────────────────

export function logUsage(label: string, inputChars: number, outputChars: number) {
  if (process.env.NODE_ENV !== 'development') return
  console.log(`[Gemini:${label}] ~${inputChars} input chars | ~${outputChars} output chars`)
}
