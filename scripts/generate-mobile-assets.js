/**
 * Generates minimal placeholder PNG assets for the Expo app.
 * Run: node scripts/generate-mobile-assets.js
 * Then replace with real branded assets before App Store submission.
 */
const fs   = require('fs')
const path = require('path')

// Minimal valid 1x1 purple PNG (raw bytes)
function makePng(width, height, r, g, b) {
  const { createCanvas } = (() => {
    try { return require('canvas') }
    catch { return null }
  })() ?? {}

  if (!createCanvas) {
    // Fallback: write a tiny hardcoded 1x1 PNG if canvas not available
    // Real 1x1 purple pixel PNG (base64)
    const purplePng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    return purplePng
  }

  const canvas = createCanvas(width, height)
  const ctx    = canvas.getContext('2d')
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, width, height)

  // Draw a simple compass symbol
  ctx.strokeStyle = '#f15153'
  ctx.lineWidth   = Math.max(2, width / 50)
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, width * 0.35, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#f15153'
  ctx.beginPath()
  ctx.moveTo(width / 2, height / 2 - width * 0.25)
  ctx.lineTo(width / 2 + width * 0.1, height / 2 + width * 0.1)
  ctx.lineTo(width / 2 - width * 0.1, height / 2 + width * 0.1)
  ctx.closePath()
  ctx.fill()

  return canvas.toBuffer('image/png')
}

const assetsDir = path.join(__dirname, '../apps/mobile/assets')
fs.mkdirSync(assetsDir, { recursive: true })

const assets = [
  { name: 'icon.png',           w: 1024, h: 1024 },
  { name: 'adaptive-icon.png',  w: 1024, h: 1024 },
  { name: 'splash.png',         w: 1284, h: 2778 },
  { name: 'favicon.png',        w: 48,   h: 48   },
  { name: 'notification-icon.png', w: 96, h: 96  },
]

// Solid purple PNG via raw bytes (no canvas dependency)
const PURPLE_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQ' +
  'AABjkB6QAAAABJRU5ErkJggg==',
  'base64'
)

assets.forEach(({ name }) => {
  const dest = path.join(assetsDir, name)
  if (fs.existsSync(dest)) {
    console.log(`  skip  ${name} (already exists)`)
    return
  }
  fs.writeFileSync(dest, PURPLE_PIXEL)
  console.log(`  ✓  ${name} (placeholder — replace before App Store submission)`)
})

console.log('\nDone. Replace placeholder PNGs with real branded assets before publishing.')
console.log('Recommended tools: Figma, Adobe Express, or https://expo.dev/tools')
