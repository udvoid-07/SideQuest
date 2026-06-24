import Link from 'next/link'
import { Compass, Zap, Map, User, ArrowRight, Flame, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { StarField } from '@/components/StarField'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const FEATURED_QUESTS = [
  {
    tier: 'C', title: 'Take a Pottery Trial Class',
    xp: 120, duration: '2h', cost: '₹800', icon: '🏺',
    color: '#34D399',
  },
  {
    tier: 'F', title: 'Strike Up a Conversation With a Stranger',
    xp: 25, duration: '15 min', cost: 'Free', icon: '💬',
    color: '#60A5FA',
  },
  {
    tier: 'B', title: 'Solo Day Trip to a Nearby Town',
    xp: 250, duration: 'Full day', cost: '₹1500', icon: '🚂',
    color: '#FBBF24',
  },
]

const CATEGORIES = [
  { icon: '🎨', label: 'Creative',   color: '#ec4899' },
  { icon: '🤝', label: 'Social',     color: '#38bdf8' },
  { icon: '🏃', label: 'Physical',   color: '#f97316' },
  { icon: '🧠', label: 'Mental',     color: '#8b5cf6' },
  { icon: '🍜', label: 'Culinary',   color: '#f59e0b' },
  { icon: '🗺️', label: 'Adventure',  color: '#10b981' },
  { icon: '📚', label: 'Learning',   color: '#3b82f6' },
  { icon: '🌿', label: 'Wellness',   color: '#34d399' },
]

const STEPS = [
  {
    n: '01', icon: <User size={22} />, title: 'Build Your Profile',
    desc: 'Tell us your personality, fitness level, budget, and city. Takes 2 minutes.',
  },
  {
    n: '02', icon: <Map size={22} />, title: 'Get Your Daily Quest',
    desc: 'Every day we assign a personalised real-world quest. Explore it, start it, own it.',
  },
  {
    n: '03', icon: <Zap size={22} />, title: 'Earn XP & Level Up',
    desc: 'Complete quests, build streaks, unlock badges. Life is the game.',
  },
]

const TIER_LABELS: Record<string, string> = {
  F: 'Micro', D: 'Easy', C: 'Medium', B: 'Challenging', A: 'Hard', S: 'Legendary',
}
const TIER_COLORS: Record<string, string> = {
  F: '#9CA3AF', D: '#60A5FA', C: '#34D399', B: '#FBBF24', A: '#F97316', S: '#f15153',
}

export default async function LandingPage() {
  let questsDone: number | null = null
  let questTypes: number | null = null
  try {
    const supabase = createSupabaseServerClient()
    const [r1, r2] = await Promise.all([
      supabase.from('user_quests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('quests').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])
    questsDone = r1.count
    questTypes = r2.count
  } catch { /* fallback to dashes if DB unreachable */ }

  const stats = [
    { value: questsDone != null ? (questsDone > 999 ? `${(questsDone / 1000).toFixed(1)}K+` : `${questsDone}+`) : '—', label: 'Quests Done' },
    { value: questTypes != null ? `${questTypes}+` : '—',  label: 'Quest Types' },
    { value: '8', label: 'Categories' },
  ]

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[130px] opacity-[0.18]"
               style={{ background: '#E8663D' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[110px] opacity-[0.12]"
               style={{ background: '#F4A261' }} />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-[90px] opacity-[0.08]"
               style={{ background: '#C2855A' }} />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center relative w-full">
          {/* Left: copy */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                 style={{ background: 'rgba(241,81,83,0.15)', border: '1px solid rgba(241,81,83,0.3)', color: '#f15153' }}>
              <Flame size={12} />
              Real life. Real XP. Real stories.
            </div>

            {/* h1 — responsive: 36px mobile → 48px tablet → 72px desktop */}
            <h1 className="text-[2.25rem] sm:text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
              Life is the{' '}
              <span className="relative inline-block">
                <span className="text-gradient">Ultimate</span>
              </span>
              <br />
              <span className="text-ember">SideQuest.</span>
            </h1>

            <p className="text-base sm:text-lg text-mist leading-relaxed max-w-xl">
              Stop saving adventures for someday. We give you one real-world quest every
              day — from salsa classes to solo train trips — and reward you with XP for
              actually doing them.
            </p>

            {/* CTAs — stacked full-width on mobile, inline on sm+ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link href="/signup" className="flex-1 sm:flex-none">
                <Button
                  size="xl"
                  className="w-full sm:w-auto shadow-ember bg-gradient-to-r from-ember-600 to-ember hover:from-ember-700 hover:to-ember-600"
                >
                  Start Your Quest — It's Free
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/login" className="flex-1 sm:flex-none">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 sm:gap-8 pt-1">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-xl sm:text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-ash">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating quest cards — desktop only */}
          <div className="relative h-[480px] hidden lg:block">
            {FEATURED_QUESTS.map((q, i) => (
              <div
                key={q.title}
                className="absolute rounded-2xl p-5 w-72 shadow-quest"
                style={{
                  top:  i === 0 ? '0%' : i === 1 ? '30%' : '60%',
                  left: i === 0 ? '15%' : i === 1 ? '0%' : '20%',
                  background: 'linear-gradient(135deg, rgba(42,26,14,0.9) 0%, rgba(28,17,9,0.97) 100%)',
                  border: '1px solid rgba(255,210,170,0.10)',
                  backdropFilter: 'blur(12px)',
                  animation: `float ${6 + i * 1.5}s ease-in-out ${i * 0.8}s infinite`,
                  zIndex: 3 - i,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: `${TIER_COLORS[q.tier]}20`,
                      color: TIER_COLORS[q.tier],
                      border: `1px solid ${TIER_COLORS[q.tier]}35`,
                    }}
                  >
                    {q.tier} · {TIER_LABELS[q.tier]}
                  </span>
                  <span className="text-2xl">{q.icon}</span>
                </div>
                <p className="font-bold text-white text-sm leading-snug">{q.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-ash">
                  <span className="flex items-center gap-1">
                    <Zap size={11} style={{ color: '#F5A623' }} />
                    <span style={{ color: '#F5A623' }}>{q.xp} XP</span>
                  </span>
                  <span>{q.duration}</span>
                  <span>{q.cost}</span>
                </div>
                <div className="mt-3 h-0.5 rounded-full opacity-40"
                     style={{ background: `linear-gradient(90deg, ${TIER_COLORS[q.tier]}, transparent)` }} />
              </div>
            ))}
          </div>

          {/* Mobile quest card preview — visible only on < lg */}
          <div className="lg:hidden">
            <p className="text-xs text-ash uppercase tracking-widest mb-4 text-center font-semibold">
              Sample quests waiting for you
            </p>
            <div className="grid gap-3">
              {FEATURED_QUESTS.map(q => (
                <div
                  key={q.title}
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: 'rgba(28,17,9,0.75)',
                    border: '1px solid rgba(255,210,170,0.09)',
                  }}
                >
                  <span className="text-3xl flex-shrink-0">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug truncate">{q.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ash">
                      <span style={{ color: '#F5A623' }}>⚡ {q.xp} XP</span>
                      <span>{q.duration}</span>
                      <span>{q.cost}</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: `${TIER_COLORS[q.tier]}20`, color: TIER_COLORS[q.tier] }}
                  >
                    {q.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Every flavour of adventure</h2>
          <p className="text-mist mt-2 text-sm sm:text-base">8 categories. Hundreds of quests.</p>
        </div>
        {/* 4-col on mobile, 8-col on md+ — each cell min 44px touch target */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map(cat => (
            <div key={cat.label} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-transform group-hover:scale-110 group-hover:-translate-y-1"
                style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}35` }}
              >
                {cat.icon}
              </div>
              <span className="text-[10px] sm:text-xs text-ash group-hover:text-white transition-colors text-center leading-tight">
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section
        className="py-16 sm:py-24 px-5 sm:px-6"
        style={{
          background  : 'rgba(42,26,14,0.35)',
          borderTop   : '1px solid rgba(255,210,170,0.06)',
          borderBottom: '1px solid rgba(255,210,170,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-white">How SideQuest works</h2>
            <p className="text-mist mt-2 text-sm sm:text-base">Three steps between you and your next story.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-8">
            {STEPS.map(step => (
              <div key={step.n} className="relative">
                <div className="text-5xl font-black opacity-10 text-ember mb-4">{step.n}</div>
                <div className="w-11 h-11 rounded-xl bg-ember/15 border border-ember/30 flex items-center justify-center text-ember mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-mist text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Introvert section ──────────────────────────────── */}
      <section className="py-16 sm:py-24 px-5 sm:px-6 max-w-5xl mx-auto">
        <div
          className="rounded-3xl p-6 sm:p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42,26,14,0.8) 0%, rgba(28,17,9,0.95) 100%)',
            border: '1px solid rgba(255,210,170,0.10)',
          }}
        >
          <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full blur-3xl opacity-20"
               style={{ background: '#8b5cf6' }} />
          <div className="relative max-w-2xl">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Built for introverts too.</h2>
            <p className="text-mist text-base sm:text-lg leading-relaxed mb-6">
              Not every quest needs a crowd. Your first quests will be solo, gentle, and
              entirely on your own terms. Over time, we&apos;ll nudge you just outside your
              comfort circle — one small step at a time.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                'Leave a genuine compliment for someone',
                'Sit at a café alone for 30 minutes, no phone',
                'Ask a stranger for a book recommendation',
              ].map(q => (
                <div key={q} className="flex items-start gap-3 text-sm text-mist">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0 mt-1.5" />
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Gamification ────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24 px-5 sm:px-6"
        style={{ background: 'rgba(232,102,61,0.04)', borderTop: '1px solid rgba(255,210,170,0.06)' }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 sm:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              Why should fun only exist in games?
            </h2>
            <p className="text-mist leading-relaxed mb-6 text-sm sm:text-base">
              SideQuest brings the dopamine of levelling up into real life. Complete quests,
              build streaks, earn badges — and watch your real-world adventurer level climb.
            </p>
            <div className="space-y-3">
              {[
                { icon: '⚡', label: 'Earn XP for every quest completed' },
                { icon: '🔥', label: 'Daily streaks keep the momentum alive' },
                { icon: '🏆', label: 'Unlock badges for special achievements' },
                { icon: '📈', label: '6 levels — from Curious to Legend' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 text-sm text-mist">
                  <span className="text-lg flex-shrink-0">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* Level preview */}
          <div className="space-y-3">
            {[
              { level: 1, title: 'The Curious',    xp: '0 XP',    color: '#9CA3AF', pct: 100 },
              { level: 2, title: 'The Wanderer',   xp: '200 XP',  color: '#60A5FA', pct: 80  },
              { level: 3, title: 'The Explorer',   xp: '600 XP',  color: '#34D399', pct: 60  },
              { level: 4, title: 'The Seeker',     xp: '1400 XP', color: '#FBBF24', pct: 40  },
              { level: 5, title: 'The Adventurer', xp: '3000 XP', color: '#F97316', pct: 20  },
              { level: 6, title: 'The Legend',     xp: '6000 XP', color: '#f15153', pct: 10  },
            ].map(l => (
              <div key={l.level} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ border: `2px solid ${l.color}60`, color: l.color, background: `${l.color}15` }}
                >
                  {l.level}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">{l.title}</span>
                    <span className="text-ash">{l.xp}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(28,17,9,0.9)' }}>
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${l.pct}%`, background: l.color, opacity: 0.75 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24 px-5 sm:px-6"
        style={{
          background: 'linear-gradient(180deg, rgba(42,26,14,0.6) 0%, rgba(28,17,9,0.95) 100%)',
          borderTop: '1px solid rgba(255,210,170,0.07)',
        }}
      >
        <div className="max-w-xl mx-auto text-center">
          <div className="text-5xl sm:text-6xl mb-5">🧭</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Your next story starts today.
          </h2>
          <p className="text-mist text-sm sm:text-base mb-8">
            Free to start. No credit card. Just curiosity and a willingness to go outside.
          </p>
          {/* Full-width on mobile, auto on sm+ */}
          <Link href="/signup" className="block sm:inline-block">
            <Button
              size="xl"
              className="w-full sm:w-auto shadow-ember bg-gradient-to-r from-ember-600 to-ember hover:from-ember-700 hover:to-ember-600"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="text-xs text-ash mt-4">
            Join free · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────── */}
      <section className="py-8 px-5 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-start gap-3 text-xs text-ash">
          <Shield size={14} className="flex-shrink-0 mt-0.5 opacity-50" />
          <p className="leading-relaxed">
            SideQuest suggests activities for entertainment only. All quests are optional.
            Users are responsible for their own safety and expenses. The app complies with
            all applicable Indian laws. Activities are reviewed to ensure they are legal
            and age-appropriate.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-5 sm:px-6 text-center text-xs text-ash">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Compass size={14} className="text-ember" />
          <span className="font-semibold text-white">SideQuest</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/signup" className="hover:text-ember transition-colors font-medium">Start Free</Link>
        </div>
        <p>© 2025 SideQuest. Built with ❤️ for the restless.</p>
      </footer>
    </div>
  )
}
