'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('sq_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('sq_cookie_consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('sq_cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 rounded-2xl p-4 shadow-quest"
      style={{
        background: 'rgba(16,11,6,0.97)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,210,170,0.12)',
      }}
    >
      <div className="flex items-start gap-3">
        <Cookie size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-1">We use cookies</p>
          <p className="text-xs text-mist leading-relaxed mb-3">
            SideQuest uses session cookies for authentication and localStorage for your preferences.
            No advertising cookies. See our{' '}
            <Link href="/privacy" className="text-ember hover:underline">Privacy Policy</Link>.
          </p>
          <div className="flex gap-2">
            <button
              onClick={accept}
              className="flex-1 h-11 rounded-xl bg-ember text-white text-sm font-semibold hover:bg-ember-600 transition-colors active:scale-95"
            >
              Accept
            </button>
            <button
              onClick={decline}
              className="flex-1 h-11 rounded-xl bg-void-700 border border-white/10 text-sm text-mist font-semibold hover:bg-void-600 transition-colors active:scale-95"
            >
              Decline
            </button>
          </div>
        </div>
        <button onClick={decline} className="w-11 h-11 flex items-center justify-center text-ash hover:text-white transition-colors flex-shrink-0 -mr-2 -mt-1">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
