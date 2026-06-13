import { getLevelInfo, LEVEL_TABLE } from '@sidequest/core'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LevelBadge({ xp, size = 'md', className }: LevelBadgeProps) {
  const level = getLevelInfo(xp)

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold border-2',
        'shadow-ember transition-all',
        sizes[size],
        className,
      )}
      style={{
        borderColor: level.color,
        background: `radial-gradient(circle, ${level.color}20 0%, transparent 70%)`,
        color: level.color,
        boxShadow: `0 0 16px ${level.color}40`,
      }}
      title={`Level ${level.level} — ${level.title}`}
    >
      {level.level}
    </div>
  )
}
