# SideQuest — Setup Guide

## Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account (free at supabase.com)
- For mobile: Expo Go app on your phone

---

## 1. Install dependencies

```bash
pnpm install
```

---

## 2. Supabase Setup

1. Go to https://supabase.com → New Project
2. Copy your **Project URL** and **anon key** from Settings > API
3. Run the migration in the SQL editor:
   - Open `supabase/migrations/001_initial.sql` → paste into Supabase SQL Editor → Run
   - Then paste and run `supabase/seed.sql`
4. In Supabase Dashboard → Authentication → Providers → Enable Google OAuth
   (Add your Google OAuth client ID + secret)

---

## 3. Environment Variables

**Web app** — create `apps/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Mobile app** — create `apps/mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 4. Run Web App

```bash
pnpm web
# Opens at http://localhost:3000
```

---

## 5. Run Mobile App

```bash
pnpm mobile
# Scan QR with Expo Go on your phone
```

---

## Project Structure

```
sidequest/
├── apps/
│   ├── web/          Next.js 14 — web app
│   └── mobile/       Expo — iOS + Android
├── packages/
│   ├── core/         Shared types, XP logic, quest utils
│   └── supabase/     DB client + TypeScript types
└── supabase/
    ├── migrations/   SQL schema
    └── seed.sql      Initial quest data
```

---

## Color System

| Token   | Hex       | Use                              |
|---------|-----------|----------------------------------|
| void    | `#321847` | Backgrounds, primary surfaces    |
| ember   | `#f15153` | CTAs, active states, XP streaks  |
| gold    | `#F5A623` | XP rewards, progress bars        |
| emerald | `#2ECC71` | Completed quests, success states |

---

## Next Steps

- [ ] Connect Supabase auth callbacks (`apps/web/src/app/auth/callback/route.ts`)
- [ ] Wire dashboard to real Supabase queries (replace mock data)
- [ ] Set up Supabase Edge Function for daily quest assignment
- [ ] Set up midnight cron for streak resets
- [ ] Add Expo Push Notification tokens on login
- [ ] Add Google Places API for location-based quest filtering
