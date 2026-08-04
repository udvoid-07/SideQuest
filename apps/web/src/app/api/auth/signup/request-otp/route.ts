import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { generateOtp, hashOtp, OTP_TTL_SECONDS, OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/otp'
import { sendEmail, signupOtpEmail } from '@/lib/resend'

function isStrongPassword(value: string) {
  return value.length >= 8 && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const username = (body?.username ?? '').trim()
  const email    = (body?.email ?? '').trim().toLowerCase()
  const password = body?.password ?? ''

  if (!username) return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: 'Password needs 8+ characters, a number, and a special character.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // ── Server-side resend cooldown (defense in depth vs. the client timer) ──
  const { data: recent } = await supabase
    .from('email_otp_verifications')
    .select('created_at')
    .eq('email', email)
    .eq('purpose', 'signup')
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recent) {
    const elapsed = (Date.now() - new Date(recent.created_at).getTime()) / 1000
    if (elapsed < OTP_RESEND_COOLDOWN_SECONDS) {
      return NextResponse.json(
        { error: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsed)}s before requesting another code.` },
        { status: 429 },
      )
    }
  }

  // ── Find or create the (unconfirmed) auth user ──────────────────────────
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { username },
  })

  let userId: string
  if (created.error) {
    const alreadyExists = /already.*registered|already.*exists/i.test(created.error.message)
    if (!alreadyExists) return NextResponse.json({ error: created.error.message }, { status: 400 })

    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const existing = list?.users.find(u => u.email?.toLowerCase() === email)
    if (!existing) return NextResponse.json({ error: created.error.message }, { status: 400 })

    if (existing.email_confirmed_at) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 },
      )
    }

    // Unconfirmed account from a previous attempt — reuse it, refresh password/username
    await supabase.auth.admin.updateUserById(existing.id, { password, user_metadata: { username } })
    userId = existing.id
  } else {
    userId = created.data.user!.id
  }

  // ── Generate + store the OTP ─────────────────────────────────────────────
  const otp = generateOtp()
  const otpHash = hashOtp(otp, email)

  await supabase
    .from('email_otp_verifications')
    .delete()
    .eq('email', email)
    .eq('purpose', 'signup')
    .is('consumed_at', null)

  await supabase.from('email_otp_verifications').insert({
    email,
    otp_hash: otpHash,
    purpose: 'signup',
    expires_at: new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString(),
  })

  try {
    const { subject, html } = signupOtpEmail(otp)
    await sendEmail({ to: email, subject, html })
  } catch {
    return NextResponse.json({ error: 'Failed to send verification email. Try again shortly.' }, { status: 502 })
  }

  return NextResponse.json({ success: true, userId })
}
