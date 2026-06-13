import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Zap, Clock, Coins, Flame, Trophy } from 'lucide-react-native'
import { getLevelInfo, getXPProgress } from '@sidequest/core'

const { width } = Dimensions.get('window')
const C = { void: '#321847', ember: '#f15153', mist: '#C9B8D8', ash: '#6B5080', bg: '#0f0716', gold: '#F5A623' }

const MOCK_USER = { username: 'Ravi', xp: 480, streak_count: 7, total_quests_completed: 14 }

const TODAY_QUEST = {
  id: '1',
  title: 'Visit a Museum You\'ve Never Been To',
  description: 'Spend 90 minutes immersing in culture at a museum you\'ve always passed by.',
  category: 'learning', tier: 'C', xp_reward: 120, duration_minutes: 120,
  cost_min: 0, cost_max: 200, tags: ['culture', 'solo'],
}

export default function DashboardScreen() {
  const level = getLevelInfo(MOCK_USER.xp)
  const { percent } = getXPProgress(MOCK_USER.xp)

  return (
    <LinearGradient colors={['#0f0716', '#1a0c27']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.username}>{MOCK_USER.username} 👋</Text>
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
              <Text style={styles.xpNum}>{MOCK_USER.xp} XP</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${percent}%` as any }]} />
            </View>
          </View>

          {/* Stats strip */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statVal, { color: '#f97316' }]}>{MOCK_USER.streak_count}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={[styles.statVal, { color: C.gold }]}>{MOCK_USER.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={[styles.statVal, { color: '#34D399' }]}>{MOCK_USER.total_quests_completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>

          {/* Today's quest */}
          <Text style={styles.sectionTitle}>Today's Quest</Text>
          <View style={styles.questCard}>
            {/* Tier + category row */}
            <View style={styles.questMeta}>
              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>{TODAY_QUEST.tier} · Medium</Text>
              </View>
              <Text style={styles.categoryText}>📚 {TODAY_QUEST.category}</Text>
            </View>

            <Text style={styles.questTitle}>{TODAY_QUEST.title}</Text>
            <Text style={styles.questDesc}>{TODAY_QUEST.description}</Text>

            {/* Quest stats */}
            <View style={styles.questStats}>
              <View style={styles.questStat}>
                <Zap size={13} color={C.gold} />
                <Text style={[styles.questStatText, { color: C.gold }]}>{TODAY_QUEST.xp_reward} XP</Text>
              </View>
              <View style={styles.questStat}>
                <Clock size={13} color={C.ash} />
                <Text style={styles.questStatText}>2h</Text>
              </View>
              <View style={styles.questStat}>
                <Coins size={13} color={C.ash} />
                <Text style={styles.questStatText}>Free–₹200</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {TODAY_QUEST.tags.map(t => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>#{t}</Text>
                </View>
              ))}
            </View>

            {/* Start button */}
            <TouchableOpacity style={styles.startBtn} activeOpacity={0.85}>
              <LinearGradient colors={['#f15153', '#de2022']} style={styles.startGrad}>
                <Text style={styles.startText}>▶  Start Quest</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Streak nudge */}
          <View style={styles.streakNudge}>
            <Text style={styles.streakNudgeIcon}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakNudgeTitle}>Keep your {MOCK_USER.streak_count}-day streak alive!</Text>
              <Text style={styles.streakNudgeDesc}>Complete today's quest before midnight.</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
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
