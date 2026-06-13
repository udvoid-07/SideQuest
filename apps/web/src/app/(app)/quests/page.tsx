import { redirect } from 'next/navigation'
import { QuestBrowser } from '@/components/quest/QuestBrowser'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'
import { getUserProfile, getAllFilteredQuests, getUserPreferences, getCategoryStats } from '@/lib/queries'

export default async function QuestsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const profile  = await getUserProfile(supabase, user.id)
  if (!profile) redirect('/onboarding')

  const [quests, prefs, catStats] = await Promise.all([
    getAllFilteredQuests(supabase, profile),
    getUserPreferences(supabase, user.id),
    getCategoryStats(supabase, user.id),
  ])

  // Build category stats map for scoring
  const statsMap: Record<string, number> = {}
  for (const { category, count } of catStats) {
    statsMap[category] = count
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Explore Quests</h1>
        <p className="text-mist mt-1">
          {quests.length} quests matched to your profile. Pick what calls to you today.
        </p>
      </div>
      <QuestBrowser
        quests={quests}
        userCity={profile.city}
        categoryStats={statsMap}
        totalCompleted={profile.total_quests_completed}
        declinedIds={prefs.declinedIds}
        interestedIds={prefs.interestedIds}
        userBudgetTier={profile.budget_tier}
        userFitnessLevel={profile.fitness_level}
      />
    </div>
  )
}
