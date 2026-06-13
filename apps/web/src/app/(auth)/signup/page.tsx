'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding')
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15" style={{ background: '#f15153' }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-10" style={{ background: '#8b5cf6' }} />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ember flex items-center justify-center shadow-ember mb-4">
            <Compass size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Create your account</h1>
          <p className="text-mist text-sm mt-1">Your first quest awaits</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <Button variant="secondary" fullWidth size="lg" onClick={handleGoogle} type="button">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign Up with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-ash">
            <div className="flex-1 h-px bg-white/10" />or<div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              label="Username"
              placeholder="adventurer42"
              value={form.username}
              onChange={e => update('username', e.target.value)}
              icon={<User size={16} />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              icon={<Lock size={16} />}
              required
              minLength={8}
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-[11px] text-ash leading-relaxed">
            By signing up you agree to our Terms. All activities on SideQuest are
            optional suggestions for fun — never obligations.
          </p>

          <p className="text-center text-sm text-ash">
            Already adventuring?{' '}
            <Link href="/login" className="text-ember hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
