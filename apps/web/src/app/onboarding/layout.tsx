import { redirect } from 'next/navigation'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'
import { getUserProfile } from '@/lib/queries'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const profile  = await getUserProfile(supabase, user.id)

  // Already completed onboarding — go to dashboard
  if (profile?.disclaimer_accepted) redirect('/dashboard')

  return <>{children}</>
}
