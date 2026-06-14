import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ember/20 border border-ember/30 flex items-center justify-center mb-6">
        <Compass size={28} className="text-ember" />
      </div>
      <h1 className="text-6xl font-black text-white mb-2">404</h1>
      <p className="text-xl font-bold text-white mb-2">Quest not found</p>
      <p className="text-mist mb-8 max-w-sm">
        This page wandered off on its own SideQuest. Let&apos;s get you back on track.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ember text-white font-semibold hover:bg-ember-600 transition-colors shadow-ember"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
