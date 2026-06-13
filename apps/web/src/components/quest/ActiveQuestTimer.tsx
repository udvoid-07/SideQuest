'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Timer, CheckCircle2, Lock, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { completeQuest, pauseQuest, resumeQuest } from '@/app/actions'

interface ActiveQuestTimerProps {
  readonly questTitle: string
  readonly userQuestId: string
  readonly status: 'in_progress' | 'paused'
  readonly lockExpiresAt: string | null
  readonly timeRemainingMs: number | null
  readonly durationMinutes: number
  readonly startedAt: string
}

function getRemaining(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now())
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function ActiveQuestTimer({
  questTitle, userQuestId, status, lockExpiresAt,
  timeRemainingMs, durationMinutes, startedAt,
}: ActiveQuestTimerProps) {
  const router    = useRouter()
  const isPaused  = status === 'paused'
  const initMs    = isPaused
    ? (timeRemainingMs ?? 0)
    : lockExpiresAt ? getRemaining(lockExpiresAt) : 0

  const [remaining, setRemaining] = useState(initMs)
  const [acting, setActing]       = useState<string | null>(null)
  const isExpired = remaining === 0 && !isPaused

  const totalMs   = durationMinutes * 60 * 1000
  const elapsed   = isPaused
    ? totalMs - (timeRemainingMs ?? 0)
    : Date.now() - new Date(startedAt).getTime()
  const progress  = Math.min(100, Math.round((elapsed / totalMs) * 100))

  useEffect(() => {
    if (isPaused || isExpired) return
    if (!lockExpiresAt) return
    const id = setInterval(() => {
      const r = getRemaining(lockExpiresAt)
      setRemaining(r)
      if (r === 0) router.refresh()
    }, 1000)
    return () => clearInterval(id)
  }, [lockExpiresAt, isPaused, isExpired, router])

  async function act(type: 'complete' | 'pause' | 'resume') {
    setActing(type)
    if (type === 'complete') await completeQuest(userQuestId)
    else if (type === 'pause') await pauseQuest(userQuestId)
    else await resumeQuest(userQuestId)
    router.refresh()
    setActing(null)
  }

  const accentColor = isPaused ? '#60A5FA'
    : isExpired ? '#34D399'
    : remaining < 300_000 ? '#f97316'
    : '#f15153'

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border"
      style={{
        borderColor: `${accentColor}50`,
        background: `linear-gradient(135deg, ${accentColor}12 0%, rgba(50,24,71,0.95) 100%)`,
      }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-void-900">
        <motion.div
          className="h-full rounded-r-full"
          animate={{ width: `${isPaused ? progress : isExpired ? 100 : progress}%` }}
          transition={{ duration: 0.5 }}
          style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: `${accentColor}20` }}>
              {isPaused
                ? <Pause size={19} style={{ color: accentColor }} />
                : isExpired
                  ? <CheckCircle2 size={19} style={{ color: accentColor }} />
                  : <Timer size={19} style={{ color: accentColor }} className="animate-pulse" />
              }
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest font-semibold"
                 style={{ color: accentColor }}>
                {isPaused ? 'Quest paused' : isExpired ? 'Time is up — confirm it!' : 'Quest in progress'}
              </p>
              <p className="font-bold text-white text-sm mt-0.5 max-w-xs">{questTitle}</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isPaused ? (
              <Button size="md" variant="outline" loading={acting === 'resume'}
                      onClick={() => act('resume')}>
                <Play size={15} /> Resume
              </Button>
            ) : isExpired ? (
              <Button size="md" loading={acting === 'complete'} onClick={() => act('complete')}
                      className="animate-glow">
                <CheckCircle2 size={16} /> Mark Complete
              </Button>
            ) : (
              <>
                <div className="text-right mr-2">
                  <p className="text-2xl font-black tabular-nums" style={{ color: accentColor }}>
                    {formatTime(remaining)}
                  </p>
                  <p className="text-[10px] text-ash flex items-center gap-1 justify-end mt-0.5">
                    <Lock size={9} /> unlocks when done
                  </p>
                </div>
                <Button size="md" variant="secondary" loading={acting === 'pause'}
                        onClick={() => act('pause')}
                        title="Pause quest timer">
                  <Pause size={15} /> Pause
                </Button>
              </>
            )}
          </div>
        </div>

        {status === 'in_progress' && remaining > 0 && (
          <p className="text-[11px] text-ash text-center mt-3">
            Put the phone down and go live it. ✦ The app unlocks when the timer ends.
          </p>
        )}
        {isPaused && (
          <p className="text-[11px] text-ash text-center mt-3">
            Timer paused · {formatTime(timeRemainingMs ?? 0)} remaining · resume when you&apos;re ready.
          </p>
        )}
      </div>
    </motion.div>
  )
}
