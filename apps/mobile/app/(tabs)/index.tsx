import { useCallback, useEffect, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Zap, Clock, Coins } from 'lucide-react-native'
import {
  getLevelInfo, getXPProgress, CATEGORY_ICONS,
  formatCost, formatDuration, TIER_LABELS,
} from '@sidequest/core'
import type { UserProfile, UserQuest, QuestCategory, QuestTier } from '@sidequest/core'
import { supabase } from '../../lib/supabase'

const C = { void: '#321847', ember: '#f15153', mist: '#C9B8D8', ash: '#6B5080', bg: '#0f0716', gold: '#F5A623' }

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export default function DashboardScreen() {
  const [profile, setProfile]       = useState<UserProfile | null>(null)
  const [todayQuest, setTodayQuest] = useState<UserQuest | null>(null)
  const [loading, setLoading]       = useState(true)
  const [starting, setStarting]     = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/(auth)/login'); return }

    const [{ data: profileData }, { data: existing }] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase
        .from('user_quests')
        .select('*, quest:quests(*)')
        .eq('user_id', user.id)
        .in('status', ['assigned', 'in_progress'])
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    setProfile(profileData as UserProfile)

    if (existing) {
      setTodayQuest(existing as UserQuest)
    } else {
      const { data: newId } = await supabase.rpc('assign_daily_quest', { p_user_id: user.id })
      if (newId) {
        const { data: fresh } = await supabase
          .from('user_quests')
          .select('*, quest:quests(*)')
          .eq('id', newId)
          .single()
        setTodayQuest(fresh as UserQuest | null)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const startQuest = useCallback(async () => {
    if (!todayQuest || starting) return
    setStarting(true)
    const { error } = await supabase.rpc('start_quest', { p_user_quest_id: todayQuest.id })
    setStarting(false)
    if (error) { Alert.alert('Error', error.message); return }
    setTodayQuest(q => q ? { ...q, status: 'in_progress' } : q)
    Alert.alert('Quest started!', 'Head out and complete it before the timer runs out.')
  }, [todayQuest, starting])

  if (loading || !profile) {
    return (
      <LinearGradient colors={['#0f0716', '#1a0c27']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={C.ember} />
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const level = getLevelInfo(profile.xp)
  const { percent } = getXPProgress(profile.xp)
  const quest = todayQuest?.quest
  const isInProgress = todayQuest?.status === 'in_progress'

  return (
    <LinearGradient colors={['#0f0716', '#1a0c27']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.username}>{profile.username} 👋</Text>
            </View>
            {/* Level badge */}
            <View style={[styles.levelBadge, { borderColor: level.color, shadowColor: level.color }]}>
              <Text style={[styles.levelNum, { color: level.color }]}>{level.level}</Text>
            </View>
          </View>

          {/* XP bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>{level.title}</Text>
              <Text style={styles.xpNum}>{profile.xp} XP</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${percent}%` as any }]} />
            </View>
          </View>

          {/* Stats strip */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statVal, { color: '#f97316' }]}>{profile.streak_count}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={[styles.statVal, { color: C.gold }]}>{profile.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={[styles.statVal, { color: '#34D399' }]}>{profile.total_quests_completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>

          {/* Today's quest */}
          <Text style={styles.sectionTitle}>Today's Quest</Text>
          {quest ? (
            <View style={styles.questCard}>
              {/* Tier + category row */}
              <View style={styles.questMeta}>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>{quest.tier} · {TIER_LABELS[quest.tier as QuestTier]}</Text>
                </View>
                <Text style={styles.categoryText}>
                  {CATEGORY_ICONS[quest.category as QuestCategory] ?? '🎯'} {quest.category}
                </Text>
              </View>

              <Text style={styles.questTitle}>{quest.title}</Text>
              <Text style={styles.questDesc}>{quest.description}</Text>

              {/* Quest stats */}
              <View style={styles.questStats}>
                <View style={styles.questStat}>
                  <Zap size={13} color={C.gold} />
                  <Text style={[styles.questStatText, { color: C.gold }]}>{quest.xp_reward} XP</Text>
                </View>
                <View style={styles.questStat}>
                  <Clock size={13} color={C.ash} />
                  <Text style={styles.questStatText}>{formatDuration(quest.duration_minutes)}</Text>
                </View>
                <View style={styles.questStat}>
                  <Coins size={13} color={C.ash} />
                  <Text style={styles.questStatText}>{formatCost(quest.cost_min, quest.cost_max)}</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {quest.tags.map(t => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>

              {/* Start button */}
              <TouchableOpacity
                style={styles.startBtn}
                activeOpacity={0.85}
                onPress={startQuest}
                disabled={isInProgress || starting}
              >
                <LinearGradient colors={['#f15153', '#de2022']} style={styles.startGrad}>
                  {starting
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.startText}>{isInProgress ? '⏳  Quest In Progress' : '▶  Start Quest'}</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyQuest}>
              <Text style={styles.emptyIcon}>🧭</Text>
              <Text style={styles.emptyTitle}>No quest assigned yet</Text>
              <Text style={styles.emptyDesc}>Check the Explore tab to browse available quests.</Text>
            </View>
          )}

          {/* Streak nudge */}
          {profile.streak_count > 0 && (
            <View style={styles.streakNudge}>
              <Text style={styles.streakNudgeIcon}>🔥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.streakNudgeTitle}>Keep your {profile.streak_count}-day streak alive!</Text>
                <Text style={styles.streakNudgeDesc}>Complete today's quest before midnight.</Text>
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:       { padding: 20, paddingBottom: 40 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting:     { color: C.mist, fontSize: 14 },
  username:     { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 },
  levelBadge: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12,
    backgroundColor: 'rgba(50,24,71,0.6)',
  },
  levelNum:     { fontSize: 18, fontWeight: '900' },
  xpSection:    { marginBottom: 16 },
  xpRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel:      { color: C.mist, fontSize: 12, fontWeight: '500' },
  xpNum:        { color: C.ash, fontSize: 12 },
  xpTrack:      { height: 8, borderRadius: 4, backgroundColor: 'rgba(50,24,71,0.8)', overflow: 'hidden' },
  xpFill: {
    height: '100%', borderRadius: 4,
    backgroundColor: '#f15153',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6,
  },
  statsRow:     { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, alignItems: 'center', padding: 12, borderRadius: 16,
    backgroundColor: 'rgba(74,32,96,0.4)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    gap: 2,
  },
  statIcon:     { fontSize: 20 },
  statVal:      { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLabel:    { fontSize: 11, color: C.ash, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  questCard: {
    backgroundColor: 'rgba(74,32,96,0.5)',
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    shadowColor: '#321847', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16,
  },
  questMeta:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tierBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(52,211,153,0.15)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)',
  },
  tierText:     { color: '#34D399', fontSize: 11, fontWeight: '700' },
  categoryText: { color: C.ash, fontSize: 12, textTransform: 'capitalize' },
  questTitle:   { color: '#fff', fontSize: 17, fontWeight: '800', lineHeight: 24, marginBottom: 6 },
  questDesc:    { color: C.mist, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  questStats:   { flexDirection: 'row', gap: 16, marginBottom: 10 },
  questStat:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  questStatText:{ color: C.ash, fontSize: 12 },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tagText:      { color: C.ash, fontSize: 11 },
  startBtn:     { borderRadius: 14, overflow: 'hidden' },
  startGrad:    { height: 50, alignItems: 'center', justifyContent: 'center' },
  startText:    { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  emptyQuest: {
    alignItems: 'center', padding: 28, borderRadius: 20, marginBottom: 16,
    backgroundColor: 'rgba(74,32,96,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyIcon:    { fontSize: 32, marginBottom: 8 },
  emptyTitle:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyDesc:    { color: C.ash, fontSize: 12, marginTop: 4, textAlign: 'center' },
  streakNudge: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)',
  },
  streakNudgeIcon:  { fontSize: 24 },
  streakNudgeTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
  streakNudgeDesc:  { color: C.ash, fontSize: 12, marginTop: 2 },
})
