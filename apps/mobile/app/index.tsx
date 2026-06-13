import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { createClient } from '../lib/supabase'

export default function Index() {
  // Redirect based on auth state — Supabase will handle this
  // For now, redirect to auth
  return <Redirect href="/(auth)/login" />
}
