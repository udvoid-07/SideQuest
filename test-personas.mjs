/**
 * SideQuest — 15-Persona Response Time & Pass/Fail Test
 * Run: node test-personas.mjs
 * Requires dev server on http://localhost:3001
 */

const BASE = 'http://localhost:3001'

// ── Shared mock quest catalog (used across advisor / week-plan / personalize) ──
const MOCK_QUESTS = [
  { id: 'q-001', title: 'Visit a local museum', description: 'Explore history and culture at a museum near you.', category: 'growth', tier: 'bronze', xp_reward: 50, duration_minutes: 90, cost_min: 0, cost_max: 100, tags: ['museum', 'culture', 'learning'] },
  { id: 'q-002', title: 'Walk barefoot in the park', description: 'Ground yourself with a mindful barefoot walk.', category: 'peace', tier: 'bronze', xp_reward: 30, duration_minutes: 30, cost_min: 0, cost_max: 0, tags: ['park', 'mindfulness', 'free'] },
  { id: 'q-003', title: 'Join a morning yoga class', description: 'Start your day with a community yoga session.', category: 'healthy', tier: 'silver', xp_reward: 80, duration_minutes: 60, cost_min: 100, cost_max: 300, tags: ['yoga', 'fitness', 'wellness'] },
  { id: 'q-004', title: 'Sketch a street scene', description: 'Find a busy street and sketch what you see.', category: 'creative', tier: 'bronze', xp_reward: 60, duration_minutes: 45, cost_min: 0, cost_max: 50, tags: ['art', 'drawing', 'creative'] },
  { id: 'q-005', title: 'Volunteer at an animal shelter', description: 'Spend a morning helping animals at a local shelter.', category: 'social', tier: 'silver', xp_reward: 120, duration_minutes: 120, cost_min: 0, cost_max: 0, tags: ['volunteer', 'animals', 'community'] },
  { id: 'q-006', title: 'Read at a café for 2 hours', description: 'Pick a book you\'ve been meaning to read and head to a café.', category: 'peace', tier: 'bronze', xp_reward: 40, duration_minutes: 120, cost_min: 100, cost_max: 200, tags: ['reading', 'cafe', 'solitude'] },
  { id: 'q-007', title: 'Cook a meal from a new cuisine', description: 'Pick a cuisine you\'ve never cooked and make it from scratch.', category: 'creative', tier: 'silver', xp_reward: 90, duration_minutes: 90, cost_min: 200, cost_max: 500, tags: ['cooking', 'food', 'creativity'] },
  { id: 'q-008', title: 'Attend a free community event', description: 'Find and attend a free event in your city — market, fair, or talk.', category: 'social', tier: 'bronze', xp_reward: 50, duration_minutes: 60, cost_min: 0, cost_max: 0, tags: ['community', 'free', 'social'] },
  { id: 'q-009', title: 'Visit a bookshop and buy one book', description: 'Browse a bookshop and pick one book that calls to you.', category: 'growth', tier: 'bronze', xp_reward: 45, duration_minutes: 45, cost_min: 150, cost_max: 400, tags: ['books', 'learning', 'bookstore'] },
  { id: 'q-010', title: '5k sunrise run', description: 'Set your alarm early and run 5k before the city wakes up.', category: 'healthy', tier: 'gold', xp_reward: 150, duration_minutes: 40, cost_min: 0, cost_max: 0, tags: ['running', 'fitness', 'morning'] },
]

// ── 15 Personas ────────────────────────────────────────────────────────────────
const PERSONAS = [
  // NO MONEY
  {
    id: 1,
    label: 'College Student — No Money',
    budget: '₹0',
    city: 'Mumbai',
    questQuery: 'library',
    user: { id: 'u1', username: 'Rahul', city: 'Mumbai', age: 19, personality_type: 'introvert', level: 1, streak_count: 0, total_quests_completed: 0, budget_preference: 'free', interests: ['learning', 'books'] },
    questForPersonalize: MOCK_QUESTS[0],
  },
  {
    id: 2,
    label: 'Homemaker — No Income',
    budget: '₹0',
    city: 'Delhi',
    questQuery: 'park',
    user: { id: 'u2', username: 'Priya', city: 'Delhi', age: 33, personality_type: 'homebody', level: 2, streak_count: 3, total_quests_completed: 5, budget_preference: 'free', interests: ['nature', 'mindfulness'] },
    questForPersonalize: MOCK_QUESTS[1],
  },
  {
    id: 3,
    label: 'Underpaid Intern — Broke',
    budget: '₹0',
    city: 'Pune',
    questQuery: 'volunteer',
    user: { id: 'u3', username: 'Vikram', city: 'Pune', age: 22, personality_type: 'ambitious', level: 1, streak_count: 1, total_quests_completed: 2, budget_preference: 'free', interests: ['growth', 'community'] },
    questForPersonalize: MOCK_QUESTS[4],
  },
  // LIMITED MONEY (₹50–₹200)
  {
    id: 4,
    label: 'Teenager — Pocket Money',
    budget: '₹50',
    city: 'Hyderabad',
    questQuery: 'sports',
    user: { id: 'u4', username: 'Arjun', city: 'Hyderabad', age: 16, personality_type: 'adventurer', level: 3, streak_count: 7, total_quests_completed: 12, budget_preference: 'budget', interests: ['sports', 'fitness'] },
    questForPersonalize: MOCK_QUESTS[9],
  },
  {
    id: 5,
    label: 'Artist — Irregular Income',
    budget: '₹150',
    city: 'Kolkata',
    questQuery: 'art gallery',
    user: { id: 'u5', username: 'Meera', city: 'Kolkata', age: 24, personality_type: 'creative', level: 4, streak_count: 14, total_quests_completed: 18, budget_preference: 'budget', interests: ['art', 'culture', 'creativity'] },
    questForPersonalize: MOCK_QUESTS[3],
  },
  {
    id: 6,
    label: 'Senior Citizen — Pension',
    budget: '₹100',
    city: 'Chennai',
    questQuery: 'temple',
    user: { id: 'u6', username: 'Lakshmi', city: 'Chennai', age: 67, personality_type: 'calm', level: 5, streak_count: 21, total_quests_completed: 40, budget_preference: 'budget', interests: ['spirituality', 'peace'] },
    questForPersonalize: MOCK_QUESTS[1],
  },
  // MODERATE MONEY (₹250–₹600)
  {
    id: 7,
    label: 'Teacher — Modest Budget',
    budget: '₹250',
    city: 'Ahmedabad',
    questQuery: 'library',
    user: { id: 'u7', username: 'Fatima', city: 'Ahmedabad', age: 45, personality_type: 'curious', level: 6, streak_count: 30, total_quests_completed: 55, budget_preference: 'moderate', interests: ['learning', 'community', 'culture'] },
    questForPersonalize: MOCK_QUESTS[8],
  },
  {
    id: 8,
    label: 'New Parent — Family Budget',
    budget: '₹300',
    city: 'Noida',
    questQuery: 'park',
    user: { id: 'u8', username: 'Pooja', city: 'Noida', age: 36, personality_type: 'family', level: 3, streak_count: 5, total_quests_completed: 8, budget_preference: 'moderate', interests: ['family', 'nature', 'health'] },
    questForPersonalize: MOCK_QUESTS[1],
  },
  {
    id: 9,
    label: 'Fitness Enthusiast — Active Budget',
    budget: '₹400',
    city: 'Bangalore',
    questQuery: 'gym',
    user: { id: 'u9', username: 'Aditya', city: 'Bangalore', age: 26, personality_type: 'active', level: 8, streak_count: 45, total_quests_completed: 72, budget_preference: 'moderate', interests: ['fitness', 'running', 'health'] },
    questForPersonalize: MOCK_QUESTS[9],
  },
  {
    id: 10,
    label: 'Retiree — Comfortable',
    budget: '₹500',
    city: 'Goa',
    questQuery: 'beach',
    user: { id: 'u10', username: 'Suresh', city: 'Goa', age: 62, personality_type: 'explorer', level: 7, streak_count: 60, total_quests_completed: 90, budget_preference: 'moderate', interests: ['travel', 'peace', 'nature'] },
    questForPersonalize: MOCK_QUESTS[7],
  },
  {
    id: 11,
    label: 'Sales Executive — Social Spender',
    budget: '₹600',
    city: 'Jaipur',
    questQuery: 'restaurant',
    user: { id: 'u11', username: 'Neha', city: 'Jaipur', age: 30, personality_type: 'extrovert', level: 5, streak_count: 10, total_quests_completed: 22, budget_preference: 'moderate', interests: ['social', 'food', 'networking'] },
    questForPersonalize: MOCK_QUESTS[6],
  },
  // HIGHER BUDGET (₹800+)
  {
    id: 12,
    label: 'Software Engineer — Good Budget',
    budget: '₹1000',
    city: 'Bangalore',
    questQuery: 'cafe',
    user: { id: 'u12', username: 'Dev', city: 'Bangalore', age: 27, personality_type: 'introvert', level: 9, streak_count: 50, total_quests_completed: 85, budget_preference: 'premium', interests: ['tech', 'books', 'coffee'] },
    questForPersonalize: MOCK_QUESTS[5],
  },
  {
    id: 13,
    label: 'Entrepreneur — Flexible Budget',
    budget: '₹800',
    city: 'Bangalore',
    questQuery: 'sports',
    user: { id: 'u13', username: 'Kiran', city: 'Bangalore', age: 32, personality_type: 'go-getter', level: 10, streak_count: 35, total_quests_completed: 65, budget_preference: 'premium', interests: ['business', 'fitness', 'growth'] },
    questForPersonalize: MOCK_QUESTS[9],
  },
  {
    id: 14,
    label: 'Doctor — High Budget, Low Time',
    budget: '₹2000',
    city: 'Mumbai',
    questQuery: 'spa',
    user: { id: 'u14', username: 'Ananya', city: 'Mumbai', age: 40, personality_type: 'busy', level: 7, streak_count: 15, total_quests_completed: 30, budget_preference: 'premium', interests: ['wellness', 'relaxation', 'health'] },
    questForPersonalize: MOCK_QUESTS[2],
  },
  {
    id: 15,
    label: 'Digital Nomad — Variable, Currently Broke',
    budget: '₹0 (traveling)',
    city: 'Kochi',
    questQuery: 'beach',
    user: { id: 'u15', username: 'Ravi', city: 'Kochi', age: 29, personality_type: 'adventurer', level: 11, streak_count: 88, total_quests_completed: 140, budget_preference: 'free', interests: ['travel', 'adventure', 'freedom'] },
    questForPersonalize: MOCK_QUESTS[7],
  },
]

// ── Test utilities ─────────────────────────────────────────────────────────────

async function timed(label, fn) {
  const start = Date.now()
  try {
    const result = await fn()
    const ms = Date.now() - start
    return { label, ms, passed: result.passed, detail: result.detail, error: null }
  } catch (err) {
    const ms = Date.now() - start
    return { label, ms, passed: false, detail: null, error: err.message }
  }
}

async function testPlaces(persona) {
  const url = `${BASE}/api/places?query=${encodeURIComponent(persona.questQuery)}&city=${encodeURIComponent(persona.city)}`
  const res = await fetch(url)
  const data = await res.json()
  const passed = res.ok && Array.isArray(data.places)
  const detail = data.fallback
    ? `fallback=true (OSM zero results → Google Maps link shown)`
    : `${data.places?.length ?? 0} places returned`
  return { passed, detail }
}

async function testPersonalize(persona) {
  const res = await fetch(`${BASE}/api/ai/personalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quest: persona.questForPersonalize, user: persona.user }),
  })
  const data = await res.json()
  const passed = res.ok && typeof data.description === 'string' && data.description.length > 10
  const detail = passed ? `"${data.description.slice(0, 60)}…"` : (data.error ?? 'no description')
  return { passed, detail }
}

async function testAdvisor(persona) {
  const res = await fetch(`${BASE}/api/ai/advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: persona.user, quests: MOCK_QUESTS }),
  })
  const data = await res.json()
  const passed = res.ok && typeof data.quest_id === 'string' && MOCK_QUESTS.some(q => q.id === data.quest_id)
  const detail = passed
    ? `→ quest ${data.quest_id}: "${data.reasoning?.slice(0, 55)}…"`
    : (data.error ?? JSON.stringify(data))
  return { passed, detail }
}

// ── Runner ─────────────────────────────────────────────────────────────────────

function pad(str, len) { return String(str).padEnd(len) }
function rpad(str, len) { return String(str).padStart(len) }

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║          SIDEQUEST — 15 PERSONA RESPONSE TIME & PASS/FAIL TEST             ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n')
  console.log('Testing against:', BASE)
  console.log('APIs under test: /api/places  |  /api/ai/personalize  |  /api/ai/advisor\n')

  const allResults = []

  for (const persona of PERSONAS) {
    console.log(`\n[${persona.id}/15] ${persona.label}  (budget: ${persona.budget}, city: ${persona.city})`)
    console.log('─'.repeat(78))

    const [places, personalize, advisor] = await Promise.all([
      timed('Places   ', () => testPlaces(persona)),
      timed('Personalize', () => testPersonalize(persona)),
      timed('Advisor  ', () => testAdvisor(persona)),
    ])

    for (const r of [places, personalize, advisor]) {
      const icon = r.passed ? '✓' : '✗'
      const ms   = rpad(`${r.ms}ms`, 7)
      const det  = r.error ? `ERROR: ${r.error}` : (r.detail ?? '')
      console.log(`  ${icon} ${pad(r.label, 12)} ${ms}  ${det}`)
      allResults.push({ persona: persona.id, label: persona.label, test: r.label.trim(), ms: r.ms, passed: r.passed })
    }
  }

  // ── Summary table ────────────────────────────────────────────────────────────
  console.log('\n\n' + '═'.repeat(78))
  console.log('SUMMARY')
  console.log('═'.repeat(78))

  const totalTests = allResults.length
  const passedTests = allResults.filter(r => r.passed).length
  const failedTests = totalTests - passedTests

  const avgMs = Math.round(allResults.reduce((s, r) => s + r.ms, 0) / totalTests)
  const maxMs = Math.max(...allResults.map(r => r.ms))
  const minMs = Math.min(...allResults.map(r => r.ms))

  // Per-API stats
  for (const api of ['Places', 'Personalize', 'Advisor']) {
    const subset = allResults.filter(r => r.test.toLowerCase().startsWith(api.toLowerCase()))
    const apiPass = subset.filter(r => r.passed).length
    const apiAvg = Math.round(subset.reduce((s, r) => s + r.ms, 0) / subset.length)
    const apiMax = Math.max(...subset.map(r => r.ms))
    console.log(`  ${pad(api, 14)} pass: ${apiPass}/${subset.length}   avg: ${rpad(apiAvg + 'ms', 7)}  max: ${apiMax}ms  ${apiPass === subset.length ? '✓ all pass' : '✗ FAILURES'}`)
  }

  console.log('\n  Overall: ' + passedTests + '/' + totalTests + ' tests passed')
  console.log('  Response times: avg=' + avgMs + 'ms  min=' + minMs + 'ms  max=' + maxMs + 'ms')
  console.log('  <3000ms target: ' + (allResults.filter(r => r.ms < 3000).length) + '/' + totalTests + ' tests met it')
  console.log('\n  Failures:')
  const failures = allResults.filter(r => !r.passed)
  if (failures.length === 0) {
    console.log('  (none)')
  } else {
    for (const f of failures) {
      console.log(`    ✗ Persona ${f.persona} — ${f.test}`)
    }
  }
  console.log('═'.repeat(78) + '\n')
}

run().catch(err => {
  console.error('Test harness crashed:', err.message)
  process.exit(1)
})
