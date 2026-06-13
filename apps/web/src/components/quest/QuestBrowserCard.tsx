'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Coins, Info, ThumbsUp, ThumbsDown, CheckCircle2, XCircle } from 'lucide-react'
import type { Quest } from '@sidequest/core'
import {
  TIER_COLORS, TIER_LABELS, CATEGORY_ICONS, CATEGORY_COLORS,
  formatCost, formatDuration,
} from '@sidequest/core'
import { Badge } from '@/components/ui/Badge'
import { QuestInfoPanel } from './QuestInfoPanel'
import { expressInterest, declineQuest } from '@/app/actions'
import { getDynamicXP } from '@/lib/quest-scoring'
import type { CategoryStats } from '@/lib/quest-scoring'
import { cn } from '@/lib/utils'

interface QuestBrowserCardProps {
  quest: Quest
  categoryStats: CategoryStats
  totalCompleted: number
  userCity?: string
  isInterested?: boolean
  isDeclined?: boolean
  userBudgetTier?: number
  userFitnessLevel?: number
}

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 3 * 24 * 60 * 60 * 1000
}

export function QuestBrowserCard({
  quest, categoryStats, totalCompleted, userCity = '',
  isInterested = false, isDeclined = false,
  userBudgetTier = 4, userFitnessLevel = 5,
}: QuestBrowserCardProps) {
  const router = useRouter()
  const [showInfo, setShowInfo]   = useState(false)
  const [action, setAction]       = useState<string | null>(null)
  const [done, setDone]           = useState<'interested' | 'declined' | null>(
    isInterested ? 'interested' : isDeclined ? 'declined' : null,
  )

  const tierColor        = TIER_COLORS[quest.tier]
  const categoryGradient = CATEGORY_COLORS[quest.category]
  const categoryIcon     = CATEGORY_ICONS[quest.category]
  const xp               = getDynamicXP(quest, categoryStats, totalCompleted)
  const questIsNew       = isNew(quest.created_at)
  const overBudget       = quest.budget_tier > userBudgetTier
  const overFitness      = quest.fitness_required > userFitnessLevel

  async function handle(type: 'interested' | 'declined') {
    setAction(type)
    if (type === 'interested') await expressInterest(quest.id)
    else await declineQuest(quest.id)
    setDone(type)
    setAction(null)
    router.refresh()
  }

  const opacity = done === 'declined' ? 0.35 : 1

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={!done ? { y: -3 } : undefined}
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(74,32,96,0.65) 0%, rgba(50,24,71,0.95) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Tier accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
             style={{ background: `linear-gradient(90deg, ${tierColor}90, transparent)` }} />

        {/* Category blob */}
        <div className={cn(
          'absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-15 bg-gradient-to-br',
          categoryGradient,
        )} />

        <div className="p-5 relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="tier" tier={quest.tier}>{quest.tier} · {TIER_LABELS[quest.tier]}</Badge>
              <span className="text-xs text-ash capitalize flex items-center gap-1">
                <span>{categoryIcon}</span>{quest.category}
              </span>
              {questIsNew && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pop">
                  🆕 New
                </span>
              )}
            </div>
            <button
              onClick={() => setShowInfo(true)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-ember/20 hover:text-ember text-ash transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Quest info"
            >
              <Info size={13} />
            </button>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-base mt-3 leading-snug">{quest.title}</h3>
          <p className="text-sm text-mist mt-1.5 line-clamp-2 leading-relaxed">{quest.description}</p>

          {/* Dynamic XP */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: xp.isBonus ? '#F5A623' : xp.isPenalty ? '#6B5080' : '#F5A623' }}>
                ⚡ {xp.adjusted} XP
              </span>
              {xp.adjusted !== xp.base && (
                <span className="text-[10px] text-ash line-through">{xp.base}</span>
              )}
              {xp.label && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                  xp.isBonus  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                  : 'bg-void-700 text-ash border border-white/5',
                )}>
                  {xp.label}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs text-ash">
              <Clock size={11} />{formatDuration(quest.duration_minutes)}
            </span>
            <span className="flex items-center gap-1 text-xs text-ash">
              <Coins size={11} />{formatCost(quest.cost_min, quest.cost_max)}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {quest.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-ash border border-white/5">
                #{tag}
              </span>
            ))}
          </div>

          {/* Stretch indicators */}
          {(overBudget || overFitness) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {overBudget && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  💸 Outside your budget — stretch quest
                </span>
              )}
              {overFitness && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  💪 Higher fitness level — challenge quest
                </span>
              )}
            </div>
          )}

          {/* Action area */}
          <div className="mt-4">
            {done === 'interested' ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 size={16} />
                Added to your dashboard
              </div>
            ) : done === 'declined' ? (
              <div className="flex items-center gap-2 text-ash text-sm">
                <XCircle size={16} />
                Declined — we'll show fewer like this
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handle('interested')}
                  disabled={!!action}
                  className={cn(
                    'flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                    'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400',
                    'hover:bg-emerald-500/30 hover:border-emerald-400/70 active:scale-95',
                    action === 'interested' && 'opacity-60 cursor-wait',
                  )}
                >
                  {action === 'interested'
                    ? <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    : <><ThumbsUp size={14} /> I&apos;m Interested</>
                  }
                </button>
                <button
                  onClick={() => handle('declined')}
                  disabled={!!action}
                  className={cn(
                    'flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                    'bg-red-500/15 border border-red-500/40 text-red-400',
                    'hover:bg-red-500/25 hover:border-red-500/60 active:scale-95',
                    action === 'declined' && 'opacity-60 cursor-wait',
                  )}
                >
                  {action === 'declined'
                    ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <><ThumbsDown size={14} /> Decline</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showInfo && (
          <QuestInfoPanel quest={quest} userCity={userCity} onClose={() => setShowInfo(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
