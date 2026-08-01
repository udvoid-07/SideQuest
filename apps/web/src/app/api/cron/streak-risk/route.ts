import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push-server'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

// Runs once daily in the evening (see /vercel.json). Nudges users with an
// active streak who haven't completed a quest yet today.
export async function GET(req: Request) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: subs } = await supabase.from('push_subscriptions').select('user_id')
  const userIds = [...new Set((subs ?? []).map((s: any) => s.user_id as string))]
  if (userIds.length === 0) return NextResponse.json({ success: true, notified: 0, checked: 0 })

  const { data: users } = await supabase
    .from('users')
    .select('id, streak_count')
    .in('id', userIds)
    .gt('streak_count', 0)

  let notified = 0
  for (const u of users ?? []) {
    const { data: completedToday } = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', u.id)
      .eq('status', 'completed')
      .gte('completed_at', today)
      .limit(1)
      .maybeSingle()

    if (completedToday) continue

    await sendPushToUser(supabase, u.id, {
      title: `Your ${u.streak_count}-day streak is at risk 🔥`,
      body: 'Complete a quest before midnight to keep it alive.',
      url: '/dashboard',
      tag: 'streak-risk',
    })
    notified++
  }

  return NextResponse.json({ success: true, notified, checked: users?.length ?? 0 })
}
