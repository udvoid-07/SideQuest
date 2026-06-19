'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, X } from 'lucide-react'

export const TOUR_KEY = 'sq:tour:seen'

const TW_MAX   = 320   // max tooltip width — will shrink on narrow screens
const PAD      = 10    // spotlight padding around target
const TIP_H    = 250   // conservative estimated tooltip height for space checks
const MOB_NAV  = 76    // mobile bottom nav height (px)

interface Step {
  id       : string
  title    : string
  desc     : string
  target   : string | null
  position?: 'top' | 'bottom' | 'right' | 'left'
}

const STEPS: Step[] = [
  {
    id    : 'welcome',
    title : 'Welcome to SideQuest 🎮',
    desc  : 'Your real-life RPG. This 60-second tour walks you through every feature so you know exactly where to go.',
    target: null,
  },
  {
    id      : 'stats',
    title   : 'Your Stats',
    desc    : 'Track your Level, XP, and daily streak. Complete quests to earn XP and level up — from "The Curious" all the way to "The Legend".',
    target  : 'stats',
    position: 'bottom',
  },
  {
    id      : 'today-quest',
    title   : "Today's Quest 🎯",
    desc    : 'Every day the app auto-assigns a quest matched to your personality, fitness, and budget. Hit Start when you\'re ready to head out.',
    target  : 'today-quest',
    position: 'bottom',
  },
  {
    id      : 'active-timer',
    title   : 'The Quest Timer ⏱️',
    desc    : 'Once started, a timer locks in. Stay out for the full duration — the app only unlocks when the timer ends. That\'s what makes it real.',
    target  : 'active-timer',
    position: 'bottom',
  },
  {
    id      : 'explore',
    title   : 'Explore Quests ✨',
    desc    : 'Smart suggestions picked to push your comfort zone. Accept, decline, or bookmark them — the algorithm gets sharper every time you interact.',
    target  : 'explore',
    position: 'top',
  },
  {
    id      : 'sidebar-quests',
    title   : 'Quest Explorer 🗺️',
    desc    : 'Browse every available quest, filter by category, and bookmark ones you want to try later. Your bookmarks show up in the queue on your dashboard.',
    target  : 'sidebar-quests',
    position: 'right',   // becomes 'top' on mobile automatically
  },
  {
    id      : 'sidebar-profile',
    title   : 'Your Profile 👤',
    desc    : 'Update your personality, fitness, and budget preferences, view your badges, and replay this tour any time from the Help section.',
    target  : 'sidebar-profile',
    position: 'right',   // becomes 'top' on mobile automatically
  },
  {
    id    : 'done',
    title : "You\'re all set 🚀",
    desc  : 'Start today\'s quest and earn your first XP. Every quest is a story worth telling.',
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

function isMobile() {
  return window.innerWidth < 768
}

function tooltipPos(rect: Rect | null, pos: Step['position']): React.CSSProperties {
  const vw      = window.innerWidth
  const vh      = window.innerHeight
  const mob     = isMobile()
  const tw      = Math.min(TW_MAX, vw - 32)        // responsive width
  const bottomH = mob ? MOB_NAV : 0                 // clearance for mobile nav
  const gap     = 12

  // Centered modal for null-target steps
  if (!rect) {
    return {
      position : 'fixed',
      top      : mob ? '44%' : '50%',
      left     : '50%',
      transform: 'translate(-50%, -50%)',
      width    : tw,
    }
  }

  // On mobile, right/left positions don't make sense → use vertical
  let resolvedPos: Step['position'] = pos ?? 'bottom'
  if (mob && (resolvedPos === 'right' || resolvedPos === 'left')) {
    resolvedPos = 'bottom'
  }

  // Smart flip: if there isn't enough room in the preferred direction, flip
  if (resolvedPos === 'bottom') {
    const spaceBelow = vh - (rect.top + rect.height + PAD + gap) - bottomH
    if (spaceBelow < TIP_H + 16) resolvedPos = 'top'
  }
  if (resolvedPos === 'top') {
    const spaceAbove = rect.top - PAD - gap
    if (spaceAbove < TIP_H + 16) resolvedPos = 'bottom'  // fall back to below
  }

  let top  = 0
  let left = 0

  if (resolvedPos === 'bottom') {
    top  = rect.top  + rect.height + PAD + gap
    left = rect.left + rect.width  / 2 - tw / 2
  } else if (resolvedPos === 'top') {
    top  = rect.top  - PAD - gap - TIP_H
    left = rect.left + rect.width  / 2 - tw / 2
  } else if (resolvedPos === 'right') {
    top  = rect.top  + rect.height / 2 - 100
    left = rect.left + rect.width  + PAD + gap
  } else {
    top  = rect.top  + rect.height / 2 - 100
    left = rect.left - tw - PAD - gap
  }

  // Clamp to viewport, respecting mobile nav at the bottom
  left = Math.max(16, Math.min(left, vw - tw - 16))
  top  = Math.max(16, Math.min(top,  vh - TIP_H - bottomH - 16))

  return { position: 'fixed', top, left, width: tw }
}

interface Props { onDone: () => void }

export function GuidedTour({ onDone }: Props) {
  const [step,     setStep]     = useState(0)
  const [rect,     setRect]     = useState<Rect | null>(null)
  const [dontShow, setDontShow] = useState(true)

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

  // Skip steps whose target isn't in the DOM
  const resolveStep = useCallback((idx: number, dir: 1 | -1): number => {
    let i = idx
    while (i >= 0 && i < STEPS.length) {
      const s = STEPS[i]
      if (!s.target) return i
      if (document.querySelector(`[data-tour="${s.target}"]`)) return i
      i += dir
    }
    return dir === 1 ? STEPS.length - 1 : 0
  }, [])

  const updateRect = useCallback(() => {
    setRect(getTargetRect(current.target))
  }, [current.target])

  // Scroll target into view, then measure its rect
  useEffect(() => {
    if (current.target) {
      const el = document.querySelector(`[data-tour="${current.target}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        // Wait for scroll to settle before measuring
        const t = setTimeout(updateRect, 380)
        return () => clearTimeout(t)
      }
    }
    updateRect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Re-measure on resize / scroll
  useEffect(() => {
    window.addEventListener('resize',  updateRect)
    window.addEventListener('scroll',  updateRect, true)
    return () => {
      window.removeEventListener('resize',  updateRect)
      window.removeEventListener('scroll',  updateRect, true)
    }
  }, [updateRect])

  function next() {
    if (isLast) {
      if (dontShow) localStorage.setItem(TOUR_KEY, '1')
      onDone()
    } else {
      setStep(s => resolveStep(s + 1, 1))
    }
  }

  function prev() {
    if (!isFirst) setStep(s => resolveStep(s - 1, -1))
  }

  function skip() {
    localStorage.setItem(TOUR_KEY, '1')
    onDone()
  }

  // Spotlight styles
  const showSpotlight = !!rect
  const spotlightStyle: React.CSSProperties = showSpotlight
    ? {
        position     : 'fixed',
        top          : rect!.top  - PAD,
        left         : rect!.left - PAD,
        width        : rect!.width  + PAD * 2,
        height       : rect!.height + PAD * 2,
        borderRadius : 14,
        boxShadow    : [
          '0 0 0 4000px rgba(0,0,0,0.80)',
          '0 0 0 2px rgba(232,102,61,0.80)',
          '0 0 24px rgba(232,102,61,0.40)',
        ].join(', '),
        zIndex       : 9998,
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
        {/* Click-to-skip backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: showSpotlight ? 'transparent' : 'rgba(0,0,0,0.80)' }}
          onClick={skip}
        />

        {/* Spotlight ring */}
        <AnimatePresence mode="wait">
          {showSpotlight && (
            <motion.div
              key={current.id + '-spot'}
              style={spotlightStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            />
          )}
        </AnimatePresence>

        {/* Tooltip card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + '-tip'}
            style={{ ...tooltipPos(rect, current.position), zIndex: 9999 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background    : 'rgba(15,8,4,0.98)',
                border        : '1px solid rgba(232,102,61,0.28)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Progress bar */}
              <div className="flex gap-1 px-4 pt-4">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      flex      : i === step ? 2 : 1,
                      background: i <= step
                        ? 'linear-gradient(90deg, #E8663D, #F4A261)'
                        : 'rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </div>

              {/* Body */}
              <div className="px-4 pt-3 pb-4">
                {/* Label row */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] text-ash font-semibold uppercase tracking-widest">
                    {step === 0 ? 'Quick tour' : step === STEPS.length - 1 ? 'All done' : `Step ${step} of ${STEPS.length - 2}`}
                  </span>
                  <button
                    onClick={skip}
                    className="p-1 rounded-lg text-ash hover:text-white hover:bg-white/8 transition-all"
                    aria-label="Skip tour"
                  >
                    <X size={13} />
                  </button>
                </div>

                <h3 className="text-[15px] font-bold text-white mb-1.5 leading-snug">
                  {current.title}
                </h3>
                <p className="text-[12.5px] text-mist leading-relaxed">
                  {current.desc}
                </p>

                {/* Don't show again — last step only */}
                {isLast && (
                  <label className="flex items-center gap-2.5 mt-3.5 cursor-pointer group select-none">
                    <div
                      role="checkbox"
                      aria-checked={dontShow}
                      onClick={() => setDontShow(d => !d)}
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: dontShow ? '#E8663D' : 'transparent',
                        border    : dontShow ? '2px solid #E8663D' : '2px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      {dontShow && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[11.5px] text-ash group-hover:text-mist transition-colors">
                      Don&apos;t show this again
                    </span>
                  </label>
                )}

                {/* Nav buttons */}
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white transition-all active:scale-95"
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
