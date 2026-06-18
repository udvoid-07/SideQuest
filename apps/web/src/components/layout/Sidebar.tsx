'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Map, User, LogOut, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { XPBar } from '@/components/gamification/XPBar'
import { signOut } from '@/app/actions'
import { SideQuestIcon } from '@/components/ui/SideQuestIcon'
import type { UserProfile } from '@sidequest/core'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  tourId: undefined         },
  { href: '/quests',    icon: Map,             label: 'All Quests', tourId: 'sidebar-quests'  },
  { href: '/profile',   icon: User,            label: 'Profile',    tourId: 'sidebar-profile' },
]

export function Sidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-20"
      style={{
        background: 'rgba(10,7,5,0.96)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,210,170,0.07)',
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <SideQuestIcon size={28} />
          <span className="font-bold text-base tracking-tight">
            Side<span className="text-ember">Quest</span>
          </span>
        </Link>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: 'rgba(42,26,14,0.6)', border: '1px solid rgba(255,210,170,0.10)' }}>
        <div className="flex items-center gap-3">
          <LevelBadge xp={user.xp} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{user.username}</p>
            <div className="flex items-center gap-1 text-orange-400 text-xs mt-0.5">
              <Flame size={11} />
              <span>{user.streak_count} day streak</span>
            </div>
          </div>
        </div>
        <XPBar xp={user.xp} compact showLabel={false} className="mt-2.5" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {nav.map(({ href, icon: Icon, label, tourId }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              {...(tourId ? { 'data-tour': tourId } : {})}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-ember/15 text-ember border border-ember/25'
                  : 'text-ash hover:text-white hover:bg-white/5',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ash hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
