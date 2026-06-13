'use client'
import { useEffect, useRef } from 'react'
import { getXPProgress, getLevelInfo } from '@sidequest/core'
import { cn } from '@/lib/utils'

interface XPBarProps {
  xp: number
  showLabel?: boolean
  compact?: boolean
  className?: string
}

export function XPBar({ xp, showLabel = true, compact = false, className }: XPBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const { current, required, percent } = getXPProgress(xp)
  const levelInfo = getLevelInfo(xp)

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.setProperty('--xp-pct', `${percent}%`)
      fillRef.current.style.width = `${percent}%`
    }
  }, [percent])

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-mist font-medium">{levelInfo.title}</span>
          <span className="text-ash">
            {current.toLocaleString()} / {required.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className={cn('xp-track', compact ? 'h-1.5' : 'h-2.5')}>
        <div
          ref={fillRef}
          className="xp-fill"
          style={{ '--xp-pct': `${percent}%` } as React.CSSProperties}
        />
      </div>
    </div>
  )
}
