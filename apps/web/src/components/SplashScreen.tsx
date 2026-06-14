'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Phase = 'hidden' | 'arrive' | 'hold' | 'logo' | 'zoom' | 'gone'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [phase, setPhase]     = useState<Phase>('hidden')
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('sq:splash')) { setVisible(false); return }
    document.fonts.load('900 1em Cinzel').finally(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    if (!fontsReady) return
    const t0 = setTimeout(() => setPhase('arrive'), 60)
    const t1 = setTimeout(() => setPhase('hold'),   1400)
    const t2 = setTimeout(() => setPhase('logo'),   2600)  // Earth → Logo crossfade
    const t3 = setTimeout(() => setPhase('zoom'),   3500)  // Fly into the golden path
    const t4 = setTimeout(() => setPhase('gone'),   4700)
    const t5 = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('sq:splash', '1')
    }, 5100)
    return () => [t0, t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [fontsReady])

  if (!visible) return null

  // ── Scale ─────────────────────────────────────────────────────────
  const containerScale =
    phase === 'hidden' || phase === 'arrive' ? 0.22 :
    phase === 'hold'   ? 0.95 :
    phase === 'logo'   ? 1.0  :
    phase === 'zoom'   ? 8.0  : 8.0

  const containerTransition =
    phase === 'hold' ? { duration: 1.15, ease: [0.4, 0, 0.2, 1] } :
    phase === 'logo' ? { duration: 0.7,  ease: [0.4, 0, 0.2, 1] } :
    phase === 'zoom' ? { duration: 1.25, ease: [0.55, 0, 1, 0.45] } :
                       { duration: 0.3,  ease: 'easeIn' }

  // ── Earth visibility ───────────────────────────────────────────────
  const earthOpacity =
    phase === 'logo' || phase === 'zoom' || phase === 'gone' ? 0 : 1

  // ── Logo visibility ────────────────────────────────────────────────
  const logoOpacity =
    phase === 'logo' || phase === 'zoom' || phase === 'gone' ? 1 : 0

  // ── "SideQuest" text below the globe/logo ─────────────────────────
  const textOpacity =
    phase === 'hold' || phase === 'logo' ? 1 : 0

  // ── Golden "tunnel" overlay that appears during zoom ───────────────
  const goldenOpacity = phase === 'zoom' || phase === 'gone' ? 1 : 0

  // ── Outer splash opacity (final fade) ─────────────────────────────
  const splashOpacity = phase === 'gone' ? 0 : 1

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{ background: '#02060f' }}
        animate={{ opacity: splashOpacity }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, background: 'white', opacity: s.o }}
            />
          ))}
        </div>

        {/* Main scaled container */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale: containerScale, y: phase === 'hold' ? -6 : 0 }}
          transition={containerTransition}
        >
          {/* ── Earth (visible during arrive/hold) ── */}
          <motion.div
            animate={{ opacity: earthOpacity }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{ position: 'absolute' }}
          >
            <div
              style={{
                width: 320, height: 320,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 32%, #4ecbf5 0%, #2196cc 18%, #1565a8 38%, #0c3d7a 58%, #051d3a 78%, #020d1a 100%)',
                boxShadow: `
                  inset -50px -35px 90px rgba(0,5,40,0.92),
                  inset 20px 15px 50px rgba(100,200,255,0.12),
                  0 0 90px rgba(70,160,255,0.22),
                  0 0 180px rgba(50,120,220,0.1)
                `,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {/* Continents SVG */}
              <svg viewBox="0 0 320 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <ellipse cx="215" cy="130" rx="58" ry="40" fill="rgba(48,110,54,0.72)" transform="rotate(-10 215 130)" />
                <ellipse cx="200" cy="158" rx="22" ry="30" fill="rgba(50,118,52,0.65)" />
                <ellipse cx="168" cy="100" rx="22" ry="18" fill="rgba(55,115,50,0.68)" />
                <ellipse cx="175" cy="188" rx="32" ry="48" fill="rgba(58,125,48,0.72)" />
                <ellipse cx="72"  cy="120" rx="42" ry="52" fill="rgba(52,112,52,0.68)" transform="rotate(8 72 120)" />
                <ellipse cx="95"  cy="215" rx="28" ry="45" fill="rgba(50,118,52,0.65)" />
                <ellipse cx="265" cy="220" rx="28" ry="20" fill="rgba(60,125,48,0.62)" />
                <ellipse cx="130" cy="68"  rx="18" ry="12" fill="rgba(220,235,255,0.45)" />
                <ellipse cx="160" cy="295" rx="80" ry="22" fill="rgba(230,240,255,0.35)" />
              </svg>
              {/* Cloud layer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `
                  radial-gradient(ellipse 75% 18% at 42% 28%, rgba(255,255,255,0.18) 0%, transparent 70%),
                  radial-gradient(ellipse 55% 14% at 72% 52%, rgba(255,255,255,0.13) 0%, transparent 70%),
                  radial-gradient(ellipse 40% 10% at 25% 65%, rgba(255,255,255,0.10) 0%, transparent 70%)
                `,
              }} />
              {/* Night side */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 62% 58%, transparent 38%, rgba(0,8,30,0.55) 62%, rgba(0,5,20,0.82) 100%)' }} />
              {/* City lights */}
              <svg viewBox="0 0 320 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                {CITY_LIGHTS.map((c, i) => (
                  <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={`rgba(255,220,100,${c.o})`} />
                ))}
              </svg>
            </div>
          </motion.div>

          {/* ── SideQuest Logo (visible during logo/zoom phases) ── */}
          <motion.div
            animate={{ opacity: logoOpacity }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
            style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Outer atmospheric halo (golden glow) */}
            <div
              style={{
                position: 'absolute',
                width: 380, height: 380,
                background: 'radial-gradient(circle, transparent 38%, rgba(245,166,35,0.10) 50%, rgba(200,120,10,0.06) 62%, transparent 75%)',
              }}
            />
            <svg
              width="300"
              height="345"
              viewBox="0 0 100 115"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Pin outline */}
              <path
                d="M50 5 C27 5 9 23 9 45 C9 68 50 110 50 110 C50 110 91 68 91 45 C91 23 73 5 50 5 Z"
                fill="rgba(255,255,255,0.07)"
                stroke="rgba(255,255,255,0.90)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Inner hollow ring */}
              <circle cx="50" cy="42" r="13" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.40)" strokeWidth="2" />
              {/* Green terrain — back */}
              <polygon points="19,80 31,60 40,70 28,87" fill="#2E7D32" opacity="0.82" />
              {/* Green terrain — front */}
              <polygon points="23,74 37,51 47,64 33,80" fill="#43A047" />
              {/* Golden quest path */}
              <polyline
                points="42,83 55,63 43,50 62,36 74,27"
                fill="none"
                stroke="#F5A623"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Flag pole */}
              <line x1="74" y1="27" x2="74" y2="15" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
              {/* Flag */}
              <polygon points="74,15 87,20 74,25" fill="#F5A623" />
              {/* Start dot */}
              <circle cx="42" cy="83" r="4" fill="#F5A623" />
            </svg>
          </motion.div>

          {/* ── "SideQuest" text floats above both Earth and Logo ── */}
          <motion.div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            animate={{ opacity: textOpacity }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontWeight: 900,
                fontSize: '3.8rem',
                letterSpacing: '0.18em',
                color: 'rgba(255, 240, 210, 0.92)',
                textShadow: '0 0 28px rgba(245,166,35,0.55), 0 0 65px rgba(200,130,20,0.3), 0 2px 10px rgba(0,0,0,0.85)',
                textTransform: 'uppercase',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              SideQuest
            </h1>
            <p
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontWeight: 700,
                fontSize: '0.58rem',
                letterSpacing: '0.45em',
                color: 'rgba(245,166,35,0.65)',
                textTransform: 'uppercase',
                marginTop: '1rem',
              }}
            >
              Real Life · Levelled Up
            </p>
          </motion.div>
        </motion.div>

        {/* ── Golden path tunnel overlay ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: goldenOpacity }}
          transition={{ duration: 0.8, ease: 'easeIn', delay: 0.5 }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,166,35,0.45) 0%, rgba(180,90,10,0.75) 55%, rgba(80,30,0,0.95) 100%)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

const STARS = Array.from({ length: 180 }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 97.333)  % 100),
  r: i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2,
  o: 0.3 + (i % 5) * 0.14,
}))

const CITY_LIGHTS = [
  { x: 245, y: 148, r: 1.2, o: 0.7 },
  { x: 222, y: 168, r: 1.0, o: 0.6 },
  { x: 178, y: 108, r: 1.4, o: 0.75 },
  { x: 185, y: 112, r: 1.0, o: 0.6 },
  { x: 110, y: 108, r: 1.5, o: 0.7 },
  { x: 98,  y: 120, r: 1.0, o: 0.55 },
  { x: 75,  y: 128, r: 1.2, o: 0.65 },
  { x: 195, y: 115, r: 0.8, o: 0.5 },
  { x: 202, y: 142, r: 1.0, o: 0.55 },
  { x: 258, y: 162, r: 0.9, o: 0.5 },
]
