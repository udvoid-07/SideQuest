/**
 * Shared Supabase admin client for scripts.
 * Loads credentials from scripts/.env — NEVER hardcodes keys.
 */
const path = require('path')

// Load scripts/.env
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') })
} catch {
  // dotenv not installed — fall through to explicit env vars
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  console.error('       Copy scripts/.env.example → scripts/.env and fill in values')
  process.exit(1)
}

const { createClient } = require('../apps/web/node_modules/@supabase/supabase-js')
module.exports = createClient(url, key)
