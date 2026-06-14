import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Target, TrendingUp, Trophy, Sparkles, ListChecks, ArrowRight, Brain, Calendar } from 'lucide-react'
import { WeekPlanButton } from '@/components/quest/WeekPlanButton'
import { QuestCard } from '@/components/quest/QuestCard'
import { ActiveQuestTimer } from '@/components/quest/ActiveQuestTimer'
import { XPBar } from '@/components/gamification/XPBar'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'
import {
  getUserProfile, getTodayQuest, getSuggestedQuests,
  getRecentCompletions, getQueuedQuests, getCategoryStats,
  getUserPreferences,
} from '@/lib/queries'
import { getLevelInfo } from '@sidequest/core'
import { formatRelativeTime } from '@/lib/utils'
import type { CategoryStats } from '@/lib/quest-scoring'

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const profile  = await getUserProfile(supabase, user.id)
  if (!profile) redirect('/onboarding')

  const [todayUserQuest, queuedQuests, recentCompletions, catStats, prefs] = await Promise.all([
    getTodayQuest(supabase, user.id),
    getQueuedQuests(supabase, user.id),
    getRecentCompletions(supabase, user.id),
    getCategoryStats(supabase, user.id),
    getUserPreferences(supabase, user.id),
  ])

  // Build stats map for dynamic XP
  const statsMap: CategoryStats = {}
  for (const { category, count } of catStats) statsMap[category] = count

  // Smart suggestions — pass already-fetched prefs to avoid a duplicate DB call
  const suggested = await getSuggestedQuests(
    supabase, profile,
    (todayUserQuest as any)?.quest_id ?? undefined,
    4,
    prefs,
  )

  const levelInfo = getLevelInfo(profile.xp)
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Find any active/paused quest (today's or from queue)
  const allUserQuests = [
    todayUserQuest,
    ...queuedQuests,
  ].filter(Boolean) as any[]

  const activeQuest = allUserQuests.find(
    uq => uq.status === 'in_progress' || uq.status === 'paused',
  )

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">
          {greeting}, <span className="text-ember">{profile.username}</span> 👋
        </h1>
        <p className="text-mist mt-1">
          {profile.streak_count > 0
            ? `${profile.streak_count}-day streak going. Keep the momentum.`
            : 'Your next story starts today.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <LevelBadge xp={profile.xp} size="md" />
          <div>
            <p className="text-xs text-ash uppercase tracking-wide">Level</p>
            <p className="font-bold text-white text-sm">{levelInfo.title}</p>
            <XPBar xp={profile.xp} compact showLabel={false} className="mt-1 w-20" />
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center justify-center">
          <StreakCounter count={profile.streak_count} size="sm" />
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs uppercase tracking-wide">Total XP</span>
          </div>
          <p className="text-2xl font-black text-white">{profile.xp.toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Trophy size={16} />
            <span className="text-xs uppercase tracking-wide">Done</span>
          </div>
          <p className="text-2xl font-black text-white">{profile.total_quests_completed}</p>
        </div>
      </div>

      {/* Active / Paused quest timer */}
      {activeQuest && (
        <div className="mb-6">
          <ActiveQuestTimer
            questTitle={activeQuest.quest?.title ?? 'Your quest'}
            userQuestId={activeQuest.id}
            status={activeQuest.status}
            lockExpiresAt={activeQuest.lock_expires_at ?? null}
            timeRemainingMs={activeQuest.time_remaining_ms ?? null}
            durationMinutes={activeQuest.quest?.duration_minutes ?? 60}
            startedAt={activeQuest.started_at ?? new Date().toISOString()}
          />
        </div>
      )}

      {/* Today's auto-assigned quest */}
      {todayUserQuest && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-ember" />
            <h2 className="text-lg font-bold text-white">Today&apos;s Quest</h2>
            <span className="text-xs text-ash ml-1">Auto-assigned for you</span>
          </div>
          <QuestCard
            quest={(todayUserQuest as any).quest}
            userQuest={todayUserQuest}
            userCity={profile.city}
            featured
          />
        </div>
      )}

      {/* Quest Queue — interests added from browser */}
      {queuedQuests.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white">Your Queue</h2>
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                {queuedQuests.length}
              </span>
            </div>
            <Link href="/quests" className="text-xs text-ash hover:text-ember transition-colors flex items-center gap-1">
              Browse more <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {queuedQuests.map((uq: any) => (
              <QuestCard
                key={uq.id}
                quest={uq.quest}
                userQuest={uq}
                userCity={profile.city}
              />
            ))}
          </div>
        </div>
      )}

      {/* Smart diverse suggestions */}
      {suggested.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="text-lg font-bold text-white">Explore</h2>
              <span className="text-xs text-ash">Picked to push your boundaries</span>
            </div>
            <div className="flex items-center gap-3">
              <WeekPlanButton userId={user.id} />
              <Link href="/quests" className="text-xs text-ash hover:text-ember transition-colors flex items-center gap-1">
                See all <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {suggested.map(q => (
              <QuestCard key={q.id} quest={q} userCity={profile.city} />
            ))}
          </div>
          <p className="text-xs text-ash text-center mt-4">
            Go to <Link href="/quests" className="text-ember hover:underline">Quest Explorer</Link> to
            mark interests or decline what doesn&apos;t resonate. The algorithm learns.
          </p>
        </div>
      )}

      {/* Recent completions */}
      {recentCompletions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Recent completions</h2>
          <div className="glass rounded-2xl divide-y divide-white/5">
            {recentCompletions.map((uq: any) => (
              <div key={uq.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-white">{uq.quest?.title}</p>
                  <p className="text-xs text-ash capitalize mt-0.5">
                    {uq.quest?.category} · {formatRelativeTime(uq.completed_at)}
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-400 flex-shrink-0 ml-4">
                  +{uq.xp_earned} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — new user */}
      {!todayUserQuest && queuedQuests.length === 0 && suggested.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🧭</p>
          <h3 className="text-xl font-bold text-white mb-2">Your adventure begins here</h3>
          <p className="text-mist mb-6">Head to the Quest Explorer to find your first quest.</p>
          <Link href="/quests"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ember text-white font-semibold shadow-ember hover:bg-ember-600 transition-colors">
            Explore Quests <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}
