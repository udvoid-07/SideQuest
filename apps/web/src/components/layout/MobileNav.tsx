'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Map, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/quests',    icon: Map,             label: 'Quests'    },
  { href: '/profile',   icon: User,            label: 'Profile'   },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden"
      style={{
        background: 'rgba(10,7,5,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,210,170,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {nav.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors',
              active ? 'text-ember' : 'text-ash hover:text-white',
            )}
          >
            <Icon size={22} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
