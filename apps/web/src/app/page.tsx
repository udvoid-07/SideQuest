import Link from 'next/link'
import { Compass, Zap, Map, User, ArrowRight, Flame, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { StarField } from '@/components/StarField'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const FEATURED_QUESTS = [
  { tier: 'C', title: 'Take a Pottery Trial Class',              xp: 120, duration: '2h',       cost: '₹800',  icon: '🏺' },
  { tier: 'F', title: 'Strike Up a Convo With a Stranger',       xp: 25,  duration: '15 min',   cost: 'Free',  icon: '💬' },
  { tier: 'B', title: 'Solo Day Trip to a Nearby Town',          xp: 250, duration: 'Full day', cost: '₹1500', icon: '🚂' },
]

const CATEGORIES = [
  { icon: '🎨', label: 'Creative',  color: '#ec4899' },
  { icon: '🤝', label: 'Social',    color: '#38bdf8' },
  { icon: '🏃', label: 'Physical',  color: '#f97316' },
  { icon: '🧠', label: 'Mental',    color: '#8b5cf6' },
  { icon: '🍜', label: 'Culinary',  color: '#f59e0b' },
  { icon: '🗺️', label: 'Adventure', color: '#10b981' },
  { icon: '📚', label: 'Learning',  color: '#3b82f6' },
  { icon: '🌿', label: 'Wellness',  color: '#34d399' },
]

const STEPS = [
  { n: '01', icon: <User size={20} />, title: 'Build Your Profile',   desc: 'Tell us your personality, fitness, budget, and city. Takes 2 minutes.' },
  { n: '02', icon: <Map  size={20} />, title: 'Get Your Daily Quest', desc: 'Every day we assign a personalised real-world quest matched to you.' },
  { n: '03', icon: <Zap  size={20} />, title: 'Earn XP & Level Up',   desc: 'Complete quests, build streaks, unlock badges. Life is the game.' },
]

const TIER_COLORS: Record<string, string> = {
  F: '#9CA3AF', D: '#60A5FA', C: '#34D399', B: '#FBBF24', A: '#F97316', S: '#f15153',
}
const TIER_LABELS: Record<string, string> = {
  F: 'Micro', D: 'Easy', C: 'Medium', B: 'Hard', A: 'Expert', S: 'Legendary',
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
  } catch { /* fallback */ }

  const stats = [
    { value: questsDone != null ? (questsDone > 999 ? `${(questsDone / 1000).toFixed(1)}K+` : `${questsDone}+`) : '—', label: 'Quests Done' },
    { value: questTypes != null ? `${questTypes}+` : '—', label: 'Quest Types' },
    { value: '8', label: 'Categories' },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <StarField />
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      {/*
        Mobile-first: no min-h-screen, no flex items-center trick.
        Just clean top padding (navbar height) + comfortable vertical padding.
        Desktop gets a 2-col grid with floating cards.
      */}
      <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-[0.15]"
               style={{ background: '#E8663D' }} />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-[100px] opacity-[0.08]"
               style={{ background: '#F4A261' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left col: all the copy ── */}
            <div className="space-y-5 sm:space-y-6">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                   style={{ background: 'rgba(241,81,83,0.15)', border: '1px solid rgba(241,81,83,0.28)', color: '#f15153' }}>
                <Flame size={11} />
                Real life. Real XP. Real stories.
              </div>

              {/* Headline — 30px mobile, 48px tablet, 72px desktop */}
              <h1 className="text-[1.875rem] sm:text-5xl lg:text-7xl font-black leading-[1.08] tracking-tight">
                Life is the{' '}
                <span className="text-gradient">Ultimate</span>
                <br />
                <span className="text-ember">SideQuest.</span>
              </h1>

              {/* Sub */}
              <p className="text-[0.9rem] sm:text-base lg:text-lg text-mist leading-relaxed max-w-lg">
                Stop saving adventures for someday. Get one real-world quest every day —
                from pottery classes to solo train trips — and earn XP for actually doing them.
              </p>

              {/* CTAs — stacked on mobile, side-by-side on sm+ */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center">
                <Link href="/signup" className="block w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-ember bg-gradient-to-r from-ember-600 to-ember hover:from-ember-700 hover:to-ember-600"
                  >
                    Start Free
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/login" className="block w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 sm:gap-8 pt-1">
                {stats.map(s => (
                  <div key={s.label}>
                    <div className="text-lg sm:text-2xl font-black text-white">{s.value}</div>
                    <div className="text-[10px] sm:text-xs text-ash">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right col: desktop floating cards ── */}
            <div className="relative h-[440px] hidden lg:block">
              {FEATURED_QUESTS.map((q, i) => (
                <div
                  key={q.title}
                  className="absolute rounded-2xl p-5 w-72 shadow-quest"
                  style={{
                    top:  i === 0 ? '2%'  : i === 1 ? '32%' : '62%',
                    left: i === 0 ? '12%' : i === 1 ? '0%'  : '18%',
                    background: 'linear-gradient(135deg, rgba(42,26,14,0.92) 0%, rgba(28,17,9,0.98) 100%)',
                    border: '1px solid rgba(255,210,170,0.10)',
                    backdropFilter: 'blur(12px)',
                    animation: `float ${6 + i * 1.5}s ease-in-out ${i * 0.9}s infinite`,
                    zIndex: 3 - i,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                          style={{ background: `${TIER_COLORS[q.tier]}20`, color: TIER_COLORS[q.tier], border: `1px solid ${TIER_COLORS[q.tier]}35` }}>
                      {q.tier} · {TIER_LABELS[q.tier]}
                    </span>
                    <span className="text-2xl">{q.icon}</span>
                  </div>
                  <p className="font-bold text-white text-sm leading-snug">{q.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-ash">
                    <span style={{ color: '#F5A623' }}>⚡ {q.xp} XP</span>
                    <span>{q.duration}</span>
                    <span>{q.cost}</span>
                  </div>
                  <div className="mt-3 h-px rounded-full opacity-30"
                       style={{ background: `linear-gradient(90deg, ${TIER_COLORS[q.tier]}, transparent)` }} />
                </div>
              ))}
            </div>

          </div>

          {/* ── Mobile quest preview (below hero copy, hidden on lg+) ── */}
          <div className="mt-10 lg:hidden">
            <p className="text-[10px] uppercase tracking-widest text-ash font-semibold text-center mb-3">
              Sample quests waiting for you
            </p>
            <div className="flex flex-col gap-2.5">
              {FEATURED_QUESTS.map(q => (
                <div key={q.title}
                     className="flex items-center gap-3 rounded-xl px-4 py-3"
                     style={{ background: 'rgba(28,17,9,0.7)', border: '1px solid rgba(255,210,170,0.08)' }}>
                  <span className="text-2xl flex-shrink-0">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white leading-snug line-clamp-1">{q.title}</p>
                    <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-ash">
                      <span style={{ color: '#F5A623' }}>⚡ {q.xp} XP</span>
                      <span>{q.duration}</span>
                      <span>{q.cost}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: `${TIER_COLORS[q.tier]}20`, color: TIER_COLORS[q.tier] }}>
                    {q.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-black text-white">Every flavour of adventure</h2>
          <p className="text-mist mt-1.5 text-sm">8 categories. Hundreds of quests.</p>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map(cat => (
            <div key={cat.label} className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-3xl transition-transform group-hover:scale-110 group-hover:-translate-y-1"
                   style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}35` }}>
                {cat.icon}
              </div>
              <span className="text-[9px] sm:text-xs text-ash group-hover:text-white transition-colors text-center leading-tight">
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6"
               style={{ background: 'rgba(42,26,14,0.35)', borderTop: '1px solid rgba(255,210,170,0.06)', borderBottom: '1px solid rgba(255,210,170,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-black text-white">How SideQuest works</h2>
            <p className="text-mist mt-1.5 text-sm">Three steps between you and your next story.</p>
          </div>
          {/* Single column mobile, 3-col sm+ */}
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step, idx) => (
              <div key={step.n} className="relative flex sm:flex-col gap-4 sm:gap-0">
                {/* Mobile: horizontal layout with number + content side by side */}
                <div className="flex-shrink-0 sm:mb-3">
                  <div className="text-3xl sm:text-5xl font-black opacity-10 text-ember leading-none sm:mb-4">{step.n}</div>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-ember/15 border border-ember/30 flex items-center justify-center text-ember mt-1 sm:mt-0">
                    {step.icon}
                  </div>
                </div>
                <div className="pt-1 sm:pt-0">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">{step.title}</h3>
                  <p className="text-mist text-sm leading-relaxed">{step.desc}</p>
                </div>
                {/* Connector line between steps on mobile */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-5 top-full mt-0 w-px h-6 bg-ember/20 sm:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTROVERT SECTION ─────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-10 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, rgba(42,26,14,0.8) 0%, rgba(28,17,9,0.95) 100%)', border: '1px solid rgba(255,210,170,0.10)' }}>
          <div className="absolute -right-8 -top-8 w-48 sm:w-64 h-48 sm:h-64 rounded-full blur-3xl opacity-20"
               style={{ background: '#8b5cf6' }} />
          <div className="relative">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌱</div>
            <h2 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3">Built for introverts too.</h2>
            <p className="text-mist text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6 max-w-2xl">
              Not every quest needs a crowd. Your first quests will be solo, gentle, and entirely
              on your own terms. Over time, we&apos;ll nudge you just outside your comfort circle.
            </p>
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {[
                'Leave a genuine compliment for someone',
                'Sit at a café alone for 30 minutes, no phone',
                'Ask a stranger for a book recommendation',
              ].map(q => (
                <div key={q} className="flex items-start gap-2.5 text-sm text-mist">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0 mt-1.5" />
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GAMIFICATION ────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6"
               style={{ background: 'rgba(232,102,61,0.04)', borderTop: '1px solid rgba(255,210,170,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-white mb-3 sm:mb-4">
                Why should fun only exist in games?
              </h2>
              <p className="text-mist leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                SideQuest brings the dopamine of levelling up into real life. Complete quests,
                build streaks, earn badges.
              </p>
              <div className="space-y-2.5 sm:space-y-3">
                {[
                  { icon: '⚡', label: 'Earn XP for every quest completed' },
                  { icon: '🔥', label: 'Daily streaks keep the momentum alive' },
                  { icon: '🏆', label: 'Unlock badges for special achievements' },
                  { icon: '📈', label: '6 levels — from Curious to Legend' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 text-sm text-mist">
                    <span className="text-base flex-shrink-0">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Level bars */}
            <div className="space-y-2.5 sm:space-y-3">
              {[
                { level: 1, title: 'The Curious',    xp: '0 XP',    color: '#9CA3AF', pct: 100 },
                { level: 2, title: 'The Wanderer',   xp: '200 XP',  color: '#60A5FA', pct: 80  },
                { level: 3, title: 'The Explorer',   xp: '600 XP',  color: '#34D399', pct: 60  },
                { level: 4, title: 'The Seeker',     xp: '1400 XP', color: '#FBBF24', pct: 40  },
                { level: 5, title: 'The Adventurer', xp: '3000 XP', color: '#F97316', pct: 20  },
                { level: 6, title: 'The Legend',     xp: '6000 XP', color: '#f15153', pct: 10  },
              ].map(l => (
                <div key={l.level} className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0"
                       style={{ border: `2px solid ${l.color}60`, color: l.color, background: `${l.color}15` }}>
                    {l.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] sm:text-xs mb-1">
                      <span className="text-white font-medium">{l.title}</span>
                      <span className="text-ash">{l.xp}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(28,17,9,0.9)' }}>
                      <div className="h-full rounded-full"
                           style={{ width: `${l.pct}%`, background: l.color, opacity: 0.75 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6"
               style={{ background: 'linear-gradient(180deg, rgba(42,26,14,0.6) 0%, rgba(28,17,9,0.95) 100%)', borderTop: '1px solid rgba(255,210,170,0.07)' }}>
        <div className="max-w-sm sm:max-w-xl mx-auto text-center">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-5">🧭</div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 sm:mb-3">
            Your next story starts today.
          </h2>
          <p className="text-mist text-sm sm:text-base mb-6 sm:mb-8">
            Free to start. No credit card. Just curiosity and a willingness to go outside.
          </p>
          <Link href="/signup" className="block">
            <Button
              size="lg"
              className="w-full shadow-ember bg-gradient-to-r from-ember-600 to-ember hover:from-ember-700 hover:to-ember-600"
            >
              Create Free Account
              <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="text-[11px] text-ash mt-3">
            No credit card · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── DISCLAIMER ─────────────────────────────────────── */}
      <section className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-start gap-3 text-[11px] sm:text-xs text-ash">
          <Shield size={13} className="flex-shrink-0 mt-0.5 opacity-50" />
          <p className="leading-relaxed">
            SideQuest suggests activities for entertainment only. All quests are optional.
            Users are responsible for their own safety and expenses. The app complies with
            all applicable Indian laws.
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6 text-center text-[11px] sm:text-xs text-ash">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Compass size={13} className="text-ember" />
          <span className="font-semibold text-white text-sm">SideQuest</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
          <Link href="/privacy"  className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms"    className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/login"    className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup"   className="hover:text-ember transition-colors font-medium">Start Free</Link>
        </div>
        <p>© 2025 SideQuest. Built with ❤️ for the restless.</p>
      </footer>
    </div>
  )
}
