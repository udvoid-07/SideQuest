import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Flame, Zap, Target, Calendar, Award, CheckCircle2, Clock, Timer, Pause, ListChecks } from 'lucide-react'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { getLevelInfo, getXPProgress, LEVEL_TABLE, CATEGORY_ICONS, TIER_COLORS, TIER_LABELS, formatDuration } from '@sidequest/core'
import type { QuestCategory, QuestTier } from '@sidequest/core'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'
import {
  getUserProfile, getCategoryStats, getUserBadgesEarned,
  getAllBadges, getAcceptedQuests, getCompletedQuests,
} from '@/lib/queries'
import { formatRelativeTime } from '@/lib/utils'
import { AccountSettingsForm } from '@/components/profile/AccountSettingsForm'
import { DeleteAccountButton } from '@/components/profile/DeleteAccountButton'

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  queued:      { label: 'In Queue', color: '#60A5FA', icon: <ListChecks size={14} /> },
  in_progress: { label: 'Active',   color: '#f15153', icon: <Timer size={14} />      },
  paused:      { label: 'Paused',   color: '#FBBF24', icon: <Pause size={14} />      },
}

export default async function ProfilePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const profile  = await getUserProfile(supabase, user.id)
  if (!profile) redirect('/onboarding')

  const [categoryStats, earnedBadgeIds, allBadges, acceptedQuests, completedQuests] =
    await Promise.all([
      getCategoryStats(supabase, user.id),
      getUserBadgesEarned(supabase, user.id),
      getAllBadges(supabase),
      getAcceptedQuests(supabase, user.id),
      getCompletedQuests(supabase, user.id),
    ])

  const level   = getLevelInfo(profile.xp)
  const { current, required, percent } = getXPProgress(profile.xp)
  const nextLevel = LEVEL_TABLE.find(l => l.level === level.level + 1)

  return (
    <div className="p-4 md:p-8 max-w-2xl space-y-6">
      <h1 className="text-3xl font-black text-white">Profile</h1>

      {/* ── Level card ── */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-15"
             style={{ background: level.color }} />
        <div className="flex items-center gap-4 relative">
          <LevelBadge xp={profile.xp} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white truncate">{profile.username}</h2>
            <p className="text-mist text-sm truncate">{profile.email}</p>
            <p className="text-xs text-ash mt-1 capitalize">{profile.personality_type} · {profile.city}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white font-semibold">Level {level.level} — {level.title}</span>
            {nextLevel && (
              <span className="text-ash">{current.toLocaleString()} / {required.toLocaleString()} XP</span>
            )}
          </div>
          <div className="xp-track h-2.5">
            <div className="xp-fill"
                 style={{ width: `${percent}%`, '--xp-pct': `${percent}%` } as React.CSSProperties} />
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Zap size={18} />,   label: 'Total XP',    value: profile.xp.toLocaleString(),         color: '#F5A623' },
          { icon: <Target size={18} />,label: 'Quests Done', value: profile.total_quests_completed,      color: '#34D399' },
          { icon: <Flame size={18} />, label: 'Streak',      value: `${profile.streak_count}d`,          color: '#f97316' },
          { icon: <Trophy size={18} />,label: 'Best Streak', value: `${profile.longest_streak}d`,        color: '#f15153' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-1.5" style={{ color: s.color }}>{s.icon}</div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-ash mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Account settings ── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Account Settings</h2>
        <AccountSettingsForm profile={profile} />
      </div>

      {/* ── Active quests ── */}
      {acceptedQuests.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <ListChecks size={16} className="text-blue-400" />
            Active Quests
            <span className="text-xs text-ash font-normal ml-1">{acceptedQuests.length}</span>
          </h3>
          <div className="space-y-2">
            {(acceptedQuests as any[]).map(uq => {
              const meta = STATUS_META[uq.status] ?? { label: uq.status, color: '#9CA3AF', icon: <Clock size={14} /> }
              const tierColor = TIER_COLORS[uq.quest?.tier as QuestTier] ?? '#9CA3AF'
              return (
                <div key={uq.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-void-800/40">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tierColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{uq.quest?.title}</p>
                    <p className="text-[10px] text-ash mt-0.5 capitalize">{uq.quest?.category} · {uq.quest?.xp_reward} XP · {formatDuration(uq.quest?.duration_minutes ?? 0)}</p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                    style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}30` }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Completed quests ── */}
      {completedQuests.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Completed Quests
            <span className="text-xs text-ash font-normal ml-1">{completedQuests.length}</span>
          </h3>
          <div className="space-y-2">
            {(completedQuests as any[]).map(uq => {
              const tierColor = TIER_COLORS[uq.quest?.tier as QuestTier] ?? '#9CA3AF'
              return (
                <div key={uq.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-void-900/30">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tierColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{uq.quest?.title}</p>
                    <p className="text-[11px] text-ash capitalize mt-0.5">
                      {uq.quest?.category} · {uq.quest?.tier} {TIER_LABELS[uq.quest?.tier as QuestTier] ?? ''} · {uq.completed_at ? formatRelativeTime(uq.completed_at) : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: '#F5A623' }}>
                    +{uq.xp_earned} XP
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty quest history */}
      {acceptedQuests.length === 0 && completedQuests.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">🗺️</p>
          <p className="font-semibold text-white">No quest history yet</p>
          <p className="text-mist text-sm mt-1">Head to the Quest Explorer to find your first adventure.</p>
        </div>
      )}

      {/* ── Category breakdown ── */}
      {categoryStats.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-ember" />
            Quest Breakdown
          </h3>
          <div className="space-y-3">
            {categoryStats.map(({ category, count }) => {
              const pct  = profile.total_quests_completed > 0
                ? Math.round((count / profile.total_quests_completed) * 100) : 0
              const icon = CATEGORY_ICONS[category as QuestCategory] ?? '🎯'
              return (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-lg w-8">{icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white capitalize">{category}</span>
                      <span className="text-ash">{count} quest{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-void-800">
                      <div className="h-full rounded-full bg-ember/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Badges ── */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Award size={16} className="text-ember" />
          Badges
          <span className="text-xs text-ash font-normal ml-1">{earnedBadgeIds.length}/{allBadges.length} earned</span>
        </h3>
        {allBadges.length === 0 ? (
          <p className="text-ash text-sm">No badges yet — complete quests to earn them.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {allBadges.map(badge => {
              const earned = earnedBadgeIds.includes(badge.id)
              return (
                <div key={badge.id}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all
                    ${earned
                      ? 'bg-void-700/60 border border-white/10'
                      : 'opacity-30 grayscale bg-void-900/50 border border-white/5'}`}
                  title={badge.description}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-[10px] text-center font-medium leading-tight text-mist">{badge.name}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Legal & Account ── */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-ash uppercase tracking-widest mb-3">Legal & Account</h3>
        <div className="space-y-1">
          <Link href="/privacy" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist hover:text-white hover:bg-white/5 transition-all">
            Privacy Policy
          </Link>
          <Link href="/terms" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist hover:text-white hover:bg-white/5 transition-all">
            Terms of Service
          </Link>
          <div className="pt-2 border-t border-white/5">
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </div>
  )
}
