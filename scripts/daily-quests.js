/**
 * Daily Quest Seeder — run once per day (or ask Claude to run it)
 * Adds 3–5 fresh quests to keep the pool growing.
 * Usage: node scripts/daily-quests.js
 */
const s = require('./_client')

// Pool of quests — script picks a random batch each day
const QUEST_POOL = [
  {
    title: 'Sunrise Watch — Be Outside Before 6 AM',
    description: 'Set an alarm. Be somewhere outdoors before 6 AM. Watch the sky change. No music, no scrolling.',
    category: 'wellness', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 45, xp_reward: 25, tier: 'F',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['free','morning','sunrise','wellness','solo','pillar-peace'],
    info: { why_its_worth_it: 'A sunrise earned through an early alarm is one of life\'s genuinely free luxuries.', estimated_time_range: '30–60 min', pro_tip: 'Check sunrise time the night before. Don\'t snooze.' }
  },
  {
    title: 'Write a Letter to Your Future Self',
    description: 'Write a handwritten or typed letter to yourself — to be opened in exactly 1 year. Seal it. Set a phone reminder for that date.',
    category: 'mental', cost_min: 0, cost_max: 50, budget_tier: 1,
    duration_minutes: 40, xp_reward: 25, tier: 'F',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['free','writing','reflection','mental','solo'],
    info: { why_its_worth_it: 'Writing to future-you creates accountability and a time capsule of who you are right now.', estimated_time_range: '30–45 min', pro_tip: 'Be specific. Write about fears, hopes, what you\'re working on. Be honest.' }
  },
  {
    title: 'Revisit a Childhood Food or Recipe',
    description: 'Cook or find that one dish from your childhood — the one that brings back a specific memory. Eat it slowly.',
    category: 'culinary', cost_min: 0, cost_max: 400, budget_tier: 2,
    duration_minutes: 60, xp_reward: 60, tier: 'D',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: false,
    tags: ['cooking','nostalgia','memory','culinary','home'],
    info: { why_its_worth_it: 'Food is the strongest memory trigger we have. This isn\'t just cooking — it\'s time travel.', estimated_time_range: '45–90 min', pro_tip: 'Call a parent or grandparent for the recipe if you don\'t know it. That call is part of the quest.' }
  },
  {
    title: 'Spend an Hour in a Bookshop With No Purchase Goal',
    description: 'Walk into any bookshop. Browse with no agenda. Pick up books at random. Read the first page of each one. Leave only when you\'re ready.',
    category: 'learning', cost_min: 0, cost_max: 800, budget_tier: 2,
    duration_minutes: 75, xp_reward: 60, tier: 'D',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: true,
    tags: ['books','reading','learning','browsing','solo'],
    info: { why_its_worth_it: 'The book that changes your life is usually one you had no intention of buying.', estimated_time_range: '1–2 hrs', nearest_search_term: 'bookshops near me' }
  },
  {
    title: 'Learn One Magic Trick and Perform It for Someone',
    description: 'Learn a simple card trick or coin trick from YouTube. Practice until smooth. Perform it for at least one real person.',
    category: 'social', cost_min: 0, cost_max: 200, budget_tier: 1,
    duration_minutes: 90, xp_reward: 120, tier: 'C',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: false,
    tags: ['magic','social','performance','fun','learn'],
    info: { why_its_worth_it: 'Magic forces you to watch someone\'s face light up because of something you did. That\'s addictive.', estimated_time_range: '1–2 hrs', pro_tip: 'Practice 20 times before you show anyone. Smoothness is the trick, not the secret.' }
  },
  {
    title: 'Plant Something and Commit to Keeping It Alive',
    description: 'Buy or propagate one plant. Re-pot it. Place it somewhere you see daily. Set a weekly watering reminder.',
    category: 'wellness', cost_min: 100, cost_max: 500, budget_tier: 2,
    duration_minutes: 60, xp_reward: 60, tier: 'D',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['plants','gardening','wellness','home','responsibility'],
    info: { why_its_worth_it: 'Caring for a living thing daily is one of the gentlest forms of discipline.', estimated_time_range: '45–90 min', pro_tip: 'Start with a money plant or succulent. They forgive beginners.' }
  },
  {
    title: 'Attend a Free Cultural Event in Your City',
    description: 'Find a free event this week — a gallery opening, a street performance, a temple festival, a cultural show. Go alone or with one person.',
    category: 'adventure', cost_min: 0, cost_max: 200, budget_tier: 1,
    duration_minutes: 120, xp_reward: 120, tier: 'C',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: true,
    tags: ['free','culture','city','event','adventure','social'],
    info: { why_its_worth_it: 'Every city has more free culture happening each week than most residents ever discover.', estimated_time_range: '2–3 hrs', nearest_search_term: 'free events this week near me', safety_notes: ['Check event legitimacy before attending'] }
  },
  {
    title: 'Cycle or Walk Your Daily Commute Instead of Using Transport',
    description: 'For one day, ditch the auto/bus/car/metro for your usual route. Walk or cycle the whole way.',
    category: 'physical', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 90, xp_reward: 60, tier: 'D',
    min_age: 14, max_age: 70, fitness_required: 2, personality_match: 'all', location_required: false,
    tags: ['free','commute','walking','cycling','physical','healthy'],
    info: { why_its_worth_it: 'Your commute route becomes a completely different experience at foot-pace. You\'ll notice things you\'ve passed a hundred times.', estimated_time_range: 'Varies (your commute distance)', safety_notes: ['Carry water', 'Wear reflective clothing if cycling at dawn/dusk'] }
  },
  {
    title: 'Have a Meal in Complete Silence — No Distractions',
    description: 'Pick any meal today. No phone, no music, no TV, no conversation. Just the food, the flavours, and your thoughts.',
    category: 'mental', cost_min: 0, cost_max: 500, budget_tier: 2,
    duration_minutes: 30, xp_reward: 25, tier: 'F',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['free','mindfulness','eating','silent','mental'],
    info: { why_its_worth_it: 'We eat while doing 5 other things. Eating a meal fully present is a radically unfamiliar experience for most people.', estimated_time_range: '20–40 min', pro_tip: 'Start with breakfast — it\'s the least emotionally loaded meal.' }
  },
  {
    title: 'Sign Up for a Class You\'ve Always Been Curious About',
    description: 'Not a trial — actually enroll in a multi-session class. Pottery, martial arts, dance, photography, cooking. Commit to at least 4 sessions.',
    category: 'creative', cost_min: 1000, cost_max: 5000, budget_tier: 3,
    duration_minutes: 1440, xp_reward: 250, tier: 'B',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: true,
    tags: ['class','skill','commitment','creative','learn'],
    info: { why_its_worth_it: 'A trial tells you if you like it. A full course tells you who you become when you stick with something.', estimated_time_range: '4+ weeks', nearest_search_term: 'classes near me' }
  },
]

async function run() {
  // Pick 3 random quests from the pool that haven't been added recently
  const { data: existing } = await s
    .from('quests')
    .select('title')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

  const existingTitles = new Set((existing ?? []).map((q) => q.title))
  const fresh = QUEST_POOL.filter(q => !existingTitles.has(q.title))

  if (fresh.length === 0) {
    console.log('All pool quests already added recently. Nothing to add today.')
    return
  }

  // Shuffle and pick up to 3
  const picks = fresh.sort(() => Math.random() - 0.5).slice(0, 3)

  const { data, error } = await s.from('quests').insert(picks).select('id, title, tier, category')
  if (error) { console.error('Error:', error.message); return }

  console.log(`✓ Added ${data.length} new quests for today:`)
  data.forEach(q => console.log(`  ${q.tier} · ${q.category} — ${q.title}`))
}

run()
