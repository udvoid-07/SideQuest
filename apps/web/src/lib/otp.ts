import { randomInt, createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export const OTP_TTL_SECONDS = 300 // 5 minutes
export const OTP_RESEND_COOLDOWN_SECONDS = 60
export const OTP_MAX_ATTEMPTS = 5

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export function hashOtp(otp: string, email: string): string {
  const pepper = process.env.OTP_PEPPER
  if (!pepper) throw new Error('OTP_PEPPER is not configured')
  return createHash('sha256').update(`${email.toLowerCase()}:${otp}:${pepper}`).digest('hex')
}

type VerifyResult = { ok: true } | { ok: false; error: string; status: number }

// Shared by every OTP-gated flow (signup, password reset, ...) — checks the
// stored hash/expiry/attempt-count and marks the row consumed on success.
// Caller is responsible for whatever action the verified code unlocks.
export async function verifyStoredOtp(
  supabase: SupabaseClient,
  email: string,
  code: string,
  purpose: string,
): Promise<VerifyResult> {
  const { data: row } = await supabase
    .from('email_otp_verifications')
    .select('id, otp_hash, attempts, expires_at')
    .eq('email', email)
    .eq('purpose', purpose)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!row || new Date(row.expires_at) < new Date()) {
    return { ok: false, error: 'That code has expired. Request a new one.', status: 410 }
  }

  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await supabase.from('email_otp_verifications').delete().eq('id', row.id)
    return { ok: false, error: 'Too many incorrect attempts. Request a new code.', status: 429 }
  }

  if (hashOtp(code, email) !== row.otp_hash) {
    await supabase
      .from('email_otp_verifications')
      .update({ attempts: row.attempts + 1 })
      .eq('id', row.id)
    return { ok: false, error: 'Incorrect code. Try again.', status: 400 }
  }

  await supabase
    .from('email_otp_verifications')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id)

  return { ok: true }
}
