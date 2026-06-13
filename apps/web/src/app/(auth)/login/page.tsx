'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, Mail, Lock, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-15" style={{ background: '#f15153' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-[100px] opacity-10" style={{ background: '#321847' }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ember flex items-center justify-center shadow-ember mb-4">
            <Compass size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, Adventurer</h1>
          <p className="text-mist text-sm mt-1">Continue your SideQuest journey</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 space-y-4">
          {/* Google */}
          <Button variant="secondary" fullWidth size="lg" onClick={handleGoogle} type="button">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-ash">
            <div className="flex-1 h-px bg-white/10" />
            or
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <div className="space-y-1.5">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
              <div className="text-right">
                <Link href="/forgot-password" className="text-xs text-ash hover:text-ember transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="relative">
            <div className="flex items-center gap-3 text-xs text-ash">
              <div className="flex-1 h-px bg-white/10" />
              or explore without signing in
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            size="lg"
            type="button"
            onClick={() => router.push('/dashboard')}
          >
            <Zap size={16} />
            Try Demo — no account needed
          </Button>

          <p className="text-center text-sm text-ash">
            No account?{' '}
            <Link href="/signup" className="text-ember hover:underline font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
