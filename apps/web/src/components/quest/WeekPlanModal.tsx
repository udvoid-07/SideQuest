'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, Calendar, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TIER_COLORS, CATEGORY_ICONS, formatDuration } from '@sidequest/core'
import type { Quest } from '@sidequest/core'

interface DayPlan { day: string; quest: Quest | null; reason: string | null }

interface WeekPlanModalProps {
  onClose: () => void
  userId: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function WeekPlanModal({ onClose, userId }: WeekPlanModalProps) {
  const [loading, setLoading] = useState(false)
  const [plan,    setPlan]    = useState<DayPlan[] | null>(null)
  const [summary, setSummary] = useState('')
  const [error,   setError]   = useState('')

  async function generatePlan() {
    setLoading(true)
    setError('')
    try {
      // Fetch user + available quests then call week-plan endpoint
      const res = await fetch('/api/ai/week-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { id: userId }, quests: [] }),  // server reads real data
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan(data.plan)
      setSummary(data.summary)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] md:max-h-[85vh] z-50 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(160deg,#1e0e2b 0%,#321847 100%)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <span className="font-bold text-white">AI Quest Week Planner</span>
            <span className="text-xs text-ash">powered by Claude</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-mist">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!plan && !loading && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🗓️</div>
              <h3 className="text-lg font-bold text-white mb-2">Plan your adventure week</h3>
              <p className="text-mist text-sm mb-6 max-w-sm mx-auto">
                Claude will pick 7 quests across all 5 pillars (healthy, creative, growth, peace, social)
                — ordered by difficulty, with easier quests on weekdays and bigger adventures on weekends.
              </p>
              <Button size="lg" onClick={generatePlan}>
                <Sparkles size={16} /> Generate My Week
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 size={32} className="text-ember animate-spin" />
              <p className="text-mist text-sm">Claude is planning your perfect week…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <Button variant="secondary" onClick={generatePlan}>Try Again</Button>
            </div>
          )}

          {plan && (
            <div className="space-y-4">
              {summary && (
                <div className="glass rounded-xl p-4 text-sm text-mist leading-relaxed border-l-2 border-amber-400/50">
                  <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider block mb-1">Claude's Plan</span>
                  {summary}
                </div>
              )}

              {plan.map(({ day, quest, reason }, i) => (
                <div key={day} className="flex items-start gap-3 p-4 rounded-xl"
                     style={{ background: 'rgba(74,32,96,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {/* Day indicator */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-xs text-ash uppercase tracking-wide">{DAY_SHORT[i]}</div>
                    <div className="text-lg font-black text-white">{i + 1}</div>
                  </div>

                  {quest ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-lg">{CATEGORY_ICONS[quest.category as keyof typeof CATEGORY_ICONS]}</span>
                        <span className="text-sm font-bold text-white truncate">{quest.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                              style={{ background: `${TIER_COLORS[quest.tier]}20`, color: TIER_COLORS[quest.tier] }}>
                          {quest.tier}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ash mb-1.5">
                        <span className="flex items-center gap-1"><Zap size={10} style={{ color: '#F5A623' }} />{quest.xp_reward} XP</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{formatDuration(quest.duration_minutes)}</span>
                      </div>
                      {reason && <p className="text-xs text-mist italic">{reason}</p>}
                    </div>
                  ) : (
                    <p className="text-ash text-sm italic">Rest day</p>
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" fullWidth onClick={() => { setPlan(null); setSummary('') }}>
                  Regenerate
                </Button>
                <Button fullWidth onClick={onClose}>
                  Save Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
