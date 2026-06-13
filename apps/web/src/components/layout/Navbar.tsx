'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const pathname = usePathname()
  const isApp = pathname.startsWith('/dashboard') || pathname.startsWith('/quests') || pathname.startsWith('/profile')

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center px-6"
      style={{
        background: 'rgba(15,7,22,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <Link href="/" className="flex items-center gap-2.5 mr-auto">
        <div className="w-8 h-8 rounded-xl bg-ember flex items-center justify-center shadow-ember">
          <Compass size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">
          Side<span className="text-ember">Quest</span>
        </span>
      </Link>

      {!isApp && (
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
