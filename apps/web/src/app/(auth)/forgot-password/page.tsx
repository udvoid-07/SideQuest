'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

type Step = 'email' | 'reset'

const RESEND_COOLDOWN_SECS = 60
const PASSWORD_HINT = '8+ characters, with at least one number and one special character'

function isStrongPassword(value: string) {
  return value.length >= 8 && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')

  const [email, setEmail]       = useState('')
  const [otp, setOtp]           = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function requestOtp(): Promise<boolean> {
    const res = await fetch('/api/auth/reset-password/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Try again.')
      return false
    }
    return true
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Enter a valid email address.'); return }

    setLoading(true)
    setError(null)
    const ok = await requestOtp()
    setLoading(false)
    if (ok) {
      setStep('reset')
      setCooldown(RESEND_COOLDOWN_SECS)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (otp.trim().length < 6) { setError('Enter the 6-digit code.'); return }
    if (!isStrongPassword(password)) { setError(`Password needs ${PASSWORD_HINT.toLowerCase()}.`); return }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/reset-password/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), code: otp.trim(), newPassword: password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setLoading(false)
      setError(data.error ?? 'Something went wrong. Try again.')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    setLoading(false)
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError(null)
    const ok = await requestOtp()
    if (ok) setCooldown(RESEND_COOLDOWN_SECS)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: '#f15153' }} />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ember flex items-center justify-center shadow-ember mb-4">
            {step === 'email' ? <Compass size={24} className="text-white" /> : <ShieldCheck size={24} className="text-white" />}
          </div>
          <h1 className="text-2xl font-black text-white">
            {step === 'email' ? 'Reset your password' : 'Enter your code'}
          </h1>
          <p className="text-mist text-sm mt-1 text-center">
            {step === 'email'
              ? "Enter your email and we'll send a verification code"
              : `If ${email.trim()} has an account, we sent it a 6-digit code`}
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                autoComplete="email"
                required
              />
              {error && (
                <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Send verification code
                <ArrowRight size={16} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <Input
                label="6-digit code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                icon={<ShieldCheck size={16} />}
                autoComplete="one-time-code"
                className="tracking-[0.4em] text-center font-bold"
                autoFocus
                required
              />
              <Input
                label="New password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                autoComplete="new-password"
                hint={PASSWORD_HINT}
                required
                minLength={8}
              />

              {error && (
                <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Reset password &amp; sign in
                <ArrowRight size={16} />
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(null); setOtp(''); setPassword('') }}
                  className="flex items-center gap-1 text-ash hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="text-ash hover:text-ember transition-colors disabled:opacity-50 disabled:hover:text-ash"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
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
