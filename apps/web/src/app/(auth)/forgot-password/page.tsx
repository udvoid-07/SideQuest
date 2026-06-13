'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Compass, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: '#f15153' }} />
      </div>
      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ember flex items-center justify-center shadow-ember mb-4">
            <Compass size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Reset your password</h1>
          <p className="text-mist text-sm mt-1 text-center">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-4xl">📬</p>
              <p className="font-bold text-white">Check your inbox</p>
              <p className="text-sm text-mist">
                We sent a password reset link to <span className="text-ember">{email}</span>.
                The link expires in 1 hour.
              </p>
              <p className="text-xs text-ash">Didn&apos;t get it? Check spam or try again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-ash hover:text-ember transition-colors flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
