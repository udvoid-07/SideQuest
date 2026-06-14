'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm]               = useState({ username: '', email: '', password: '' })
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [needsVerify, setNeedsVerify] = useState(false)

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.session) {
      // Email confirmation disabled — session created immediately
      router.push('/onboarding')
    } else {
      // Supabase requires email confirmation before granting a session
      setNeedsVerify(true)
      setLoading(false)
    }
  }

  if (needsVerify) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Check your inbox</h1>
            <p className="text-mist text-sm mt-2">
              We sent a confirmation link to{' '}
              <span className="text-ember font-medium">{form.email}</span>.
              Click it to activate your account, then come back to sign in.
            </p>
          </div>
          <p className="text-xs text-ash">Didn't get it? Check your spam folder or try signing up again with a different email.</p>
          <Link href="/login">
            <Button fullWidth variant="outline">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15" style={{ background: '#E8663D' }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-8" style={{ background: '#F4A261' }} />
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
            By signing up you agree to our{' '}
            <Link href="/terms" className="hover:text-ember transition-colors">Terms</Link>.
            All activities are optional suggestions — never obligations.
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
