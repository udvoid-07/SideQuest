import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'
import { getUserProfile } from '@/lib/queries'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const profile  = await getUserProfile(supabase, user.id)

  if (!profile || !profile.disclaimer_accepted) redirect('/onboarding')

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar user={profile} />
      </div>

      {/* Main content — no left margin on mobile, ml-60 on desktop */}
      <main className="flex-1 md:ml-60 min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileNav />
    </div>
  )
}
