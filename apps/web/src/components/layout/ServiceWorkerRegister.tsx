'use client'
import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/push-client'

// Registers the push service worker on every authenticated page load so it's
// ready by the time the user opts into notifications — doesn't prompt for
// permission itself, that only happens from NotificationSettings.
export function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker().catch(() => {})
  }, [])
  return null
}
