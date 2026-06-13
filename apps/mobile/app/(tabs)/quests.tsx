import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator, FlatList, StyleSheet, Text,
  TouchableOpacity, View, Dimensions, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Zap, Clock, Coins, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import {
  CATEGORY_ICONS, TIER_COLORS, TIER_LABELS,
  formatCost, formatDuration,
} from '@sidequest/core'
import type { Quest, QuestCategory } from '@sidequest/core'

const { width } = Dimensions.get('window')
const C = { void: '#321847', ember: '#f15153', mist: '#C9B8D8', ash: '#6B5080', bg: '#0f0716', gold: '#F5A623' }

type PrefAction = 'interested' | 'declined'
type Prefs = Record<string, PrefAction>

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'all',       label: 'All'       },
  { key: 'creative',  label: '🎨 Create'  },
  { key: 'social',    label: '🤝 Social'  },
  { key: 'physical',  label: '🏃 Active'  },
  { key: 'mental',    label: '🧠 Mind'    },
  { key: 'culinary',  label: '🍜 Food'    },
  { key: 'adventure', label: '🗺️ Explore' },
  { key: 'learning',  label: '📚 Learn'   },
  { key: 'wellness',  label: '🌿 Wellness'},
]

export default function QuestsScreen() {
  const [quests, setQuests]       = useState<Quest[]>([])
  const [prefs, setPrefs]         = useState<Prefs>({})
  const [category, setCategory]   = useState('all')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)

  // ── Load quests + preferences ──────────────────────────
  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      userIdRef.current = user.id

      const [questsRes, prefsRes] = await Promise.all([
        supabase
          .from('quests')
          .select('id,title,description,category,cost_min,cost_max,budget_tier,duration_minutes,xp_reward,tier,min_age,max_age,fitness_required,personality_match,location_required,tags,info,image_url,is_active,released_at,created_at')
          .eq('is_active', true)
          .order('xp_reward', { ascending: false }),
        supabase
          .from('user_quest_preferences')
          .select('quest_id,action')
          .eq('user_id', user.id),
      ])

      if (cancelled) return

      setQuests((questsRes.data ?? []) as Quest[])

      const prefMap: Prefs = {}
      for (const p of prefsRes.data ?? []) {
        prefMap[p.quest_id] = p.action as PrefAction
      }
      setPrefs(prefMap)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  // ── Filtered list (memoised — no re-render on unrelated state) ─
  const filtered = useMemo(
    () => category === 'all' ? quests : quests.filter(q => q.category === category),
    [quests, category],
  )

  // ── Save preference ────────────────────────────────────
  const setPreference = useCallback(async (questId: string, action: PrefAction) => {
    const userId = userIdRef.current
    if (!userId || saving) return

    const prev = prefs[questId]
    // Toggle off if same action tapped again
    if (prev === action) {
      setSaving(questId)
      setPrefs(p => { const n = { ...p }; delete n[questId]; return n })
      await supabase
        .from('user_quest_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('quest_id', questId)
      setSaving(null)
      return
    }

    setSaving(questId)
    setPrefs(p => ({ ...p, [questId]: action }))
    await supabase
      .from('user_quest_preferences')
      .upsert({ user_id: userId, quest_id: questId, action }, { onConflict: 'user_id,quest_id' })
    setSaving(null)
  }, [prefs, saving])

  // ── Queue a quest (add to user_quests as 'queued') ────
  const queueQuest = useCallback(async (quest: Quest) => {
    const userId = userIdRef.current
    if (!userId) return

    const { error } = await supabase
      .from('user_quests')
      .upsert(
        { user_id: userId, quest_id: quest.id, status: 'queued' },
        { onConflict: 'user_id,quest_id' },
      )

    if (error) {
      if (error.code === '23505') {
        Alert.alert('Already saved', 'This quest is already in your queue or history.')
      } else {
        Alert.alert('Error', error.message)
      }
    } else {
      Alert.alert('Added!', `"${quest.title}" added to your queue.`)
    }
  }, [])

  // ── Render item ───────────────────────────────────────
  const renderQuest = useCallback(({ item: q }: { item: Quest }) => {
    const tierColor = TIER_COLORS[q.tier] ?? '#9CA3AF'
    const pref      = prefs[q.id]
    const isSaving  = saving === q.id

    return (
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={[styles.tierPill, { borderColor: `${tierColor}50`, backgroundColor: `${tierColor}18` }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>
              {q.tier} · {TIER_LABELS[q.tier]}
            </Text>
          </View>
          <Text style={styles.categoryText}>
            {CATEGORY_ICONS[q.category as QuestCategory] ?? '🎯'} {q.category}
          </Text>
        </View>

        {/* Title + description */}
        <Text style={styles.questTitle}>{q.title}</Text>
        <Text style={styles.questDesc} numberOfLines={2}>{q.description}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Zap size={12} color={C.gold} />
            <Text style={[styles.statText, { color: C.gold }]}>{q.xp_reward} XP</Text>
          </View>
          <View style={styles.stat}>
            <Clock size={12} color={C.ash} />
            <Text style={styles.statText}>{formatDuration(q.duration_minutes)}</Text>
          </View>
          <View style={styles.stat}>
            <Coins size={12} color={C.ash} />
            <Text style={styles.statText}>{formatCost(q.cost_min, q.cost_max)}</Text>
          </View>
        </View>

        {/* Tags */}
        {q.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {q.tags.slice(0, 3).map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>#{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, pref === 'declined' && styles.actionActive]}
            onPress={() => setPreference(q.id, 'declined')}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <ThumbsDown size={14} color={pref === 'declined' ? '#f15153' : C.ash} />
            <Text style={[styles.actionText, pref === 'declined' && { color: '#f15153' }]}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, pref === 'interested' && styles.actionActive]}
            onPress={() => setPreference(q.id, 'interested')}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <ThumbsUp size={14} color={pref === 'interested' ? '#34D399' : C.ash} />
            <Text style={[styles.actionText, pref === 'interested' && { color: '#34D399' }]}>Interested</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.queueBtn}
            onPress={() => queueQuest(q)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#f15153', '#de2022']} style={styles.queueGrad}>
              <CheckCircle size={13} color="#fff" />
              <Text style={styles.queueText}>Add to Queue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    )
  }, [prefs, saving, setPreference, queueQuest])

  const keyExtractor = useCallback((q: Quest) => q.id, [])

  return (
    <LinearGradient colors={['#0f0716', '#1a0c27']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Explore Quests</Text>
          <Text style={styles.pageSubtitle}>{filtered.length} quests available</Text>
        </View>

        {/* Category filter strip */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: c }) => (
            <TouchableOpacity
              onPress={() => setCategory(c.key)}
              style={[styles.filterChip, category === c.key && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, category === c.key && styles.filterTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Quest list */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={C.ember} />
            <Text style={[styles.pageSubtitle, { marginTop: 12 }]}>Loading quests…</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderQuest}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyIcon}>🧭</Text>
                <Text style={styles.emptyTitle}>No quests here yet</Text>
                <Text style={styles.emptyDesc}>Try a different category filter</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header:       { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  pageTitle:    { color: '#fff', fontSize: 26, fontWeight: '900' },
  pageSubtitle: { color: C.ash, fontSize: 13, marginTop: 2 },

  filterList: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(74,32,96,0.4)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(241,81,83,0.15)',
    borderColor: 'rgba(241,81,83,0.5)',
  },
  filterText:       { color: C.ash, fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: C.ember, fontWeight: '700' },

  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },

  card: {
    backgroundColor: 'rgba(74,32,96,0.45)',
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tierPill: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  tierText:     { fontSize: 10, fontWeight: '700' },
  categoryText: { color: C.ash, fontSize: 11, textTransform: 'capitalize', flex: 1 },

  questTitle: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 22, marginBottom: 5 },
  questDesc:  { color: C.mist, fontSize: 12, lineHeight: 18, marginBottom: 10 },

  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  stat:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: C.ash, fontSize: 11 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
  tag: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  tagText: { color: C.ash, fontSize: 10 },

  actions:    { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  actionActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionText: { color: C.ash, fontSize: 11, fontWeight: '500' },

  queueBtn:  { flex: 1, borderRadius: 10, overflow: 'hidden' },
  queueGrad: { height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  queueText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyDesc: { color: C.ash, fontSize: 13, marginTop: 4 },
})
