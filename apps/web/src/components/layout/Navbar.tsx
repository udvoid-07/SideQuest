'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { SideQuestIcon } from '@/components/ui/SideQuestIcon'

export function Navbar() {
  const pathname = usePathname()
  const isApp = pathname.startsWith('/dashboard') || pathname.startsWith('/quests') || pathname.startsWith('/profile')

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center px-6"
      style={{
        background: 'rgba(10,7,5,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,210,170,0.07)',
      }}
    >
      <Link href="/" className="flex items-center gap-2.5 mr-auto">
        <SideQuestIcon size={32} />
        <span className="font-bold text-lg tracking-tight">
          Side<span className="text-ember">Quest</span>
        </span>
      </Link>

      {!isApp && (
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-cream/80 hover:text-white">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="shadow-ember">Start Free</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
