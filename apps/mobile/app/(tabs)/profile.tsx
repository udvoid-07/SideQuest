import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getLevelInfo, getXPProgress, CATEGORY_ICONS } from '@sidequest/core'
import type { QuestCategory } from '@sidequest/core'

const C = { void: '#321847', ember: '#f15153', mist: '#C9B8D8', ash: '#6B5080', bg: '#0f0716', gold: '#F5A623' }

const MOCK_USER = {
  username: 'Ravi Kumar', xp: 480, streak_count: 7,
  longest_streak: 12, total_quests_completed: 14,
  city: 'Bangalore', personality_type: 'ambivert',
}

const BADGES = [
  { name: 'First Step',      icon: '👣', earned: true  },
  { name: 'Week Warrior',    icon: '🗓️', earned: true  },
  { name: 'Comfort Breaker', icon: '🌱', earned: true  },
  { name: 'Culture Vulture', icon: '🎭', earned: false },
  { name: 'Iron Streak',     icon: '⚡', earned: false },
  { name: 'The Legend',      icon: '👑', earned: false },
]

const CATEGORY_STATS: { category: QuestCategory; count: number }[] = [
  { category: 'learning', count: 4 },
  { category: 'wellness', count: 3 },
  { category: 'social',   count: 3 },
  { category: 'culinary', count: 2 },
  { category: 'creative', count: 1 },
  { category: 'adventure',count: 1 },
]

export default function ProfileScreen() {
  const level = getLevelInfo(MOCK_USER.xp)
  const { current, required, percent } = getXPProgress(MOCK_USER.xp)

  return (
    <LinearGradient colors={['#0f0716', '#1a0c27']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>Profile</Text>

          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={[styles.levelBadge, { borderColor: level.color }]}>
              <Text style={[styles.levelNum, { color: level.color }]}>{level.level}</Text>
            </View>
            <Text style={styles.heroName}>{MOCK_USER.username}</Text>
            <Text style={styles.heroSub}>{MOCK_USER.city} · {MOCK_USER.personality_type}</Text>
            <View style={styles.xpSection}>
              <View style={styles.xpRow}>
                <Text style={styles.xpLabel}>{level.title}</Text>
                <Text style={styles.xpNum}>{current}/{required} XP</Text>
              </View>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${percent}%` as any }]} />
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Total XP',      value: MOCK_USER.xp,                    icon: '⚡', color: C.gold     },
              { label: 'Quests Done',   value: MOCK_USER.total_quests_completed, icon: '🎯', color: '#34D399'  },
              { label: 'Current Streak',value: `${MOCK_USER.streak_count}d`,     icon: '🔥', color: '#f97316'  },
              { label: 'Best Streak',   value: `${MOCK_USER.longest_streak}d`,   icon: '🏆', color: C.ember    },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Categories */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quest Breakdown</Text>
            {CATEGORY_STATS.map(({ category, count }) => {
              const pct = Math.round((count / MOCK_USER.total_quests_completed) * 100)
              return (
                <View key={category} style={styles.catRow}>
                  <Text style={styles.catIcon}>{CATEGORY_ICONS[category]}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.catMeta}>
                      <Text style={styles.catName}>{category}</Text>
                      <Text style={styles.catCount}>{count}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` as any }]} />
                    </View>
                  </View>
                </View>
              )
            })}
          </View>

          {/* Badges */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Badges · {BADGES.filter(b => b.earned).length}/{BADGES.length}
            </Text>
            <View style={styles.badgeGrid}>
              {BADGES.map(b => (
                <View key={b.name}
                  style={[styles.badge, !b.earned && styles.badgeLocked]}>
                  <Text style={styles.badgeIcon}>{b.icon}</Text>
                  <Text style={styles.badgeName}>{b.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  scroll:     { padding: 20, paddingBottom: 40 },
  pageTitle:  { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 20 },
  heroCard: {
    backgroundColor: 'rgba(74,32,96,0.5)',
    borderRadius: 20, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16,
  },
  levelBadge: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    backgroundColor: 'rgba(50,24,71,0.6)',
  },
  levelNum:   { fontSize: 24, fontWeight: '900' },
  heroName:   { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSub:    { color: C.mist, fontSize: 13, marginTop: 2, textTransform: 'capitalize', marginBottom: 16 },
  xpSection:  { width: '100%' },
  xpRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  xpLabel:    { color: C.mist, fontSize: 12, fontWeight: '500' },
  xpNum:      { color: C.ash, fontSize: 12 },
  xpTrack:    { height: 8, borderRadius: 4, backgroundColor: 'rgba(50,24,71,0.8)', overflow: 'hidden' },
  xpFill:     { height: '100%', borderRadius: 4, backgroundColor: '#f15153' },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: {
    width: '48%', alignItems: 'center', padding: 14, borderRadius: 16,
    backgroundColor: 'rgba(74,32,96,0.4)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statIcon:   { fontSize: 22, marginBottom: 4 },
  statVal:    { fontSize: 22, fontWeight: '900' },
  statLabel:  { fontSize: 11, color: C.ash, marginTop: 2 },
  sectionCard: {
    backgroundColor: 'rgba(74,32,96,0.4)',
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16,
    gap: 12,
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  catRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon:    { fontSize: 20, width: 28 },
  catMeta:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName:    { color: '#fff', fontSize: 13, textTransform: 'capitalize' },
  catCount:   { color: C.ash, fontSize: 12 },
  barTrack:   { height: 6, borderRadius: 3, backgroundColor: 'rgba(50,24,71,0.8)', overflow: 'hidden' },
  barFill:    { height: '100%', borderRadius: 3, backgroundColor: 'rgba(241,81,83,0.6)' },
  badgeGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '30%', alignItems: 'center', padding: 10, borderRadius: 14,
    backgroundColor: 'rgba(74,32,96,0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 4,
  },
  badgeLocked:{ opacity: 0.3 },
  badgeIcon:  { fontSize: 24 },
  badgeName:  { color: C.mist, fontSize: 10, textAlign: 'center', fontWeight: '500' },
})
