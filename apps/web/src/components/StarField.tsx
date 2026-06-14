'use client'
import { useEffect, useRef } from 'react'

interface Star { x: number; y: number; r: number; o: number; twinkleSpeed: number }
interface Comet { x: number; y: number; vx: number; vy: number; len: number; life: number; maxLife: number; active: boolean }

const NUM_STARS   = 220
const NUM_COMETS  = 3
const COMET_EVERY = 60_000  // 1 minute

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let tick = 0

    // Size canvas to full window
    function resize() {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Static stars
    const stars: Star[] = Array.from({ length: NUM_STARS }, () => ({
      x:            Math.random() * canvas.width,
      y:            Math.random() * canvas.height,
      r:            Math.random() * 1.4 + 0.4,
      o:            Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.018 + 0.006,
    }))

    // Comets/shooting stars
    const comets: Comet[] = Array.from({ length: NUM_COMETS }, () => makeComet(canvas))
    // Only first comet active at start; rest wait
    comets.forEach((c, i) => { c.active = i === 0 })

    function makeComet(cv: HTMLCanvasElement): Comet {
      const angle  = (Math.random() * 30 + 20) * (Math.PI / 180)  // 20–50° diagonal
      const speed  = Math.random() * 12 + 8
      const maxLife = Math.random() * 80 + 60
      return {
        x:       Math.random() * cv.width  * 0.7,
        y:       Math.random() * cv.height * 0.4,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed,
        len:     Math.random() * 140 + 80,
        life:    0,
        maxLife,
        active:  false,
      }
    }

    let lastCometTime = Date.now()
    let cometQueue    = 0  // how many comets are queued to fire

    // Every COMET_EVERY ms, queue a burst of 1-2 comets
    const cometTimer = setInterval(() => {
      cometQueue += Math.random() < 0.4 ? 2 : 1
    }, COMET_EVERY)

    // Fire a queued comet with a random short delay
    let fireDelay = 0
    function maybeFireComet() {
      if (cometQueue <= 0) return
      if (fireDelay > 0) { fireDelay--; return }
      const dead = comets.find(c => !c.active)
      if (dead) {
        Object.assign(dead, makeComet(canvas!), { active: true })
        cometQueue--
        fireDelay = Math.floor(Math.random() * 40 + 20)  // stagger next one
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars with gentle twinkle
      for (const s of stars) {
        const twinkle = Math.sin(tick * s.twinkleSpeed) * 0.25
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 240, 220, ${Math.max(0.05, s.o + twinkle)})`
        ctx.fill()
      }

      // Draw comets
      maybeFireComet()
      for (const c of comets) {
        if (!c.active) continue
        const progress = c.life / c.maxLife
        const alpha    = progress < 0.15 ? progress / 0.15 :
                         progress > 0.75 ? (1 - progress) / 0.25 : 1

        // Comet head glow
        const headX = c.x + c.vx * c.life
        const headY = c.y + c.vy * c.life

        // Tail gradient
        const tailX = headX - (c.vx / Math.hypot(c.vx, c.vy)) * c.len
        const tailY = headY - (c.vy / Math.hypot(c.vx, c.vy)) * c.len

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
        grad.addColorStop(0,   `rgba(255, 240, 210, 0)`)
        grad.addColorStop(0.6, `rgba(255, 245, 220, ${alpha * 0.35})`)
        grad.addColorStop(1,   `rgba(255, 255, 240, ${alpha * 0.9})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.strokeStyle = grad
        ctx.lineWidth   = 1.8
        ctx.stroke()

        // Head glow
        const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 5)
        glow.addColorStop(0,   `rgba(255, 255, 230, ${alpha * 0.9})`)
        glow.addColorStop(0.5, `rgba(255, 240, 200, ${alpha * 0.4})`)
        glow.addColorStop(1,   'rgba(255,240,200,0)')
        ctx.beginPath()
        ctx.arc(headX, headY, 5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        c.life++
        if (c.life >= c.maxLife) c.active = false
      }

      tick++
      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(cometTimer)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.75 }}
      aria-hidden
    />
  )
}
