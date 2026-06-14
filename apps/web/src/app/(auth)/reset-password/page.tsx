'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    // Supabase puts the session in the URL fragment when user clicks the reset link
    // The client SDK automatically exchanges it — we just need the client ready
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-12" style={{ background: '#E8663D' }} />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ember flex items-center justify-center shadow-ember mb-4">
            <Compass size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Set a new password</h1>
          <p className="text-mist text-sm mt-1">Choose something memorable</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 size={40} className="text-emerald-400" />
              <p className="font-semibold text-white">Password updated!</p>
              <p className="text-sm text-mist">Taking you to your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
                minLength={8}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Same as above"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Update Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
