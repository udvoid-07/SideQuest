import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { createClient } from '../../lib/supabase'

async function registerPushToken(userId: string) {
  if (!Device.isDevice) return  // Emulator — skip
  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'SideQuest',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data
  const supabase = createClient()
  await supabase.from('users').update({ push_token: token }).eq('id', userId)
}

const C = { void: '#321847', ember: '#f15153', mist: '#C9B8D8', ash: '#6B5080', bg: '#0f0716' }

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    const { data, error } = await createClient().auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Sign In Failed', error.message)
    } else {
      if (data.user) registerPushToken(data.user.id).catch(console.warn)
      router.replace('/(tabs)')
    }
  }

  return (
    <LinearGradient colors={['#0f0716', '#1e0e2b', '#321847']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={['#f15153', '#de2022']} style={styles.logoBox}>
            <Text style={styles.logoText}>⚔️</Text>
          </LinearGradient>
          <Text style={styles.appName}>
            Side<Text style={{ color: C.ember }}>Quest</Text>
          </Text>
          <Text style={styles.subtitle}>Welcome back, Adventurer</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={C.ash}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={C.ash}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#f15153', '#de2022']} style={styles.btnGrad}>
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnText}>Sign In →</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.linkRow}>
            <Text style={styles.linkText}>
              No account? <Text style={{ color: C.ember }}>Create one free</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap:  { alignItems: 'center', marginBottom: 36 },
  logoBox:   { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText:  { fontSize: 28 },
  appName:   { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  subtitle:  { color: C.mist, marginTop: 4, fontSize: 14 },
  card: {
    backgroundColor: 'rgba(74,32,96,0.5)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
  field:  { gap: 6 },
  label:  { color: C.mist, fontSize: 13, fontWeight: '500' },
  input: {
    height: 48,
    backgroundColor: 'rgba(50,24,71,0.8)',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btn:     { borderRadius: 14, overflow: 'hidden' },
  btnGrad: { height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkRow: { alignItems: 'center' },
  linkText:{ color: C.ash, fontSize: 14 },
})
