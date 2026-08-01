import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push-server'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

// Runs once daily (see /vercel.json). Only touches users who have opted into
// push — everyone else still gets their quest lazily-assigned on dashboard visit.
export async function GET(req: Request) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: subs } = await supabase.from('push_subscriptions').select('user_id')
  const userIds = [...new Set((subs ?? []).map((s: any) => s.user_id as string))]

  let notified = 0
  for (const userId of userIds) {
    const { data: existing } = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['assigned', 'in_progress'])
      .gte('assigned_at', today)
      .limit(1)
      .maybeSingle()

    if (existing) continue

    const { data: newId } = await supabase.rpc('assign_daily_quest', { p_user_id: userId })
    if (!newId) continue

    const { data: uq } = await supabase
      .from('user_quests')
      .select('quest:quests(title)')
      .eq('id', newId)
      .single()

    const title = (uq as any)?.quest?.title ?? 'a new quest'
    await sendPushToUser(supabase, userId, {
      title: 'Your quest for today is ready 🧭',
      body: title,
      url: '/dashboard',
      tag: 'daily-quest',
    })
    notified++
  }

  return NextResponse.json({ success: true, notified, checked: userIds.length })
}
