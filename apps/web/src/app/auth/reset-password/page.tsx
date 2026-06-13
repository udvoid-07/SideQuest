'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [ready,     setReady]     = useState(false)

  useEffect(() => {
    // Supabase SSR picks up the token from the URL hash automatically
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ember flex items-center justify-center shadow-ember mb-4">
            <Compass size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Set new password</h1>
          <p className="text-mist text-sm mt-1">Choose something strong</p>
        </div>

        <div className="glass rounded-2xl p-6">
          {!ready ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-2 border-ember border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-mist text-sm">Verifying reset link…</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="New password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
                minLength={8}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat new password"
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
