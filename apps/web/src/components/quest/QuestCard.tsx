'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LevelUpModal } from '@/components/ui/LevelUpModal'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Coins, Zap, Info, Play, CheckCircle2, SkipForward, Lock, XCircle } from 'lucide-react'
import type { Quest, UserQuest } from '@sidequest/core'
import {
  TIER_COLORS, TIER_LABELS, CATEGORY_ICONS, CATEGORY_COLORS,
  formatCost, formatDuration,
} from '@sidequest/core'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { QuestInfoPanel } from './QuestInfoPanel'
import { startQuest, completeQuest, skipQuest, abandonQuest } from '@/app/actions'
import { cn } from '@/lib/utils'

interface QuestCardProps {
  quest: Quest
  userQuest?: UserQuest
  featured?: boolean
  compact?: boolean
  userCity?: string
}

export function QuestCard({ quest, userQuest, featured = false, compact = false, userCity = '' }: QuestCardProps) {
  const router = useRouter()
  const [showInfo,    setShowInfo]    = useState(false)
  const [loading,     setLoading]     = useState<string | null>(null)
  const [started,     setStarted]     = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ level: number; xp: number; badges: any[] } | null>(null)

  const tierColor       = TIER_COLORS[quest.tier]
  const categoryGradient = CATEGORY_COLORS[quest.category]
  const categoryIcon    = CATEGORY_ICONS[quest.category]

  const [now, setNow] = useState(() => Date.now())
  const status       = userQuest?.status ?? 'available'
  const isCompleted  = status === 'completed'
  const isInProgress = status === 'in_progress'
  const lockExpiry   = userQuest?.lock_expires_at
    ? new Date(userQuest.lock_expires_at).getTime()
    : null
  const isLocked     = isInProgress && !!lockExpiry && lockExpiry > now
  const lockSecsLeft = isLocked && lockExpiry ? Math.ceil((lockExpiry - now) / 1000) : 0
  const lockMins     = Math.floor(lockSecsLeft / 60)
  const lockSecs     = lockSecsLeft % 60
  const lockLabel    = lockSecsLeft > 0
    ? `${lockMins}:${String(lockSecs).padStart(2, '0')} left`
    : ''

  // Tick every second while locked
  useEffect(() => {
    if (!isLocked) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isLocked])

  async function handle(action: string, fn: () => Promise<any>) {
    setLoading(action)
    try {
      const res = await fn()
      if (res?.error) {
        console.error(res.error)
      } else {
        if (action === 'start') {
          setStarted(true)
          setTimeout(() => { setStarted(false); router.refresh() }, 1800)
          return
        }
        // Check for level-up from complete_quest result
        if (action === 'complete' && res?.result?.leveled_up) {
          setLevelUpData({
            level:  res.result.level_after,
            xp:     res.result.xp_earned,
            badges: res.result.new_badges ?? [],
          })
        } else {
          router.refresh()
        }
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={!compact ? { y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(241,81,83,0.08), inset 0 1px 0 rgba(255,255,255,0.12)' } : undefined}
        whileTap={!isCompleted ? { scale: 0.985 } : undefined}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-300',
          featured ? 'shadow-glow' : '',
          isCompleted && 'opacity-70',
          compact ? 'p-4' : 'p-5',
        )}
        style={{
          background: 'rgba(50, 24, 71, 0.3)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Tier accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
             style={{ background: `linear-gradient(90deg, ${tierColor}80, transparent)` }} />

        {/* Category blob */}
        <div className={cn('absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br', categoryGradient)} />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="tier" tier={quest.tier}>
              {quest.tier} · {TIER_LABELS[quest.tier]}
            </Badge>
            <span className="text-xs text-ash capitalize flex items-center gap-1">
              <span>{categoryIcon}</span>
              {quest.category}
            </span>
          </div>
          <button
            onClick={() => setShowInfo(true)}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-white/10 hover:bg-ember/20 hover:text-ember text-ash transition-colors flex items-center justify-center -mr-2 -mt-1"
            aria-label="Show quest info"
          >
            <Info size={14} />
          </button>
        </div>

        {/* Title */}
        <h3 className={cn('font-bold text-white mt-3 leading-snug', featured ? 'text-xl' : compact ? 'text-sm' : 'text-base')}>
          {quest.title}
        </h3>

        {!compact && (
          <p className="text-sm text-mist mt-1.5 line-clamp-2 leading-relaxed">{quest.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-ash">
          <span className="flex items-center gap-1">
            <Zap size={12} style={{ color: '#F5A623' }} />
            <span className="font-semibold" style={{ color: '#F5A623' }}>{quest.xp_reward} XP</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />{formatDuration(quest.duration_minutes)}
          </span>
          <span className="flex items-center gap-1">
            <Coins size={12} />{formatCost(quest.cost_min, quest.cost_max)}
          </span>
        </div>

        {/* Tags */}
        {!compact && quest.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {quest.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-ash border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {!compact && (
          <div className="flex items-center gap-2 mt-4">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle2 size={16} />
                Quest Completed
              </div>
            ) : isInProgress ? (
              isLocked ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between text-xs text-ash px-1">
                    <span className="flex items-center gap-1.5">
                      <Lock size={11} />
                      Quest in progress
                    </span>
                    <span className="font-mono text-amber-400 font-semibold">{lockLabel}</span>
                  </div>
                  <Button
                    size="sm" fullWidth variant="ghost"
                    loading={loading === 'complete'}
                    onClick={() => handle('complete', () => completeQuest(userQuest!.id))}
                    className="border border-white/10 text-ash hover:text-white hover:border-white/25"
                  >
                    <CheckCircle2 size={14} /> Finish Early
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button
                    size="sm"
                    loading={loading === 'complete'}
                    onClick={() => handle('complete', () => completeQuest(userQuest!.id))}
                    className="flex-1"
                  >
                    <CheckCircle2 size={15} /> Mark Complete
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    loading={loading === 'abandon'}
                    onClick={() => handle('abandon', () => abandonQuest(userQuest!.id))}
                    className="w-9 px-0 flex-shrink-0 border border-white/10 text-ash hover:text-red-400 hover:border-red-500/30"
                    title="Abandon quest"
                  >
                    <XCircle size={14} />
                  </Button>
                </div>
              )
            ) : started ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-amber-400 text-sm font-semibold w-full justify-center py-1"
              >
                <Play size={15} className="fill-amber-400" />
                Quest started! Go make it happen.
              </motion.div>
            ) : (
              <>
                <Button
                  size="sm"
                  loading={loading === 'start'}
                  onClick={() => handle('start', () => startQuest(quest.id))}
                  className="flex-1"
                >
                  <Play size={14} /> Start Quest
                </Button>
                {userQuest && (
                  <Button
                    size="sm" variant="ghost"
                    loading={loading === 'skip'}
                    onClick={() => handle('skip', () => skipQuest(userQuest.id))}
                    className="w-9 px-0 flex-shrink-0"
                    title="Skip quest"
                  >
                    <SkipForward size={14} />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showInfo && (
          <QuestInfoPanel
            quest={quest}
            userCity={userCity}
            onClose={() => setShowInfo(false)}
          />
        )}
      </AnimatePresence>

      {levelUpData && (
        <LevelUpModal
          levelAfter={levelUpData.level}
          xpEarned={levelUpData.xp}
          newBadges={levelUpData.badges}
          onClose={() => { setLevelUpData(null); router.refresh() }}
        />
      )}
    </>
  )
}
