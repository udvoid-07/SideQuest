'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, X, MapPin } from 'lucide-react'

const TOUR_KEY = 'sq:tour:seen'
const PAD      = 10   // spotlight padding around target element
const TW       = 320  // tooltip width in px

interface Step {
  id       : string
  title    : string
  desc     : string
  target   : string | null          // data-tour attribute value
  position?: 'top' | 'bottom' | 'right' | 'left'
}

const STEPS: Step[] = [
  {
    id    : 'welcome',
    title : 'Welcome to SideQuest 🎮',
    desc  : 'You\'re about to turn your everyday life into an adventure. This 60-second tour will walk you through how everything works.',
    target: null,
  },
  {
    id      : 'stats',
    title   : 'Your Stats',
    desc    : 'Track your Level, XP earned, and daily streak here. Complete quests to level up — from "The Curious" all the way to "The Legend".',
    target  : 'stats',
    position: 'bottom',
  },
  {
    id      : 'today-quest',
    title   : "Today's Quest 🎯",
    desc    : 'Every day the app auto-assigns a quest tailored to your personality, fitness, and budget. Hit Start when you\'re ready to head out.',
    target  : 'today-quest',
    position: 'bottom',
  },
  {
    id      : 'active-timer',
    title   : 'The Quest Timer ⏱️',
    desc    : 'Once you start, a timer locks in. You need to be out there for the full duration — it\'s what makes this real. The app unlocks only when the timer ends.',
    target  : 'active-timer',
    position: 'bottom',
  },
  {
    id      : 'explore',
    title   : 'Explore Quests ✨',
    desc    : 'Smart suggestions the algorithm picks to push you out of your comfort zone. Accept, decline, or bookmark them — the algorithm gets sharper the more you interact.',
    target  : 'explore',
    position: 'top',
  },
  {
    id      : 'sidebar-quests',
    title   : 'Quest Explorer 🗺️',
    desc    : 'Browse every available quest, filter by category, and bookmark the ones you want to try. Your bookmarks appear in the queue on your dashboard.',
    target  : 'sidebar-quests',
    position: 'right',
  },
  {
    id      : 'sidebar-profile',
    title   : 'Your Profile 👤',
    desc    : 'Update your personality, fitness, and budget preferences, view your badges, and track how far you\'ve come.',
    target  : 'sidebar-profile',
    position: 'right',
  },
  {
    id    : 'done',
    title : "You're all set 🚀",
    desc  : 'Start today\'s quest and earn your first XP. Every quest you complete is a story worth telling.',
    target: null,
  },
]

interface Rect { top: number; left: number; width: number; height: number }

function getTargetRect(target: string | null): Rect | null {
  if (!target) return null
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function tooltipPos(rect: Rect | null, pos: Step['position']): React.CSSProperties {
  if (!rect) {
    return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: TW }
  }
  const vw  = window.innerWidth
  const vh  = window.innerHeight
  const gap = 16
  let top  = 0
  let left = 0

  if (pos === 'bottom') {
    top  = rect.top  + rect.height + PAD + gap
    left = rect.left + rect.width  / 2 - TW / 2
  } else if (pos === 'top') {
    top  = rect.top - PAD - gap - 210  // estimated tooltip height
    left = rect.left + rect.width / 2  - TW / 2
  } else if (pos === 'right') {
    top  = rect.top  + rect.height / 2 - 100
    left = rect.left + rect.width + PAD + gap
  } else {
    top  = rect.top  + rect.height / 2 - 100
    left = rect.left - TW - PAD - gap
  }

  // clamp to viewport
  left = Math.max(16, Math.min(left, vw - TW - 16))
  top  = Math.max(16, Math.min(top, vh - 260))

  return { position: 'fixed', top, left, width: TW }
}

interface Props { onDone: () => void }

export function GuidedTour({ onDone }: Props) {
  const [step,     setStep]     = useState(0)
  const [rect,     setRect]     = useState<Rect | null>(null)
  const [dontShow, setDontShow] = useState(true)

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

  // Skip steps whose target isn't in the DOM (e.g. no active timer)
  const resolveStep = useCallback((idx: number, dir: 1 | -1): number => {
    let i = idx
    while (i >= 0 && i < STEPS.length) {
      const s = STEPS[i]
      if (!s.target) return i                              // null-target steps always show
      if (document.querySelector(`[data-tour="${s.target}"]`)) return i
      i += dir
    }
    return dir === 1 ? STEPS.length - 1 : 0
  }, [])

  const updateRect = useCallback(() => {
    setRect(getTargetRect(current.target))
  }, [current.target])

  useEffect(() => {
    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [updateRect])

  function next() {
    if (isLast) {
      if (dontShow) localStorage.setItem(TOUR_KEY, '1')
      onDone()
    } else {
      const nxt = resolveStep(step + 1, 1)
      setStep(nxt)
    }
  }

  function prev() {
    if (!isFirst) {
      const prv = resolveStep(step - 1, -1)
      setStep(prv)
    }
  }

  function skip() {
    localStorage.setItem(TOUR_KEY, '1')
    onDone()
  }

  const spotlightStyle: React.CSSProperties = rect
    ? {
        position  : 'fixed',
        top       : rect.top  - PAD,
        left      : rect.left - PAD,
        width     : rect.width  + PAD * 2,
        height    : rect.height + PAD * 2,
        borderRadius: 14,
        boxShadow : [
          '0 0 0 4000px rgba(0,0,0,0.78)',
          '0 0 0 2px rgba(232,102,61,0.75)',
          '0 0 22px rgba(232,102,61,0.35)',
        ].join(', '),
        zIndex      : 9998,
        pointerEvents: 'none',
      }
    : {}

  return (
    <AnimatePresence>
      <motion.div
        key="tour-root"
        className="fixed inset-0"
        style={{ zIndex: 9997 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* ── Full-screen click-to-skip overlay ── */}
        <div
          className="absolute inset-0"
          style={{ background: rect ? 'transparent' : 'rgba(0,0,0,0.78)', cursor: 'default' }}
          onClick={skip}
        />

        {/* ── Spotlight (box-shadow trick) ── */}
        <AnimatePresence mode="wait">
          {rect && (
            <motion.div
              key={current.id + '-spot'}
              style={spotlightStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          )}
        </AnimatePresence>

        {/* ── Tooltip card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + '-tip'}
            style={{ ...tooltipPos(rect, current.position), zIndex: 9999 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background  : 'rgba(18,10,6,0.97)',
                border      : '1px solid rgba(232,102,61,0.30)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Progress strip */}
              <div className="flex gap-1 px-5 pt-4">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-400"
                    style={{
                      flex      : i === step ? '2 0 0' : '1 0 0',
                      background: i <= step
                        ? 'linear-gradient(90deg, #E8663D, #F4A261)'
                        : 'rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </div>

              {/* Body */}
              <div className="px-5 pt-3 pb-4">
                {/* Step label + skip */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-ash font-semibold uppercase tracking-widest">
                    {step === 0 ? 'Quick tour' : step === STEPS.length - 1 ? 'All done' : `Step ${step} of ${STEPS.length - 2}`}
                  </span>
                  <button
                    onClick={skip}
                    className="p-1 rounded-lg text-ash hover:text-white hover:bg-white/8 transition-all"
                    title="Skip tour"
                  >
                    <X size={13} />
                  </button>
                </div>

                <h3 className="text-[15px] font-bold text-white mb-2 leading-snug">
                  {current.title}
                </h3>
                <p className="text-[13px] text-mist leading-relaxed">
                  {current.desc}
                </p>

                {/* Don't show again (last step) */}
                {isLast && (
                  <label className="flex items-center gap-2.5 mt-4 cursor-pointer group select-none">
                    <div
                      onClick={() => setDontShow(d => !d)}
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background  : dontShow ? '#E8663D' : 'transparent',
                        border      : dontShow ? '2px solid #E8663D' : '2px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      {dontShow && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[12px] text-ash group-hover:text-mist transition-colors">
                      Don&apos;t show this again
                    </span>
                  </label>
                )}

                {/* Nav */}
                <div className="flex items-center justify-between mt-4 gap-2">
                  <button
                    onClick={prev}
                    disabled={isFirst}
                    className="flex items-center gap-1 text-[12px] font-medium text-ash hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none px-2 py-1.5"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>

                  <button
                    onClick={next}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #E8663D 0%, #F4A261 100%)' }}
                  >
                    {isLast ? 'Start my adventure' : 'Next'}
                    {!isLast && <ArrowRight size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
