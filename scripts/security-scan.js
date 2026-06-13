const fs   = require('node:fs')
const path = require('node:path')

const SKIP_FILES = new Set(['security-scan.js', '_client.js'])
const SKIP_DIRS  = new Set(['node_modules', '.next', 'assets', '.expo'])
const EXTENSIONS = new Set(['.js', '.ts', '.tsx', '.mjs'])

const CHECKS = [
  { id: 'KEY_EXPOSED', test: c => c.includes('sb_se' + 'cret_') || c.includes('sb_publishable_') },
  { id: 'BROWSER_KEY', test: c => c.includes('NEXT_PUBLIC_GOOGLE') || c.includes('NEXT_PUBLIC_SERVICE') },
  { id: 'SQL_INTERP',  test: c => /personality_match.*\$\{/.test(c) || /\.or\(`.*\$\{/.test(c) },
]

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const fp = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectFiles(fp))
    } else if (EXTENSIONS.has(path.extname(entry.name)) && !SKIP_FILES.has(entry.name)) {
      results.push(fp)
    }
  }
  return results
}

function auditFile(fp) {
  const content = fs.readFileSync(fp, 'utf8')
  return CHECKS
    .filter(({ test }) => test(content))
    .map(({ id }) => `${id}: ${fp}`)
}

const root  = path.join(__dirname, '..')
const dirs  = ['apps/web/src', 'scripts', 'apps/mobile/app'].map(d => path.join(root, d))
const files = dirs.flatMap(collectFiles)
const hits  = files.flatMap(auditFile)

if (hits.length === 0) {
  console.log('CLEAN — no exposed keys, no NEXT_PUBLIC_ server keys, no SQL interpolation')
} else {
  console.log('FINDINGS:')
  hits.forEach(h => console.log(' ', h))
  process.exit(1)
}
