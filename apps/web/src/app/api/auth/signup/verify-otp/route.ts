import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { hashOtp, OTP_MAX_ATTEMPTS } from '@/lib/otp'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = (body?.email ?? '').trim().toLowerCase()
  const code  = (body?.code ?? '').trim()

  if (!email || code.length !== 6) {
    return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: row } = await supabase
    .from('email_otp_verifications')
    .select('id, otp_hash, attempts, expires_at')
    .eq('email', email)
    .eq('purpose', 'signup')
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!row || new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'That code has expired. Request a new one.' }, { status: 410 })
  }

  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await supabase.from('email_otp_verifications').delete().eq('id', row.id)
    return NextResponse.json({ error: 'Too many incorrect attempts. Request a new code.' }, { status: 429 })
  }

  if (hashOtp(code, email) !== row.otp_hash) {
    await supabase
      .from('email_otp_verifications')
      .update({ attempts: row.attempts + 1 })
      .eq('id', row.id)
    return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 })
  }

  await supabase
    .from('email_otp_verifications')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id)

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = list?.users.find(u => u.email?.toLowerCase() === email)
  if (!user) return NextResponse.json({ error: 'Account not found. Please sign up again.' }, { status: 404 })

  await supabase.auth.admin.updateUserById(user.id, { email_confirm: true })

  return NextResponse.json({ success: true })
}
