import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'

let configured = false
function ensureConfigured() {
  if (configured) return
  const publicKey  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject    = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) {
    throw new Error('VAPID keys are not configured')
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

// Sends to every subscription (device/browser) the user has registered.
// Dead subscriptions (404/410 from the push service) are cleaned up automatically.
export async function sendPushToUser(
  supabase: SupabaseClient,
  userId: string,
  payload: PushPayload,
): Promise<void> {
  ensureConfigured()

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return

  await Promise.all(subs.map(async (sub: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      )
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      } else {
        console.error('push send failed', sub.id, err?.message)
      }
    }
  }))
}
