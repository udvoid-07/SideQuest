-- =========================================================
-- SideQuest — Seed Data
-- =========================================================

-- ─── Badges ───────────────────────────────────────────────

insert into public.badges (name, description, icon, condition_type, condition_value, condition_category) values
  ('First Step',       'Completed your very first quest',               '👣', 'quest_count',    1,   null),
  ('Triple Threat',    'Completed 3 quests',                            '🌟', 'quest_count',    3,   null),
  ('Adventurer',       'Completed 10 quests',                           '🗺️', 'quest_count',    10,  null),
  ('Quest Master',     'Completed 25 quests',                           '⚔️', 'quest_count',    25,  null),
  ('Week Warrior',     'Maintained a 7-day streak',                     '🗓️', 'streak',         7,   null),
  ('Iron Streak',      'Maintained a 30-day streak',                    '⚡', 'streak',         30,  null),
  ('Century Club',     'Maintained a 100-day streak',                   '💯', 'streak',         100, null),
  ('Comfort Breaker',  '3 social quests completed',                     '🌱', 'category_count', 3,   'social'),
  ('Social Butterfly', '10 social quests completed',                    '🦋', 'category_count', 10,  'social'),
  ('Culture Vulture',  '5 creative or learning quests',                 '🎭', 'category_count', 5,   'creative'),
  ('Fit Life',         '5 physical quests completed',                   '🏃', 'category_count', 5,   'physical'),
  ('The Legend',       'Reached Level 6',                               '👑', 'special',        6,   null);

-- ─── Quests ───────────────────────────────────────────────
--
-- PILLAR FREE QUESTS — guaranteed one free quest per core genre:
--   pillar-healthy   → "Walk 10,000 Steps Before Sunset"
--   pillar-creative  → "Take a Street Photography Walk"
--   pillar-growth    → "Learn Three Phrases in a New Language"
--   pillar-peace     → "Meditate for 20 Minutes, Outdoors"
--   pillar-connect   → "Leave a Genuine Compliment for Someone"
--
-- Every pillar quest has cost_min=0, cost_max=0, budget_tier=1

insert into public.quests (title, description, category, cost_min, cost_max, budget_tier, duration_minutes, xp_reward, tier, min_age, max_age, fitness_required, personality_match, location_required, tags, info) values

-- ─── PILLAR: HEALTHY ─────────────────────────────────────
-- Free physical health quests — no equipment, no cost, no excuses

('Walk 10,000 Steps Before Sunset',
 'Lace up and walk 10,000 steps today — a park loop, your neighbourhood, or anywhere you like. Track it with your phone''s health app.',
 'physical', 0, 0, 1, 90, 25, 'F', 13, 99, 1, 'all', false,
 ARRAY['free','walking','healthy','pillar-healthy','outdoor','solo'],
 '{"why_its_worth_it":"10,000 steps is the simplest prescription for a longer, healthier life. Most people walk fewer than 4,000. Today you change that.","estimated_time_range":"60–90 min","pro_tip":"Split it into two walks — morning and evening. The evening one is magical.","safety_notes":["Wear comfortable shoes","Stay hydrated","Wear sunscreen if walking midday"]}'),

('20-Minute Bodyweight Workout at Home',
 'No gym, no equipment, no excuses. 20 minutes of push-ups, squats, lunges, and planks. Look up any beginner routine on YouTube first.',
 'physical', 0, 0, 1, 25, 25, 'F', 13, 99, 1, 'all', false,
 ARRAY['free','workout','home','healthy','pillar-healthy','no-equipment','fitness'],
 '{"why_its_worth_it":"You don''t need a gym membership to start. You need 20 minutes and the floor you''re already standing on.","estimated_time_range":"20–30 min","what_to_bring":["Water bottle","Yoga mat or a towel if your floor is hard"],"pro_tip":"Do it first thing in the morning before your brain makes excuses. 5 minutes in you''ll feel different."}'),

-- ─── F tier (Micro) — Free, 5–20 min ────────────────────

-- PILLAR: CONNECT
('Leave a Genuine Compliment for Someone',
 'Tell someone something you genuinely appreciate about them — a colleague, stranger, or friend. In person is best.',
 'social', 0, 0, 1, 10, 25, 'F', 13, 99, 1, 'introvert', false,
 ARRAY['free','quick','introvert-friendly','kind','pillar-connect'],
 '{"why_its_worth_it":"You make their day. Surprisingly, yours too.","estimated_time_range":"5–10 min","pro_tip":"Be specific. \"I love your energy today\" lands better than \"you seem nice.\""}'),

-- PILLAR: PEACE
('Meditate for 20 Minutes, Outdoors',
 'Find a park, rooftop, or any open space. Sit, breathe, and be present for 20 minutes. No guided audio needed.',
 'wellness', 0, 0, 1, 25, 25, 'F', 13, 99, 1, 'introvert', false,
 ARRAY['free','meditation','outdoors','solo','pillar-peace'],
 '{"why_its_worth_it":"Nature + stillness resets you faster than sleep.","estimated_time_range":"20–30 min","safety_notes":["Let someone know where you are if going to a secluded area"]}'),

-- PILLAR: GROWTH
('Learn Three Phrases in a New Language',
 'Pick a language you''ve always been curious about. Learn: hello, thank you, and one full sentence.',
 'learning', 0, 0, 1, 20, 25, 'F', 13, 99, 1, 'all', false,
 ARRAY['free','quick','language','solo','pillar-growth'],
 '{"why_its_worth_it":"Even three phrases makes travel magical and strangers smile.","estimated_time_range":"15–30 min","pro_tip":"Use YouTube shorts — one phrase at a time."}'),

('Watch a Documentary Outside Your Usual Genre',
 'If you watch thrillers, pick a nature doc. If you watch history, pick an art one. 45 minutes minimum.',
 'mental', 0, 0, 1, 60, 25, 'F', 13, 99, 1, 'introvert', false,
 ARRAY['free','home','mental','evening','growth'],
 '{"why_its_worth_it":"Your brain makes unexpected connections. One documentary changed how many people think.","estimated_time_range":"45 min – 1.5 hrs"}'),

('Sit at a Café Alone for 30 Minutes Without Your Phone',
 'Order something. Put your phone face down. Just observe and exist. No scrolling.',
 'wellness', 100, 300, 2, 35, 25, 'F', 16, 99, 1, 'introvert', false,
 ARRAY['solo','café','mindfulness','introvert'],
 '{"why_its_worth_it":"Being comfortable alone is a superpower. This is the training ground.","estimated_time_range":"30–45 min","pro_tip":"Bring a notebook — you might start writing something."}'),

-- D tier (Easy) — 30–60 min
('Cook a Dish From a Cuisine You''ve Never Tried',
 'Pick any cuisine — Thai, Ethiopian, Georgian — find a simple recipe and cook from scratch.',
 'culinary', 200, 600, 2, 90, 60, 'D', 13, 99, 1, 'all', false,
 ARRAY['cooking','home','food','creative'],
 '{"why_its_worth_it":"A mini cultural immersion that smells amazing.","estimated_time_range":"1–2 hrs","what_to_bring":["Ingredients from a local market"],"pro_tip":"Watch one YouTube video first, then put it away and trust your instincts."}'),

('Explore a Neighbourhood You''ve Never Walked Through',
 'Pick any street or area of your city you''ve passed on transport but never walked. Give it one hour on foot.',
 'adventure', 0, 100, 1, 60, 60, 'D', 13, 99, 2, 'all', false,
 ARRAY['walking','city','solo','exploration'],
 '{"why_its_worth_it":"Your city has entire worlds hidden in streets you ignore daily.","estimated_time_range":"1–2 hrs","safety_notes":["Go during daytime","Keep your phone charged"]}'),

('Read the First Chapter of a Book You''ve Been Avoiding',
 'You know the one. It''s been on your shelf/wishlist for months. Give it one chapter tonight.',
 'mental', 0, 400, 2, 40, 60, 'D', 13, 99, 1, 'introvert', false,
 ARRAY['reading','home','evening','solo'],
 '{"why_its_worth_it":"The first chapter is always the hardest. Most people who start finish.","estimated_time_range":"30–60 min"}'),

-- PILLAR: CREATIVE
('Take a Street Photography Walk',
 'Walk for 45 minutes in a market, street, or busy area and capture 10 interesting photos with your phone.',
 'creative', 0, 0, 1, 50, 60, 'D', 16, 99, 2, 'all', false,
 ARRAY['photography','walking','creative','city','pillar-creative','free'],
 '{"why_its_worth_it":"Seeing the world through a viewfinder changes how you notice beauty in the ordinary.","estimated_time_range":"45–90 min","pro_tip":"Shoot at golden hour (6–8 AM or 5–7 PM) for magic light."}'),

-- C tier (Medium) — 1–3 hrs
('Visit a Museum You''ve Never Been To',
 'Pick any museum in your city you''ve been meaning to visit. Spend at least 90 minutes. No phone unless for pictures.',
 'learning', 0, 200, 2, 120, 120, 'C', 13, 99, 2, 'all', true,
 ARRAY['culture','solo','weekend','learning'],
 '{"why_its_worth_it":"Museums rewire how you see the world. One visit can spark a lifelong interest.","estimated_time_range":"1.5–3 hrs","what_to_bring":["Comfortable shoes","Some cash for entry"],"pro_tip":"Go on a weekday morning — fewer crowds, staff have more time.","nearest_search_term":"museums near me"}'),

('Take a Pottery Trial Class',
 'Book a 2-hour pottery trial class at a local studio. No experience needed.',
 'creative', 600, 1200, 3, 120, 120, 'C', 16, 99, 1, 'all', true,
 ARRAY['creative','hands-on','class','pottery'],
 '{"why_its_worth_it":"You make something with your own hands. Nothing beats that satisfaction.","estimated_time_range":"2–3 hrs","what_to_bring":["Comfortable clothes that can get dirty","An open mind"],"nearest_search_term":"pottery class near me"}'),

('Attend a Local Open Mic Night',
 'Find an open mic near you — comedy, poetry, music — and attend as audience. No performing required.',
 'social', 0, 300, 2, 150, 120, 'C', 18, 99, 1, 'all', true,
 ARRAY['social','evening','art','live'],
 '{"why_its_worth_it":"Raw, human, unpredictable. You will remember at least one act.","safety_notes":["Check the venue is reputable","Let someone know where you''re going"],"nearest_search_term":"open mic nights this week","estimated_time_range":"2–3 hrs"}'),

('Take a Salsa or Dance Trial Class',
 'Find a beginner''s trial class for salsa, Bollywood, or any dance style you''ve been curious about.',
 'physical', 500, 1000, 2, 90, 120, 'C', 16, 99, 2, 'all', true,
 ARRAY['dance','class','social','physical'],
 '{"why_its_worth_it":"Your body learns a language that has nothing to do with words.","what_to_bring":["Comfortable shoes","Water bottle"],"nearest_search_term":"dance trial class near me","estimated_time_range":"1.5–2 hrs"}'),

-- B tier (Challenging) — Half day
('Volunteer at an Animal Shelter for Half a Day',
 'Contact a local animal shelter and offer 4 hours of your time. Walk dogs, socialise cats, assist staff.',
 'social', 0, 0, 1, 240, 250, 'B', 16, 99, 2, 'all', true,
 ARRAY['volunteer','animals','meaningful','social'],
 '{"why_its_worth_it":"You leave fundamentally different than you arrived. Animals have that effect.","what_to_bring":["Comfortable old clothes","Water bottle","Good energy"],"safety_notes":["Call ahead to confirm your slot","Follow all shelter safety protocols"],"nearest_search_term":"animal shelter volunteer near me","estimated_time_range":"4–6 hrs"}'),

('Solo Day Trip to a Nearby Town',
 'Pick a town within 3 hours by train or bus. Go alone. No fixed plan — just show up and explore.',
 'adventure', 800, 2000, 3, 480, 250, 'B', 18, 99, 2, 'all', true,
 ARRAY['solo','travel','adventure','weekend'],
 '{"why_its_worth_it":"Being alone in a new place teaches you things about yourself that no book can.","safety_notes":["Tell someone your travel plans","Keep emergency contact saved","Keep some cash"],"estimated_time_range":"Full day"}'),

-- A tier (Hard) — Full day
('Attend a One-Day Workshop in Something You Know Nothing About',
 'Find a workshop for ceramics, cooking, coding, improv, lock-picking — anything outside your expertise.',
 'learning', 1000, 5000, 4, 480, 500, 'A', 18, 99, 2, 'all', true,
 ARRAY['workshop','learning','skill','weekend'],
 '{"why_its_worth_it":"Being a complete beginner in a room of strangers is one of the most humbling and energising feelings.","nearest_search_term":"one day workshop classes","estimated_time_range":"6–8 hrs","what_to_bring":["Notebook","Snacks","Open mind"]}'),

-- S tier (Legendary)
('Complete a 3-Day Digital Detox Retreat',
 'Sign up for a 3-day retreat — silent, nature, or wellness. No social media, no streaming, minimal phone.',
 'wellness', 5000, 25000, 4, 4320, 1000, 'S', 18, 99, 2, 'all', true,
 ARRAY['retreat','digital-detox','wellness','transformative'],
 '{"why_its_worth_it":"Most people report a permanent shift in their relationship with their phone. This is the one that sticks.","safety_notes":["Research the retreat thoroughly","Inform family of your location","Bring any required medications"],"estimated_time_range":"3 days","what_to_bring":["Journal","Comfortable clothes","Cash for incidentals"]}');
