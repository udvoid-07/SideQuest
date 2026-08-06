import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { verifyStoredOtp } from '@/lib/otp'

function isStrongPassword(value: string) {
  return value.length >= 8 && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email       = (body?.email ?? '').trim().toLowerCase()
  const code        = (body?.code ?? '').trim()
  const newPassword = body?.newPassword ?? ''

  if (!email || code.length !== 6) {
    return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 })
  }
  if (!isStrongPassword(newPassword)) {
    return NextResponse.json({ error: 'Password needs 8+ characters, a number, and a special character.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const result = await verifyStoredOtp(supabase, email, code, 'reset-password')
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = list?.users.find(u => u.email?.toLowerCase() === email)
  if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 })

  await supabase.auth.admin.updateUserById(user.id, { password: newPassword })

  return NextResponse.json({ success: true })
}
