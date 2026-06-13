'use client'
import { cn } from '@/lib/utils'

interface StreakCounterProps {
  count: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakCounter({ count, size = 'md', className }: StreakCounterProps) {
  const isActive = count > 0

  const sizes = {
    sm: { wrap: 'gap-1', flame: 'text-lg', count: 'text-sm font-bold', label: 'text-[10px]' },
    md: { wrap: 'gap-2', flame: 'text-3xl', count: 'text-2xl font-bold', label: 'text-xs' },
    lg: { wrap: 'gap-2', flame: 'text-5xl', count: 'text-4xl font-bold', label: 'text-sm' },
  }

  const s = sizes[size]

  return (
    <div className={cn('flex flex-col items-center', s.wrap, className)}>
      <span
        className={cn(s.flame, isActive ? 'streak-flame' : 'opacity-30 grayscale')}
        style={isActive ? { filter: 'drop-shadow(0 0 8px #f97316)' } : undefined}
      >
        🔥
      </span>
      <span className={cn(s.count, isActive ? 'text-orange-400' : 'text-ash')}>
        {count}
      </span>
      <span className={cn(s.label, 'text-ash uppercase tracking-widest')}>
        {count === 1 ? 'day' : 'days'}
      </span>
    </div>
  )
}
