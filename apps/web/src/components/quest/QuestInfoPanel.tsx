'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, Shield, Lightbulb, Clock, Coins, Zap, Star, Sparkles, Loader2 } from 'lucide-react'
import type { Quest } from '@sidequest/core'
import { TIER_COLORS, TIER_LABELS, CATEGORY_ICONS, formatCost, formatDuration } from '@sidequest/core'
import { Badge } from '@/components/ui/Badge'
import { NearbyLocations } from './NearbyLocations'

interface QuestInfoPanelProps {
  quest: Quest
  onClose: () => void
  userCity?: string
}

export function QuestInfoPanel({ quest, onClose, userCity = '' }: QuestInfoPanelProps) {
  const tierColor = TIER_COLORS[quest.tier]
  const info = quest.info

  const [aiDesc, setAiDesc]         = useState<string | null>(null)
  const [aiLoading, setAiLoading]   = useState(false)

  useEffect(() => {
    // Lazily fetch a personalized description when the panel opens
    let cancelled = false
    async function fetchPersonalized() {
      setAiLoading(true)
      try {
        const res = await fetch('/api/ai/personalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quest, user: { city: userCity } }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.description) setAiDesc(data.description)
      } catch { /* silent — fallback to original description */ }
      finally { if (!cancelled) setAiLoading(false) }
    }
    if (userCity) fetchPersonalized()
    return () => { cancelled = true }
  }, [quest.id, userCity])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto"
        style={{
          background: 'linear-gradient(160deg, #1e0e2b 0%, #321847 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: 'rgba(30,14,43,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{CATEGORY_ICONS[quest.category]}</span>
            <Badge variant="tier" tier={quest.tier}>
              {quest.tier} · {TIER_LABELS[quest.tier]}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-mist hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-8 pt-4 space-y-6">
          {/* Title + AI-personalized description */}
          <div>
            <h2 className="text-2xl font-bold text-white leading-snug">{quest.title}</h2>
            {aiLoading ? (
              <div className="flex items-center gap-2 mt-2 text-xs text-ash">
                <Loader2 size={12} className="animate-spin text-amber-400" />
                <span>Personalizing for {userCity}…</span>
              </div>
            ) : aiDesc ? (
              <div className="mt-2">
                <p className="text-mist leading-relaxed">{aiDesc}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400/70">
                  <Sparkles size={9} /> AI-personalized for {userCity}
                </div>
              </div>
            ) : (
              <p className="text-mist mt-2 leading-relaxed">{quest.description}</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Zap size={16} />, label: 'XP Reward', value: `${quest.xp_reward} XP`, color: '#F5A623' },
              { icon: <Clock size={16} />, label: 'Duration', value: formatDuration(quest.duration_minutes), color: '#60A5FA' },
              { icon: <Coins size={16} />, label: 'Est. Cost', value: formatCost(quest.cost_min, quest.cost_max), color: '#34D399' },
            ].map(stat => (
              <div key={stat.label}
                className="rounded-xl p-3 flex flex-col gap-1 text-center"
                style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}25` }}
              >
                <span style={{ color: stat.color }} className="mx-auto">{stat.icon}</span>
                <span className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-[10px] text-ash uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Why it's worth it */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-ember font-semibold mb-2">
              <Star size={16} />
              Why This Quest
            </div>
            <p className="text-mist text-sm leading-relaxed">{info.why_its_worth_it}</p>
          </div>

          {/* What to bring */}
          {info.what_to_bring && info.what_to_bring.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <MapPin size={14} className="text-ember" />
                What to Bring
              </h4>
              <ul className="space-y-1.5">
                {info.what_to_bring.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-mist">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety notes */}
          {info.safety_notes && info.safety_notes.length > 0 && (
            <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <Shield size={14} />
                Safety Notes
              </h4>
              <ul className="space-y-1">
                {info.safety_notes.map((note, i) => (
                  <li key={i} className="text-xs text-amber-200/80">{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro tip */}
          {info.pro_tip && (
            <div className="rounded-xl p-4 bg-void-700/50 border border-white/10">
              <div className="flex items-center gap-2 text-gold font-semibold text-sm mb-1">
                <Lightbulb size={14} />
                Pro Tip
              </div>
              <p className="text-sm text-mist">{info.pro_tip}</p>
            </div>
          )}

          {/* Nearby locations — shown for any quest with a search term */}
          {info.nearest_search_term && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-ember" />
                Nearby Places
                {userCity && <span className="text-ash font-normal">in {userCity}</span>}
              </h4>
              <NearbyLocations
                searchQuery={info.nearest_search_term}
                city={userCity}
              />
            </div>
          )}

          {/* Tags */}
          {quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quest.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-void-700 text-ash border border-white/5">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Legal disclaimer */}
          <p className="text-[11px] text-ash text-center leading-relaxed border-t border-white/5 pt-4">
            This quest is a suggestion for entertainment only. Participation is entirely
            voluntary. You are responsible for your own safety and expenses.
            SideQuest complies with all applicable Indian laws.
          </p>
        </div>
      </motion.div>
    </>
  )
}
