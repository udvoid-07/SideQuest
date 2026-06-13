'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, Sparkles, Brain, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { QuestBrowserCard } from './QuestBrowserCard'
import { CATEGORY_ICONS, TIER_LABELS } from '@sidequest/core'
import type { Quest } from '@sidequest/core'
import type { CategoryStats } from '@/lib/quest-scoring'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  ...Object.entries(CATEGORY_ICONS).map(([value, icon]) => ({
    value,
    label: `${icon} ${value.charAt(0).toUpperCase() + value.slice(1)}`,
  })),
]

const TIERS = [
  { value: 'all', label: 'All Tiers' },
  ...Object.entries(TIER_LABELS).map(([value, label]) => ({
    value, label: `${value} · ${label}`,
  })),
]

interface QuestBrowserProps {
  readonly quests: Quest[]
  readonly userCity?: string
  readonly categoryStats: CategoryStats
  readonly totalCompleted: number
  readonly declinedIds: string[]
  readonly interestedIds: string[]
  readonly userBudgetTier?: number
  readonly userFitnessLevel?: number
}

export function QuestBrowser({
  quests, userCity = '', categoryStats, totalCompleted,
  declinedIds, interestedIds, userBudgetTier = 4, userFitnessLevel = 5,
}: QuestBrowserProps) {
  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('all')
  const [tier, setTier]               = useState('all')
  const [showDeclined, setShowDeclined] = useState(false)
  const [semanticMode, setSemanticMode] = useState(false)
  const [semanticResults, setSemanticResults] = useState<Quest[]>([])
  const [semanticLoading, setSemanticLoading] = useState(false)
  const semanticDebounce = useRef<ReturnType<typeof setTimeout>>()

  // Semantic search — debounced, fires when semanticMode is on and search has 3+ chars
  useEffect(() => {
    if (!semanticMode || search.length < 3) { setSemanticResults([]); return }
    clearTimeout(semanticDebounce.current)
    setSemanticLoading(true)
    semanticDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ai/search?q=${encodeURIComponent(search)}`)
        const data = await res.json()
        setSemanticResults(data.quests ?? [])
      } catch { setSemanticResults([]) }
      finally { setSemanticLoading(false) }
    }, 500)
    return () => clearTimeout(semanticDebounce.current)
  }, [search, semanticMode])

  const filtered = useMemo(() => {
    // In semantic mode with results: show semantic results directly
    if (semanticMode && semanticResults.length > 0) return semanticResults

    const base = showDeclined
      ? quests
      : quests.filter(q => !declinedIds.includes(q.id))

    return base.filter(q => {
      const matchSearch = search.length === 0 || q.title.toLowerCase().includes(search.toLowerCase())
      const matchCat    = category === 'all' || q.category === category
      const matchTier   = tier === 'all' || q.tier === tier
      return matchSearch && matchCat && matchTier
    })
  }, [quests, search, category, tier, showDeclined, declinedIds, semanticMode, semanticResults])

  const declinedCount = quests.filter(q => declinedIds.includes(q.id)).length

  return (
    <div>
      {/* Hint */}
      <div className="flex items-start gap-3 p-4 rounded-xl mb-6 border border-amber-500/20 bg-amber-500/8">
        <Sparkles size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-mist leading-relaxed">
          Quests marked with <span className="text-amber-300 font-semibold">✨ bonus XP</span> are
          outside your comfort zone — the algorithm rewards you more for trying something new.
          Hit <span className="text-emerald-400 font-semibold">I&apos;m Interested</span> to add it
          to your dashboard, or <span className="text-red-400 font-semibold">Decline</span> to
          see fewer like it.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <Input
              placeholder={semanticMode ? 'Describe what you want to experience…' : 'Search quests…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={semanticLoading ? <Loader2 size={15} className="animate-spin text-amber-400" /> : <Search size={15} />}
            />
          </div>
          <button
            onClick={() => { setSemanticMode(v => !v); setSemanticResults([]) }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 h-11 rounded-xl text-xs font-semibold border transition-all ${
              semanticMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-void-800/50 border-white/10 text-ash hover:border-white/20'
            }`}
            title={semanticMode ? 'Using AI semantic search' : 'Switch to AI semantic search'}
          >
            <Brain size={14} />
            {semanticMode ? 'AI' : 'AI'}
          </button>
        </div>
        {semanticMode && (
          <p className="text-[11px] text-amber-400/80 flex items-center gap-1.5">
            <Sparkles size={10} />
            AI semantic search — describe your mood, goal, or vibe. Powered by Voyage AI + pgvector.
          </p>
        )}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                ${category === c.value
                  ? 'bg-ember/15 border-ember/50 text-ember'
                  : 'bg-void-800/50 border-white/10 text-ash hover:border-white/20 hover:text-white'
                }`}
            >{c.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TIERS.map(t => (
            <button key={t.value} onClick={() => setTier(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                ${tier === t.value
                  ? 'bg-ember/15 border-ember/50 text-ember'
                  : 'bg-void-800/50 border-white/10 text-ash hover:border-white/20 hover:text-white'
                }`}
            >{t.label}</button>
          ))}
          {declinedCount > 0 && (
            <button
              onClick={() => setShowDeclined(v => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ml-auto
                ${showDeclined
                  ? 'bg-red-500/15 border-red-500/40 text-red-400'
                  : 'bg-void-800/50 border-white/10 text-ash hover:border-white/20'
                }`}
            >
              {showDeclined ? 'Hide' : 'Show'} {declinedCount} declined
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-ash mb-4">{filtered.length} quest{filtered.length !== 1 ? 's' : ''} available</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(q => (
          <QuestBrowserCard
            key={q.id}
            quest={q}
            categoryStats={categoryStats}
            totalCompleted={totalCompleted}
            userCity={userCity}
            isInterested={interestedIds.includes(q.id)}
            isDeclined={declinedIds.includes(q.id)}
            userBudgetTier={userBudgetTier}
            userFitnessLevel={userFitnessLevel}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-mist">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">No quests match your filters.</p>
            <p className="text-ash text-sm mt-1">Try adjusting the filters above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
