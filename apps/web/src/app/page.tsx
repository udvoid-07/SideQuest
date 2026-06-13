import Link from 'next/link'
import { Compass, Zap, Map, User, ArrowRight, Star, Flame, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'

const FEATURED_QUESTS = [
  {
    tier: 'C', category: 'creative', title: 'Take a Pottery Trial Class',
    xp: 120, duration: '2h', cost: '₹800', gradient: 'from-pink-600 to-purple-700',
    icon: '🏺',
  },
  {
    tier: 'F', category: 'social', title: 'Strike Up a Conversation With a Stranger',
    xp: 25, duration: '15 min', cost: 'Free', gradient: 'from-blue-600 to-cyan-600',
    icon: '💬',
  },
  {
    tier: 'B', category: 'adventure', title: 'Solo Day Trip to a Nearby Town',
    xp: 250, duration: 'Full day', cost: '₹1500', gradient: 'from-emerald-600 to-teal-600',
    icon: '🚂',
  },
]

const CATEGORIES = [
  { icon: '🎨', label: 'Creative', color: '#ec4899' },
  { icon: '🤝', label: 'Social',   color: '#38bdf8' },
  { icon: '🏃', label: 'Physical', color: '#f97316' },
  { icon: '🧠', label: 'Mental',   color: '#8b5cf6' },
  { icon: '🍜', label: 'Culinary', color: '#f59e0b' },
  { icon: '🗺️', label: 'Adventure',color: '#10b981' },
  { icon: '📚', label: 'Learning', color: '#3b82f6' },
  { icon: '🌿', label: 'Wellness', color: '#34d399' },
]

const STEPS = [
  {
    n: '01', icon: <User size={22} />, title: 'Build Your Profile',
    desc: 'Tell us your personality, fitness level, budget, and city. Takes 2 minutes.',
  },
  {
    n: '02', icon: <Map size={22} />, title: 'Get Your Daily Quest',
    desc: 'Every day we assign a personalised quest. Explore it, start it, own it.',
  },
  {
    n: '03', icon: <Zap size={22} />, title: 'Earn XP & Level Up',
    desc: 'Complete quests, maintain streaks, unlock higher tiers. Life is the game.',
  },
]

const TIER_LABELS: Record<string, string> = {
  F: 'Micro', D: 'Easy', C: 'Medium', B: 'Challenging', A: 'Hard', S: 'Legendary',
}
const TIER_COLORS: Record<string, string> = {
  F: '#9CA3AF', D: '#60A5FA', C: '#34D399', B: '#FBBF24', A: '#F97316', S: '#f15153',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
               style={{ background: '#f15153' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15"
               style={{ background: '#F5A623' }} />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-[80px] opacity-10"
               style={{ background: '#8b5cf6' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative">
          {/* Left: copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                 style={{ background: 'rgba(241,81,83,0.15)', border: '1px solid rgba(241,81,83,0.3)', color: '#f15153' }}>
              <Flame size={12} />
              Real life. Real XP. Real stories.
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
              Life is the{' '}
              <span className="relative inline-block">
                <span className="text-gradient">Ultimate</span>
              </span>
              <br />
              <span className="text-ember">SideQuest.</span>
            </h1>

            <p className="text-lg text-mist leading-relaxed max-w-xl">
              Stop saving adventures for someday. We give you one tailored real-world
              quest every day — from learning salsa to solo train trips — and reward you
              with XP for completing them.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/signup">
                <Button size="xl" className="shadow-ember">
                  Start Your Quest
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { value: '10K+', label: 'Quests Done' },
                { value: '500+', label: 'Quest Types' },
                { value: '8', label: 'Categories' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-ash">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating quest cards */}
          <div className="relative h-[500px] hidden lg:block">
            {FEATURED_QUESTS.map((q, i) => (
              <div
                key={q.title}
                className="absolute rounded-2xl p-5 w-72 shadow-quest"
                style={{
                  top:  i === 0 ? '0%'   : i === 1 ? '30%'  : '60%',
                  left: i === 0 ? '15%'  : i === 1 ? '0%'   : '20%',
                  background: 'linear-gradient(135deg, rgba(74,32,96,0.8) 0%, rgba(50,24,71,0.95) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
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
                      border: `1px solid ${TIER_COLORS[q.tier]}30`,
                    }}
                  >
                    {q.tier} · {TIER_LABELS[q.tier]}
                  </span>
                  <span className="text-2xl">{q.icon}</span>
                </div>
                <p className="font-bold text-white text-sm">{q.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-ash">
                  <span className="flex items-center gap-1">
                    <Zap size={11} style={{ color: '#F5A623' }} />
                    <span style={{ color: '#F5A623' }}>{q.xp} XP</span>
                  </span>
                  <span>{q.duration}</span>
                  <span>{q.cost}</span>
                </div>
                <div
                  className="mt-3 h-0.5 rounded-full opacity-40"
                  style={{ background: `linear-gradient(90deg, ${TIER_COLORS[q.tier]}, transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">Every flavour of adventure</h2>
          <p className="text-mist mt-2">8 categories. Infinite possibilities.</p>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORIES.map(cat => (
            <div key={cat.label} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:-translate-y-1"
                style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}
              >
                {cat.icon}
              </div>
              <span className="text-xs text-ash group-hover:text-white transition-colors">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: 'rgba(74,32,96,0.15)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white">How SideQuest works</h2>
            <p className="text-mist mt-2">Three steps between you and your next story.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(step => (
              <div key={step.n} className="relative">
                <div className="text-5xl font-black opacity-10 text-ember mb-4">{step.n}</div>
                <div className="w-11 h-11 rounded-xl bg-ember/15 border border-ember/25 flex items-center justify-center text-ember mb-4">
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
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl p-10 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, rgba(74,32,96,0.6) 0%, rgba(50,24,71,0.9) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full blur-3xl opacity-20"
               style={{ background: '#8b5cf6' }} />
          <div className="relative max-w-2xl">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-3xl font-black text-white mb-3">Built for introverts too.</h2>
            <p className="text-mist text-lg leading-relaxed mb-6">
              Not every quest needs a crowd. Your first quests will be solo, gentle, and
              entirely on your own terms. Over time, we'll nudge you just outside your
              comfort circle — one small step at a time.
            </p>
            <div className="flex flex-col gap-2">
              {[
                'Leave a genuine compliment for someone',
                'Sit at a café alone for 30 minutes, no phone',
                'Ask a stranger for a book recommendation',
              ].map(q => (
                <div key={q} className="flex items-center gap-3 text-sm text-mist">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0" />
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Gamification ────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: 'rgba(241,81,83,0.04)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-white mb-4">
              Why should fun only exist in games?
            </h2>
            <p className="text-mist leading-relaxed mb-6">
              SideQuest brings the dopamine of levelling up into real life. Complete quests,
              build streaks, earn badges — and watch your real-world adventurer level climb.
            </p>
            <div className="space-y-3">
              {[
                { icon: '⚡', label: 'Earn XP for every quest completed' },
                { icon: '🔥', label: 'Daily streaks keep the momentum alive' },
                { icon: '🏆', label: 'Unlock badges for special achievements' },
                { icon: '📈', label: '6 levels from Curious to Legend' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 text-sm text-mist">
                  <span className="text-lg">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
          {/* Level preview */}
          <div className="space-y-3">
            {[
              { level: 1, title: 'The Curious',    xp: '0 XP',     color: '#9CA3AF', pct: 100 },
              { level: 2, title: 'The Wanderer',   xp: '200 XP',   color: '#60A5FA', pct: 80  },
              { level: 3, title: 'The Explorer',   xp: '600 XP',   color: '#34D399', pct: 60  },
              { level: 4, title: 'The Seeker',     xp: '1400 XP',  color: '#FBBF24', pct: 40  },
              { level: 5, title: 'The Adventurer', xp: '3000 XP',  color: '#F97316', pct: 20  },
              { level: 6, title: 'The Legend',     xp: '6000 XP',  color: '#f15153', pct: 10  },
            ].map(l => (
              <div key={l.level} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ border: `2px solid ${l.color}60`, color: l.color, background: `${l.color}15` }}
                >
                  {l.level}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">{l.title}</span>
                    <span className="text-ash">{l.xp}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-void-800">
                    <div className="h-full rounded-full" style={{ width: `${l.pct}%`, background: l.color, opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────── */}
      <section className="py-10 px-6 text-center">
        <div className="max-w-2xl mx-auto flex items-start gap-3 text-xs text-ash">
          <Shield size={14} className="flex-shrink-0 mt-0.5 text-void-500" />
          <p>
            SideQuest suggests activities for entertainment only. All quests are optional.
            Users are responsible for their own safety and expenses. The app complies with
            all applicable Indian laws. Activities are reviewed to ensure they are legal
            and age-appropriate.
          </p>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🧭</div>
          <h2 className="text-4xl font-black text-white mb-4">
            Your next story starts today.
          </h2>
          <p className="text-mist mb-8">Free to start. No credit card. Just curiosity.</p>
          <Link href="/signup">
            <Button size="xl" className="shadow-ember">
              Create Free Account
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-ash">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Compass size={14} className="text-ember" />
          <span className="font-semibold text-white">SideQuest</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
        </div>
        <p>© 2025 SideQuest. All rights reserved. Built with ❤️ for the restless.</p>
      </footer>
    </div>
  )
}
