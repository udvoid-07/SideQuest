import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Flame, Zap, Target, Calendar, Award, ListChecks, CheckCircle2, Clock, Timer, Pause, Trash2 } from 'lucide-react'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { XPBar } from '@/components/gamification/XPBar'
import { getLevelInfo, getXPProgress, LEVEL_TABLE, CATEGORY_ICONS, TIER_COLORS, TIER_LABELS, formatDuration } from '@sidequest/core'
import type { QuestCategory, QuestTier } from '@sidequest/core'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'
import {
  getUserProfile, getCategoryStats, getUserBadgesEarned,
  getAllBadges, getAcceptedQuests, getCompletedQuests,
} from '@/lib/queries'
import { formatRelativeTime } from '@/lib/utils'

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  queued:      { label: 'In Queue',   color: '#60A5FA', icon: <ListChecks size={14} /> },
  in_progress: { label: 'Active',     color: '#f15153', icon: <Timer size={14} />      },
  paused:      { label: 'Paused',     color: '#FBBF24', icon: <Pause size={14} />      },
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

  const level     = getLevelInfo(profile.xp)
  const { current, required, percent } = getXPProgress(profile.xp)
  const nextLevel = LEVEL_TABLE.find(l => l.level === level.level + 1)

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <h1 className="text-3xl font-black text-white">Profile</h1>

      {/* Hero card */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-15"
             style={{ background: level.color }} />
        <div className="flex items-center gap-5 relative">
          <LevelBadge xp={profile.xp} size="lg" />
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white">{profile.username}</h2>
            <p className="text-mist text-sm">{profile.email}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-ash flex-wrap">
              <span className="capitalize">{profile.personality_type}</span>
              <span>·</span>
              <span>{profile.city}</span>
              <span>·</span>
              <span>Age {profile.age}</span>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white font-semibold">Level {level.level} — {level.title}</span>
            {nextLevel && (
              <span className="text-ash">
                {current.toLocaleString()} / {required.toLocaleString()} XP → Level {nextLevel.level}
              </span>
            )}
          </div>
          <div className="xp-track h-3">
            <div className="xp-fill"
                 style={{ width: `${percent}%`, '--xp-pct': `${percent}%` } as React.CSSProperties} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Zap size={18} />,   label: 'Total XP',       value: profile.xp.toLocaleString(),   color: '#F5A623' },
          { icon: <Target size={18} />,label: 'Quests Done',    value: profile.total_quests_completed, color: '#34D399' },
          { icon: <Flame size={18} />, label: 'Streak',         value: `${profile.streak_count}d`,    color: '#f97316' },
          { icon: <Trophy size={18} />,label: 'Best Streak',    value: `${profile.longest_streak}d`,  color: '#f15153' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-ash mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active / Queued quests */}
      {acceptedQuests.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <ListChecks size={16} className="text-blue-400" />
            Accepted Quests
            <span className="text-xs text-ash font-normal ml-1">{acceptedQuests.length} quest{acceptedQuests.length !== 1 ? 's' : ''}</span>
          </h3>
          <div className="space-y-3">
            {acceptedQuests.map((uq: any) => {
              const meta = STATUS_META[uq.status] ?? { label: uq.status, color: '#9CA3AF', icon: <Clock size={14} /> }
              const tierColor = TIER_COLORS[uq.quest?.tier as QuestTier] ?? '#9CA3AF'
              return (
                <div key={uq.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-void-800/40">
                  {/* Tier + category dot */}
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tierColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{uq.quest?.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-ash capitalize">{uq.quest?.category}</span>
                      <span className="text-[10px] text-ash">·</span>
                      <span className="text-[10px]" style={{ color: meta.color }}>
                        {meta.icon && <span className="inline-flex items-center gap-1">{meta.icon} {meta.label}</span>}
                      </span>
                      <span className="text-[10px] text-ash">·</span>
                      <span className="text-[10px] text-ash">
                        <Zap size={9} className="inline" style={{ color: '#F5A623' }} /> {uq.quest?.xp_reward} XP
                      </span>
                      <span className="text-[10px] text-ash">
                        <Clock size={9} className="inline" /> {formatDuration(uq.quest?.duration_minutes ?? 0)}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}30` }}
                  >
                    {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed quests */}
      {completedQuests.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Completed Quests
            <span className="text-xs text-ash font-normal ml-1">{completedQuests.length} completed</span>
          </h3>
          <div className="space-y-2">
            {completedQuests.map((uq: any) => {
              const tierColor = TIER_COLORS[uq.quest?.tier as QuestTier] ?? '#9CA3AF'
              return (
                <div key={uq.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-void-900/30">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tierColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{uq.quest?.title}</p>
                    <p className="text-[11px] text-ash capitalize mt-0.5">
                      {uq.quest?.category} · {uq.quest?.tier} {TIER_LABELS[uq.quest?.tier as QuestTier] ?? ''} · {formatRelativeTime(uq.completed_at)}
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

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-ember" />
            Quest Breakdown by Category
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

      {/* Badges */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Award size={16} className="text-ember" />
          Badges
          <span className="text-xs text-ash font-normal ml-1">
            {earnedBadgeIds.length}/{allBadges.length} earned
          </span>
        </h3>
        {allBadges.length === 0 ? (
          <p className="text-ash text-sm">No badges found.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {allBadges.map(badge => {
              const earned = earnedBadgeIds.includes(badge.id)
              return (
                <div key={badge.id}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all
                    ${earned
                      ? 'bg-void-700/60 border border-white/10'
                      : 'opacity-30 grayscale bg-void-900/50 border border-white/5'
                    }`}
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
      {/* Legal links + Account deletion */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide text-ash">Account & Legal</h3>
        <div className="space-y-2">
          <Link href="/privacy" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist hover:text-white hover:bg-white/5 transition-all">
            Privacy Policy
          </Link>
          <Link href="/terms" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist hover:text-white hover:bg-white/5 transition-all">
            Terms of Service
          </Link>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}

function DeleteAccountButton() {
  return (
    <form action={async () => {
      'use server'
      const { deleteAccount } = await import('@/app/actions')
      await deleteAccount()
    }}>
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left"
        onClick={(e) => {
          if (!confirm('Permanently delete your account and all data? This cannot be undone.')) {
            e.preventDefault()
          }
        }}
      >
        <Trash2 size={16} />
        Delete Account & All Data
      </button>
    </form>
  )
}
