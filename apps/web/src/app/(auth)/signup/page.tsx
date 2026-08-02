'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Compass, Mail, Lock, User, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

type Step = 'details' | 'verify'

const RESEND_COOLDOWN_SECS = 60
const PASSWORD_HINT = '8+ characters, with at least one number and one special character'

function isStrongPassword(value: string) {
  return value.length >= 8 && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
}

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('details')

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [otp, setOtp]   = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function update(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function validateDetails(): string | null {
    if (!form.username.trim()) return 'Username is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address.'
    if (!isStrongPassword(form.password)) return `Password needs ${PASSWORD_HINT.toLowerCase()}.`
    return null
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validateDetails()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { username: form.username.trim() } },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data.session) {
      // Confirmation disabled on this project — session created immediately
      router.push('/onboarding')
    } else {
      setStep('verify')
      setCooldown(RESEND_COOLDOWN_SECS)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (otp.trim().length < 6) { setError('Enter the 6-digit code.'); return }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email.trim(),
      token: otp.trim(),
      type: 'signup',
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data.session) {
      router.push('/onboarding')
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email.trim() })
    if (error) setError(error.message)
    else setCooldown(RESEND_COOLDOWN_SECS)
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
            {step === 'details' ? <Compass size={24} className="text-white" /> : <ShieldCheck size={24} className="text-white" />}
          </div>
          <h1 className="text-2xl font-black text-white">
            {step === 'details' ? 'Create your account' : 'Verify your account'}
          </h1>
          <p className="text-mist text-sm mt-1">
            {step === 'details'
              ? 'Your first quest awaits'
              : `We sent a 6-digit code to ${form.email.trim()}`}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          {step === 'details' ? (
            <form onSubmit={handleSignUp} className="space-y-4" noValidate>
              <Input
                label="Username"
                placeholder="adventurer42"
                value={form.username}
                onChange={e => update('username', e.target.value)}
                icon={<User size={16} />}
                autoComplete="username"
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                icon={<Mail size={16} />}
                autoComplete="email"
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
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
                Send verification code
                <ArrowRight size={16} />
              </Button>

              <p className="text-center text-[11px] text-ash leading-relaxed">
                By signing up you agree to our{' '}
                <Link href="/terms" className="hover:text-ember transition-colors">Terms</Link>.
                All activities are optional suggestions — never obligations.
              </p>

              <p className="text-center text-sm text-ash">
                Already adventuring?{' '}
                <Link href="/login" className="text-ember hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4" noValidate>
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

              {error && (
                <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Verify &amp; continue
                <ArrowRight size={16} />
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep('details'); setError(null); setOtp('') }}
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
        </div>
      </div>
    </div>
  )
}
