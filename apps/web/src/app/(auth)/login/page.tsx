'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, Mail, Lock, ArrowRight } from 'lucide-react'
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

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
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
