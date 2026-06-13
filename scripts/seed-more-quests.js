const s = require('./_client')

const quests = [
  // ── F · MICRO (missing: creative, culinary, adventure) ────────────────
  {
    title: 'Doodle for 15 Minutes Without Judgment',
    description: 'Grab any paper and pen. Draw anything — objects, faces, patterns. No skill required, no erasing. Just let the pen move.',
    category: 'creative', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 20, xp_reward: 25, tier: 'F',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['free','quick','creative','solo','drawing'],
    info: { why_its_worth_it: 'Doodling quiets the inner critic. The first bad drawing is the most important one you\'ll ever make.', estimated_time_range: '15–20 min', pro_tip: 'Set a timer. When it ends, stop. Don\'t judge the output.' }
  },
  {
    title: 'Make Something You\'ve Never Cooked Before — Even Simple',
    description: 'Pick one ingredient you\'ve never cooked with and make something simple with it — a scrambled egg with an unusual herb, a new spice in your chai.',
    category: 'culinary', cost_min: 0, cost_max: 100, budget_tier: 1,
    duration_minutes: 20, xp_reward: 25, tier: 'F',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: false,
    tags: ['free','quick','cooking','home','culinary'],
    info: { why_its_worth_it: 'Curiosity about one ingredient is how every great cook started.', estimated_time_range: '15–25 min', pro_tip: 'One new spice on your usual dish counts.' }
  },
  {
    title: 'Walk to a Completely Random Destination',
    description: 'Open Maps. Drop a pin 1km in any direction you\'ve never walked before. Go there on foot. Don\'t plan what you\'ll do when you arrive.',
    category: 'adventure', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 25, xp_reward: 25, tier: 'F',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: false,
    tags: ['free','walking','adventure','solo','spontaneous'],
    info: { why_its_worth_it: 'The city you think you know has entire streets you\'ve never seen.', estimated_time_range: '20–30 min', safety_notes: ['Daytime recommended', 'Keep your phone charged'] }
  },

  // ── D · EASY (missing: social, physical, learning, wellness) ──────────
  {
    title: 'Start a Conversation With Someone You See Every Day But Never Talk To',
    description: 'The security guard, the chai wala, the neighbour in the lift. Just say hi and ask one genuine question.',
    category: 'social', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 10, xp_reward: 60, tier: 'D',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['free','social','introvert-friendly','connection','pillar-connect'],
    info: { why_its_worth_it: 'The most overlooked relationships in our lives are right in front of us.', estimated_time_range: '5–15 min', pro_tip: 'Ask about their day or their hometown. People love being asked.' }
  },
  {
    title: 'Take the Stairs Everywhere Today',
    description: 'For one full day, refuse every escalator and elevator. Stairs only, all day.',
    category: 'physical', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 480, xp_reward: 60, tier: 'D',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: false,
    tags: ['free','physical','daily-challenge','healthy','pillar-healthy'],
    info: { why_its_worth_it: 'It\'s absurd how much effort we spend avoiding 30 seconds of walking. Reclaim it.', estimated_time_range: 'All day', pro_tip: 'Count how many flights you climb. You\'ll be surprised.' }
  },
  {
    title: 'Watch a TED Talk and Write 3 Actionable Takeaways',
    description: 'Pick any TED talk under 20 minutes on a topic you know nothing about. Watch it. Write three specific things you could do differently.',
    category: 'learning', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 35, xp_reward: 60, tier: 'D',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['free','learning','quick','growth','pillar-growth'],
    info: { why_its_worth_it: 'One 15-minute talk can rewire how you think about an entire domain.', estimated_time_range: '30–45 min', pro_tip: 'Write the takeaways immediately after. Don\'t wait.' }
  },
  {
    title: 'Take a 20-Minute Nap — Without Guilt',
    description: 'Find a quiet spot between 1–3 PM. Set a timer for 20 minutes. Close your eyes. That\'s it. No doom-scrolling first.',
    category: 'wellness', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 25, xp_reward: 60, tier: 'D',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['free','wellness','rest','home','pillar-peace'],
    info: { why_its_worth_it: 'A 20-minute nap improves alertness by 34%. Most people treat rest as laziness. It isn\'t.', estimated_time_range: '20–25 min', pro_tip: 'Lie flat if you can. Darkness helps. The key is no phone.' }
  },

  // ── C · MEDIUM (missing: mental, culinary, adventure, wellness) ────────
  {
    title: 'Write 3 Pages of Stream-of-Consciousness Journaling',
    description: 'Pen to paper (or fingers to keyboard). Write without stopping, editing, or censoring for 3 full pages. Whatever comes out.',
    category: 'mental', cost_min: 0, cost_max: 200, budget_tier: 1,
    duration_minutes: 45, xp_reward: 120, tier: 'C',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['writing','journaling','mental','solo','introspection'],
    info: { why_its_worth_it: 'Morning pages externalise the inner noise. Many people report clarity they haven\'t felt in years after their first attempt.', estimated_time_range: '40–60 min', pro_tip: 'Don\'t read it back after. Not today.' }
  },
  {
    title: 'Eat Alone at a Restaurant You\'ve Never Tried — No Phone',
    description: 'Book a table for one at any restaurant you\'ve been curious about. Order something unfamiliar. No phone on the table.',
    category: 'culinary', cost_min: 400, cost_max: 1200, budget_tier: 2,
    duration_minutes: 90, xp_reward: 120, tier: 'C',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: true,
    tags: ['dining','solo','culinary','mindful','new-experience'],
    info: { why_its_worth_it: 'Eating alone without distraction is one of the most underrated acts of self-respect.', estimated_time_range: '1–1.5 hrs', pro_tip: 'Talk to the waiter about what they recommend. That\'s the starter conversation.', nearest_search_term: 'good restaurants near me' }
  },
  {
    title: 'Try an Adventure Sport Trial — Ziplining, Paragliding or Rock Climbing',
    description: 'Book a beginner trial session at a local adventure sport facility. You do not need experience.',
    category: 'adventure', cost_min: 800, cost_max: 2500, budget_tier: 3,
    duration_minutes: 150, xp_reward: 120, tier: 'C',
    min_age: 16, max_age: 60, fitness_required: 2, personality_match: 'all', location_required: true,
    tags: ['adventure','outdoor','adrenaline','trial','sport'],
    info: { why_its_worth_it: 'The fear before the jump is the entire point. You won\'t feel the same way about fear after.', estimated_time_range: '2–3 hrs', safety_notes: ['Always use certified instructors','Check weight limits','Disclose any health conditions'], nearest_search_term: 'adventure sports near me' }
  },
  {
    title: 'Book and Attend a Massage or Spa Session',
    description: 'Find a reputable spa nearby. Book a 60-minute session — any type. Go alone. Put your phone in a locker.',
    category: 'wellness', cost_min: 800, cost_max: 3000, budget_tier: 3,
    duration_minutes: 90, xp_reward: 120, tier: 'C',
    min_age: 18, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: true,
    tags: ['wellness','self-care','relaxation','spa'],
    info: { why_its_worth_it: 'Most people never invest in physical recovery until they\'re forced to. Don\'t wait.', estimated_time_range: '1.5–2.5 hrs', safety_notes: ['Choose a reputable, well-reviewed spa'], nearest_search_term: 'massage spa near me' }
  },

  // ── B · CHALLENGING (missing: creative, physical, mental, culinary, learning, wellness) ──
  {
    title: 'Write, Record and Share a 2-Minute Original Piece',
    description: 'Write a short poem, spoken word piece, song verse, or micro-story. Record yourself performing it. Share it — even just to one person.',
    category: 'creative', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 240, xp_reward: 250, tier: 'B',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: false,
    tags: ['creative','writing','performance','sharing','vulnerable'],
    info: { why_its_worth_it: 'Sharing original work with even one person is one of the scariest and most alive-making things a human can do.', estimated_time_range: '3–5 hrs', pro_tip: 'Imperfect and shared beats perfect and hidden.' }
  },
  {
    title: 'Complete a 10km Walk or Run',
    description: 'Any route, any pace. Walk, run, or a mix. 10km in one session. Track it on your phone.',
    category: 'physical', cost_min: 0, cost_max: 200, budget_tier: 1,
    duration_minutes: 120, xp_reward: 250, tier: 'B',
    min_age: 14, max_age: 70, fitness_required: 3, personality_match: 'all', location_required: false,
    tags: ['running','walking','physical','endurance','healthy'],
    info: { why_its_worth_it: '10km is the threshold where your body stops complaining and starts surprising you.', estimated_time_range: '1.5–2.5 hrs', what_to_bring: ['Water bottle','Comfortable shoes','Earphones (optional)'], safety_notes: ['Hydrate before starting','Avoid peak heat hours'] }
  },
  {
    title: 'Complete a 500-Piece Jigsaw Puzzle in One Day',
    description: 'Buy or borrow a 500-piece puzzle. Start and finish it in a single day. No rushing, just focus.',
    category: 'mental', cost_min: 300, cost_max: 800, budget_tier: 2,
    duration_minutes: 300, xp_reward: 250, tier: 'B',
    min_age: 13, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['puzzle','focus','mental','home','concentration'],
    info: { why_its_worth_it: 'Puzzles build the exact kind of slow, sustained focus that modern life systematically destroys.', estimated_time_range: '4–6 hrs', pro_tip: 'Sort edge pieces first. Put on an ambient playlist. Don\'t time yourself.' }
  },
  {
    title: 'Host a Dinner Party for 4+ People — Cook Everything Yourself',
    description: 'Invite 4 or more people to your home. Plan, shop, and cook the entire meal yourself. No takeout backup.',
    category: 'culinary', cost_min: 800, cost_max: 3000, budget_tier: 3,
    duration_minutes: 360, xp_reward: 250, tier: 'B',
    min_age: 18, max_age: 99, fitness_required: 1, personality_match: 'extrovert', location_required: false,
    tags: ['cooking','social','hosting','culinary','challenge'],
    info: { why_its_worth_it: 'Feeding people you love from scratch is one of the most fundamentally human experiences.', estimated_time_range: '5–8 hrs (including prep)', pro_tip: 'Cook something you\'ve made before — just better. This isn\'t the day for experiments.' }
  },
  {
    title: 'Complete One Full Free Online Course This Week',
    description: 'Pick any course on Coursera, edX, YouTube, or Khan Academy. Any topic. Complete it fully — all videos, assignments, or quizzes — within 7 days.',
    category: 'learning', cost_min: 0, cost_max: 2000, budget_tier: 2,
    duration_minutes: 600, xp_reward: 250, tier: 'B',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['learning','online','skill','growth','week-challenge'],
    info: { why_its_worth_it: 'One course in one week forces focus. Most people have started 12 courses. Very few have finished one.', estimated_time_range: '8–12 hrs spread over 7 days', pro_tip: 'Block 1–2 hours each morning before the day gets loud.' }
  },
  {
    title: 'Complete a Full-Day Digital Detox — No Screens',
    description: 'One full day: no phone, no laptop, no TV, no tablet. From the moment you wake up to the moment you sleep.',
    category: 'wellness', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 960, xp_reward: 250, tier: 'B',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['digital-detox','wellness','offline','presence','reset'],
    info: { why_its_worth_it: 'You will be bored. Then restless. Then, somewhere around hour 4, a strange calm arrives that most people haven\'t felt in years.', estimated_time_range: 'Full day (12–16 hrs)', pro_tip: 'Plan analogue activities in advance: books, walks, cooking, people. Don\'t go in blind.' }
  },

  // ── A · HARD ──────────────────────────────────────────────────────────
  {
    title: 'Perform at an Open Mic — As the Performer',
    description: 'Sign up to perform — not watch — at an open mic. A poem, song, comedy set, or spoken word piece. 3 minutes minimum.',
    category: 'creative', cost_min: 0, cost_max: 500, budget_tier: 2,
    duration_minutes: 240, xp_reward: 500, tier: 'A',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'extrovert', location_required: true,
    tags: ['performance','creative','stage','courage','art'],
    info: { why_its_worth_it: 'Standing on a stage with something you made is one of the most honest things you will ever do.', estimated_time_range: '3–5 hrs (including prep)', safety_notes: ['Arrive early to register your slot'], nearest_search_term: 'open mic events this week' }
  },
  {
    title: 'Organise a Community Event or Neighbourhood Meetup',
    description: 'Plan, promote, and host a free community event — a clean-up, skill swap, movie night in a park. Minimum 8 attendees.',
    category: 'social', cost_min: 0, cost_max: 2000, budget_tier: 2,
    duration_minutes: 480, xp_reward: 500, tier: 'A',
    min_age: 18, max_age: 99, fitness_required: 2, personality_match: 'extrovert', location_required: true,
    tags: ['community','social','leadership','organise','event'],
    info: { why_its_worth_it: 'The people who make things happen in neighbourhoods are ordinary people who decided to. You can be one.', estimated_time_range: '5–8 hrs (planning + execution)', pro_tip: 'Start with a WhatsApp group and a fixed date. Momentum builds.' }
  },
  {
    title: 'Train for and Complete a 5K Race',
    description: 'Register for an actual 5K run (find one within 3 weeks). Train with at least 4 practice runs. Complete the race.',
    category: 'physical', cost_min: 300, cost_max: 1500, budget_tier: 2,
    duration_minutes: 2880, xp_reward: 500, tier: 'A',
    min_age: 14, max_age: 65, fitness_required: 2, personality_match: 'all', location_required: true,
    tags: ['running','5k','race','training','fitness','challenge'],
    info: { why_its_worth_it: 'Crossing a finish line — any finish line — changes the way you see yourself.', estimated_time_range: '3 weeks of training', safety_notes: ['Get cleared by a doctor if you have any health conditions','Start slow — finish strong'], nearest_search_term: '5K run events near me' }
  },
  {
    title: 'Read an Entire Non-Fiction Book in 72 Hours',
    description: 'Pick a non-fiction book that\'s been on your list. Read every page in 3 days. Write a 1-page summary of what changed in how you think.',
    category: 'mental', cost_min: 200, cost_max: 700, budget_tier: 2,
    duration_minutes: 720, xp_reward: 500, tier: 'A',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['reading','books','learning','mental','deep-focus'],
    info: { why_its_worth_it: 'Speed-reading a book in one stretch forces absorption instead of passive consumption.', estimated_time_range: '3 days (10–12 hrs total)', pro_tip: 'Read the first and last chapter first to get the map, then fill in the middle.' }
  },
  {
    title: 'Attend a Full-Day Professional Cooking Class',
    description: 'Book a full-day hands-on cooking class — Indian, Italian, Japanese, anything. You cook every dish from scratch under a chef.',
    category: 'culinary', cost_min: 2000, cost_max: 8000, budget_tier: 3,
    duration_minutes: 480, xp_reward: 500, tier: 'A',
    min_age: 16, max_age: 99, fitness_required: 2, personality_match: 'all', location_required: true,
    tags: ['cooking','class','chef','culinary','skill'],
    info: { why_its_worth_it: 'A professional chef will teach you one technique that will change every meal you cook for the rest of your life.', estimated_time_range: '6–8 hrs', nearest_search_term: 'cooking class near me', what_to_bring: ['Comfortable clothes','Enthusiasm, not skill'] }
  },
  {
    title: 'Trek to a Nearby Summit or Hill Station',
    description: 'Find a trekking trail within 3 hours of your city. Complete the full trail — ascent and descent — in one day.',
    category: 'adventure', cost_min: 500, cost_max: 3000, budget_tier: 2,
    duration_minutes: 480, xp_reward: 500, tier: 'A',
    min_age: 16, max_age: 60, fitness_required: 3, personality_match: 'all', location_required: true,
    tags: ['trekking','hiking','nature','adventure','outdoor'],
    info: { why_its_worth_it: 'The view from a summit earned by your own feet hits differently than any scenic point you drove to.', estimated_time_range: '6–10 hrs', what_to_bring: ['Water (2L minimum)','Snacks','Sunscreen','Comfortable trekking shoes','Power bank'], safety_notes: ['Trek with at least one other person','Inform someone of your route','Start early morning'], nearest_search_term: 'trekking trails near me' }
  },
  {
    title: 'Build and Follow a 7-Day Morning Routine — No Exceptions',
    description: 'Design your ideal morning: wake time, movement, journaling, reading — whatever feels right. Execute it every day for 7 consecutive days. No skipping.',
    category: 'wellness', cost_min: 0, cost_max: 500, budget_tier: 1,
    duration_minutes: 2880, xp_reward: 500, tier: 'A',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['routine','wellness','discipline','morning','habit'],
    info: { why_its_worth_it: 'A morning you own changes every hour that follows. 7 days is enough to feel it.', estimated_time_range: '7 days (45–90 min each morning)', pro_tip: 'Design it the night before. Keep it under 90 minutes. Start with the non-negotiable one habit.' }
  },

  // ── S · LEGENDARY ─────────────────────────────────────────────────────
  {
    title: 'Exhibit Your Art, Photography, or Writing Publicly',
    description: 'Create 10+ pieces of any creative work over 30 days. Exhibit them — a pop-up show, an online gallery, a printed zine. Make it real and public.',
    category: 'creative', cost_min: 0, cost_max: 10000, budget_tier: 3,
    duration_minutes: 43200, xp_reward: 1000, tier: 'S',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'all', location_required: false,
    tags: ['exhibition','creative','art','public','achievement','30-day'],
    info: { why_its_worth_it: 'An exhibition forces you to declare: this is my work and I stand behind it. Almost no one does this. You will be changed by it.', estimated_time_range: '30 days (creation) + 1 day (exhibit)', pro_tip: 'Even 5 people at a pop-up show counts. The number doesn\'t matter. The act of making it public does.' }
  },
  {
    title: 'Mentor Someone Consistently for 30 Days',
    description: 'Find someone who wants to learn what you know — a skill, a subject, a craft. Meet or call them at least 3 times a week for 30 days.',
    category: 'social', cost_min: 0, cost_max: 0, budget_tier: 1,
    duration_minutes: 43200, xp_reward: 1000, tier: 'S',
    min_age: 18, max_age: 99, fitness_required: 1, personality_match: 'extrovert', location_required: false,
    tags: ['mentoring','social','teaching','giving','30-day','legacy'],
    info: { why_its_worth_it: 'Teaching someone else is the deepest way to understand what you know — and to discover what you don\'t.', estimated_time_range: '30 days (3–5 hrs/week)', pro_tip: 'Don\'t wait until you feel like an expert. If you know more than them about something, you can help.' }
  },
  {
    title: 'Complete a Half Marathon (21km)',
    description: 'Train for and run/walk-run a half marathon. Either a registered event or a solo route. 21.1km, tracked, documented.',
    category: 'physical', cost_min: 500, cost_max: 5000, budget_tier: 2,
    duration_minutes: 86400, xp_reward: 1000, tier: 'S',
    min_age: 16, max_age: 60, fitness_required: 4, personality_match: 'all', location_required: false,
    tags: ['marathon','running','endurance','21k','legendary','fitness'],
    info: { why_its_worth_it: 'A half marathon proves to your body — not just your mind — that you are capable of more than you thought.', estimated_time_range: '6–8 weeks of training + race day', safety_notes: ['Get medical clearance first','Follow a structured training plan','Never skip rest days'], nearest_search_term: 'half marathon events near me' }
  },
  {
    title: 'Write and Publish a Long-Form Essay or Blog Post',
    description: 'Write a 1500+ word essay on any topic you care deeply about. Publish it publicly — Medium, Substack, your own site, anywhere people can read it.',
    category: 'mental', cost_min: 0, cost_max: 500, budget_tier: 1,
    duration_minutes: 43200, xp_reward: 1000, tier: 'S',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['writing','publishing','essay','thought-leadership','creative','mental'],
    info: { why_its_worth_it: 'Publishing something with your name on it — your real ideas, in public — is one of the most courageous intellectual acts most people never attempt.', estimated_time_range: '1–2 weeks (research, writing, editing)', pro_tip: 'Write the first draft without editing. Edit everything in the second pass. Publish before you feel ready.' }
  },
  {
    title: 'Cook 10 Different Dishes From a Cuisine You\'ve Never Tried',
    description: 'Pick any cuisine — Ethiopian, Georgian, Vietnamese, Peruvian. Cook 10 authentic dishes from it over 30 days. Document each one.',
    category: 'culinary', cost_min: 2000, cost_max: 8000, budget_tier: 3,
    duration_minutes: 43200, xp_reward: 1000, tier: 'S',
    min_age: 16, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['culinary','cooking','world-cuisine','30-day','mastery'],
    info: { why_its_worth_it: 'Learning a cuisine teaches you a culture more viscerally than any book or trip.', estimated_time_range: '30 days', pro_tip: 'Start with the national dish. Let it teach you the flavour logic of the whole cuisine.' }
  },
  {
    title: 'Complete a Multi-Day Trek or Backpacking Trip (3+ Days)',
    description: 'Plan and complete a trek of at least 3 consecutive days in nature. Carry your own pack. Sleep in tents or homestays. No luxury stays.',
    category: 'adventure', cost_min: 3000, cost_max: 20000, budget_tier: 3,
    duration_minutes: 259200, xp_reward: 1000, tier: 'S',
    min_age: 18, max_age: 55, fitness_required: 4, personality_match: 'all', location_required: true,
    tags: ['trek','backpacking','multi-day','nature','legendary','adventure'],
    info: { why_its_worth_it: 'Carrying everything you need on your back, sleeping under stars, moving through wilderness — nothing resets a human being more completely.', estimated_time_range: '3–7 days', safety_notes: ['Never trek alone on remote routes','Register with local forest office','Carry first aid kit','Inform family of full itinerary'], nearest_search_term: 'multi-day trekking routes near me', what_to_bring: ['Trekking poles','Sleeping bag','First aid kit','Headlamp','Rain cover'] }
  },
  {
    title: 'Build and Launch a Side Project in 30 Days',
    description: 'Pick any idea — an app, a newsletter, a small business, a creative service. Build and launch it publicly within 30 days. It must be real and usable by others.',
    category: 'learning', cost_min: 0, cost_max: 5000, budget_tier: 2,
    duration_minutes: 43200, xp_reward: 1000, tier: 'S',
    min_age: 18, max_age: 99, fitness_required: 1, personality_match: 'introvert', location_required: false,
    tags: ['project','launch','build','entrepreneurship','30-day','legendary'],
    info: { why_its_worth_it: 'Most ideas die in people\'s heads. The discipline of launching something — no matter how small — separates those who do from those who think about doing.', estimated_time_range: '30 days (variable hours)', pro_tip: 'Define \'done\' on day 1. Scope creep is how projects never ship.' }
  },
]

async function run() {
  console.log(`Inserting ${quests.length} new quests...`)
  const { data, error } = await s.from('quests').insert(quests).select('id, title, tier, category')
  if (error) {
    console.error('Error:', error.message)
    return
  }
  console.log(`✓ Inserted ${data.length} quests:`)
  data.forEach(q => console.log(`  ${q.tier} · ${q.category.padEnd(12)} — ${q.title}`))
}

run()
