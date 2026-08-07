'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, User, Mail, Lock, MapPin, ChevronDown, ChevronUp, Map } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { updateProfile } from '@/app/actions'
import { NotificationSettings } from './NotificationSettings'
import { getUsernameError, USERNAME_MAX_LENGTH } from '@sidequest/core'
import type { UserProfile, PersonalityType, FitnessLevel, BudgetTier } from '@sidequest/core'

const USERNAME_HINT = `Up to ${USERNAME_MAX_LENGTH} characters — letters, numbers, _ and @ only`

const TOUR_KEY = 'sq:tour:seen'

const PERSONALITIES = [
  { value: 'introvert',  label: 'Introvert',  icon: '🌙', desc: 'Solo, calm, deep' },
  { value: 'ambivert',   label: 'Ambivert',   icon: '🌅', desc: 'Mix of both'      },
  { value: 'extrovert',  label: 'Extrovert',  icon: '☀️', desc: 'Social, energetic' },
]

const FITNESS_LEVELS = [
  { value: 1, label: 'Sedentary',      short: 'Couch',    icon: '🛋️' },
  { value: 2, label: 'Light',          short: 'Light',    icon: '🚶' },
  { value: 3, label: 'Moderate',       short: 'Moderate', icon: '🚴' },
  { value: 4, label: 'Active',         short: 'Active',   icon: '🏃' },
  { value: 5, label: 'Athletic',       short: 'Athlete',  icon: '🏋️' },
]

const BUDGETS = [
  { value: 1, label: 'Free only',    icon: '🆓' },
  { value: 2, label: 'Up to ₹500',  icon: '💵' },
  { value: 3, label: 'Up to ₹2k',   icon: '💸' },
  { value: 4, label: 'No limit',     icon: '🎯' },
]

interface Props {
  profile: UserProfile
}

export function AccountSettingsForm({ profile }: Props) {
  const router = useRouter()

  // Account fields
  const [username, setUsername]     = useState(profile.username ?? '')
  const [city, setCity]             = useState(profile.city ?? '')

  // Questionnaire fields
  const [personality, setPersonality] = useState<PersonalityType>(profile.personality_type)
  const [fitness, setFitness]         = useState<FitnessLevel>(profile.fitness_level)
  const [budget, setBudget]           = useState<BudgetTier>(profile.budget_tier)

  // UI state
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [showPrefs, setShowPrefs]   = useState(false)

  async function handleSave() {
    const usernameError = getUsernameError(username)
    if (usernameError) { setError(usernameError); return }

    setSaving(true)
    setError(null)
    const res = await updateProfile({
      username: username.trim(),
      city: city.trim(),
      personality_type: personality,
      fitness_level: fitness,
      budget_tier: budget,
    })
    if (res.error) {
      setError(res.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="glass rounded-2xl divide-y divide-white/5">
      {/* ── Account Info ── */}
      <div className="p-5 space-y-4">
        <p className="text-xs font-semibold text-ash uppercase tracking-widest">Account Info</p>

        <Input
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          icon={<User size={15} />}
          placeholder="Your username"
          hint={USERNAME_HINT}
          maxLength={USERNAME_MAX_LENGTH}
        />

        {/* Email — read-only */}
        <div>
          <label id="identifier-label" className="text-sm font-medium text-mist block mb-1.5">Email</label>
          <div aria-labelledby="identifier-label" className="flex items-center gap-3 px-4 h-12 rounded-xl border border-white/8 bg-void-800/40 text-mist text-sm">
            <Mail size={15} className="text-ash flex-shrink-0" />
            <span className="flex-1 truncate">{profile.email}</span>
            <span className="text-[10px] text-ash bg-void-700/60 px-2 py-0.5 rounded-full border border-white/5 flex-shrink-0">verified</span>
          </div>
          <p className="text-[11px] text-ash mt-1 pl-1">To change your email, contact support.</p>
        </div>

        <Input
          label="City"
          value={city}
          onChange={e => setCity(e.target.value)}
          icon={<MapPin size={15} />}
          placeholder="Bangalore, Mumbai, Delhi…"
        />
      </div>

      {/* ── Password ── */}
      <div className="p-5">
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-3">Password</p>
        <div className="space-y-2">
          <Link
            href="/forgot-password"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-mist hover:text-white hover:border-ember/40 hover:bg-ember/8 transition-all w-fit"
          >
            <Lock size={14} />
            Reset Password
          </Link>
          <p className="text-[11px] text-ash pl-1">We&apos;ll email you a verification code to set a new password.</p>
        </div>
      </div>

      {/* ── Preferences (questionnaire) ── */}
      <div className="p-5">
        <button
          onClick={() => setShowPrefs(p => !p)}
          className="w-full flex items-center justify-between text-left"
        >
          <p className="text-xs font-semibold text-ash uppercase tracking-widest">Preferences</p>
          {showPrefs ? <ChevronUp size={14} className="text-ash" /> : <ChevronDown size={14} className="text-ash" />}
        </button>

        {showPrefs && (
          <div className="mt-4 space-y-5">
            {/* Personality */}
            <div>
              <span id="settings-personality-label" className="text-sm font-medium text-mist mb-2 block">Personality</span>
              <div role="radiogroup" aria-labelledby="settings-personality-label" className="grid grid-cols-3 gap-2">
                {PERSONALITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    role="radio"
                    aria-checked={personality === p.value}
                    onClick={() => setPersonality(p.value as PersonalityType)}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1
                      ${personality === p.value
                        ? 'bg-ember/15 border-ember/50 text-ember'
                        : 'bg-void-800/50 border-white/10 text-mist hover:border-white/20'}`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span>{p.label}</span>
                    <span className="text-[9px] opacity-60">{p.desc}</span>
                    {personality === p.value && <Check size={10} className="text-ember" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fitness */}
            <div>
              <span id="settings-fitness-label" className="text-sm font-medium text-mist mb-2 block">Fitness Level</span>
              <div role="radiogroup" aria-labelledby="settings-fitness-label" className="grid grid-cols-5 gap-1.5">
                {FITNESS_LEVELS.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={fitness === f.value}
                    onClick={() => setFitness(f.value as FitnessLevel)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-0.5
                      ${fitness === f.value
                        ? 'bg-ember/15 border-ember/50 text-ember'
                        : 'bg-void-800/50 border-white/10 text-mist hover:border-white/20'}`}
                  >
                    <span className="text-base">{f.icon}</span>
                    <span className="text-[9px] text-center leading-tight">{f.short}</span>
                    {fitness === f.value && <Check size={9} className="text-ember" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <span id="settings-budget-label" className="text-sm font-medium text-mist mb-2 block">Budget per Quest</span>
              <div role="radiogroup" aria-labelledby="settings-budget-label" className="grid grid-cols-4 gap-1.5">
                {BUDGETS.map(b => (
                  <button
                    key={b.value}
                    type="button"
                    role="radio"
                    aria-checked={budget === b.value}
                    onClick={() => setBudget(b.value as BudgetTier)}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1
                      ${budget === b.value
                        ? 'bg-ember/15 border-ember/50 text-ember'
                        : 'bg-void-800/50 border-white/10 text-mist hover:border-white/20'}`}
                  >
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-[9px] text-center leading-tight">{b.label}</span>
                    {budget === b.value && <Check size={9} className="text-ember" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Notifications ── */}
      <NotificationSettings />

      {/* ── Guided Tour ── */}
      <div className="p-5">
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-3">Help</p>
        <button
          onClick={() => {
            localStorage.removeItem(TOUR_KEY)
            router.push('/dashboard?tour=1')
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-mist hover:text-white hover:border-ember/40 hover:bg-ember/8 transition-all w-full"
        >
          <Map size={14} className="text-ember" />
          Take the Guided Tour
        </button>
        <p className="text-[11px] text-ash mt-1.5 pl-1">
          Replay the feature walkthrough shown at first sign-in.
        </p>
      </div>

      {/* ── Save ── */}
      <div className="p-5">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>
        )}
        <Button fullWidth onClick={handleSave} loading={saving} disabled={saved}>
          {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
