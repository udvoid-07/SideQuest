import { cn } from '@/lib/utils'
import type { QuestTier } from '@sidequest/core'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'tier' | 'category' | 'success' | 'warning'
  tier?: QuestTier
  className?: string
}

const tierClass: Record<QuestTier, string> = {
  F: 'tier-F',
  D: 'tier-D',
  C: 'tier-C',
  B: 'tier-B',
  A: 'tier-A',
  S: 'tier-S',
}

export function Badge({ children, variant = 'default', tier, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide',
        variant === 'default'  && 'bg-void-700 text-mist border border-white/10',
        variant === 'success'  && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        variant === 'warning'  && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        variant === 'tier' && tier && tierClass[tier],
        className,
      )}
    >
      {children}
    </span>
  )
}
