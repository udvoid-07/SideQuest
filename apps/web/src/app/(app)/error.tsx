'use client'
import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error monitoring (Sentry etc.) in production
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-mist text-sm mb-1">
          {error.message?.includes('fetch') || error.message?.includes('network')
            ? 'Could not connect to the server. Check your internet connection.'
            : 'An unexpected error occurred loading this page.'}
        </p>
        {error.digest && (
          <p className="text-ash text-xs mb-5">Error ref: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl bg-ember text-white font-semibold text-sm hover:bg-ember-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
