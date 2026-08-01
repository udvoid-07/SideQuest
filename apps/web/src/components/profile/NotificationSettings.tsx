'use client'
import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { isPushSupported, getPushSubscription, subscribeToPush, unsubscribeFromPush } from '@/lib/push-client'

export function NotificationSettings() {
  const [supported, setSupported]   = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [busy, setBusy]             = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false)
      setLoading(false)
      return
    }
    getPushSubscription().then(sub => {
      setSubscribed(!!sub)
      setLoading(false)
    })
  }, [])

  async function toggle() {
    setBusy(true)
    setError(null)
    const result = subscribed ? await unsubscribeFromPush() : await subscribeToPush()
    if (result.error) {
      setError(result.error)
    } else {
      setSubscribed(!subscribed)
    }
    setBusy(false)
  }

  return (
    <div className="p-5">
      <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-3">Notifications</p>
      {!supported ? (
        <p className="text-xs text-ash">Push notifications aren&apos;t supported in this browser.</p>
      ) : loading ? (
        <Loader2 size={16} className="text-ash animate-spin" />
      ) : (
        <div className="space-y-2">
          <button
            onClick={toggle}
            disabled={busy}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50
              ${subscribed
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15'
                : 'border-white/10 text-mist hover:text-white hover:border-ember/40 hover:bg-ember/8'}`}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : subscribed ? <Bell size={14} /> : <BellOff size={14} />}
            {subscribed ? 'Notifications enabled' : 'Enable push notifications'}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <p className="text-[11px] text-ash pl-1">
            Get notified when today&apos;s quest is ready and when your streak is at risk.
          </p>
        </div>
      )}
    </div>
  )
}
