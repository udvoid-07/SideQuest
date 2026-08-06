import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { generateOtp, hashOtp, OTP_TTL_SECONDS, OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/otp'
import { sendEmail, resetPasswordOtpEmail } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = (body?.email ?? '').trim().toLowerCase()

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // ── Server-side resend cooldown (defense in depth vs. the client timer) ──
  const { data: recent } = await supabase
    .from('email_otp_verifications')
    .select('created_at')
    .eq('email', email)
    .eq('purpose', 'reset-password')
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

  // Don't reveal whether the email is registered — same response either way.
  // Only actually generate/send a code if an account exists.
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = list?.users.find(u => u.email?.toLowerCase() === email)

  if (user) {
    const otp = generateOtp()
    const otpHash = hashOtp(otp, email)

    await supabase
      .from('email_otp_verifications')
      .delete()
      .eq('email', email)
      .eq('purpose', 'reset-password')
      .is('consumed_at', null)

    await supabase.from('email_otp_verifications').insert({
      email,
      otp_hash: otpHash,
      purpose: 'reset-password',
      expires_at: new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString(),
    })

    try {
      const { subject, html } = resetPasswordOtpEmail(otp)
      await sendEmail({ to: email, subject, html })
    } catch (err) {
      console.error('[reset-password/request-otp] Resend send failed:', err)
      return NextResponse.json({ error: 'Failed to send verification email. Try again shortly.' }, { status: 502 })
    }
  }

  return NextResponse.json({ success: true })
}
