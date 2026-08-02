'use client'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null
  return navigator.serviceWorker.register('/sw.js')
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  const reg = await navigator.serviceWorker.ready.catch(() => null)
  if (!reg) return null
  return reg.pushManager.getSubscription()
}

export async function subscribeToPush(): Promise<{ error?: string }> {
  if (!isPushSupported()) return { error: 'Push notifications are not supported in this browser.' }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey) return { error: 'Push notifications are not configured.' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { error: 'Permission denied.' }

  const reg = await registerServiceWorker()
  if (!reg) return { error: 'Could not register service worker.' }
  await navigator.serviceWorker.ready

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  })

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  })
  if (!res.ok) return { error: 'Failed to save subscription.' }
  return {}
}

export async function unsubscribeFromPush(): Promise<{ error?: string }> {
  const subscription = await getPushSubscription()
  if (!subscription) return {}

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()

  const res = await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  })
  if (!res.ok) return { error: 'Failed to remove subscription.' }
  return {}
}
