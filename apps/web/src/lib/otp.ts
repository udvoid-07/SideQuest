import { randomInt, createHash } from 'crypto'

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
