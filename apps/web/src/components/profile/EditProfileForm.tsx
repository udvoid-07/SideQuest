'use client'
import { useState } from 'react'
import { Check, Loader2, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfile } from '@/app/actions'
import type { UserProfile, PersonalityType, FitnessLevel, BudgetTier } from '@sidequest/core'

const PERSONALITIES = [
  { value: 'introvert',  label: 'Introvert',  icon: '🌙' },
  { value: 'ambivert',   label: 'Ambivert',   icon: '🌅' },
  { value: 'extrovert',  label: 'Extrovert',  icon: '☀️' },
]

const FITNESS_LEVELS = [
  { value: 1, label: 'Sedentary',         icon: '🛋️' },
  { value: 2, label: 'Lightly Active',    icon: '🚶' },
  { value: 3, label: 'Moderately Active', icon: '🚴' },
  { value: 4, label: 'Active',            icon: '🏃' },
  { value: 5, label: 'Athletic',          icon: '🏋️' },
]

const BUDGETS = [
  { value: 1, label: 'Free only',   icon: '🆓' },
  { value: 2, label: 'Up to ₹500', icon: '💵' },
  { value: 3, label: 'Up to ₹2k',  icon: '💸' },
  { value: 4, label: 'No limit',   icon: '🎯' },
]

interface Props {
  profile: UserProfile
}

export function EditProfileForm({ profile }: Props) {
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const [city, setCity]               = useState(profile.city)
  const [personality, setPersonality] = useState<PersonalityType>(profile.personality_type)
  const [fitness, setFitness]         = useState<FitnessLevel>(profile.fitness_level)
  const [budget, setBudget]           = useState<BudgetTier>(profile.budget_tier)

  async function handleSave() {
    setLoading(true)
    setError(null)
    const res = await updateProfile({ city, personality_type: personality, fitness_level: fitness, budget_tier: budget })
    if (res.error) {
      setError(res.error)
    } else {
      setSaved(true)
      setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 text-ash hover:text-white hover:border-ember/40 hover:bg-ember/8 transition-all"
      >
        <Pencil size={14} />
        Edit Profile
      </button>
    )
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-5 border border-ember/20">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">Edit Profile</h3>
        <button onClick={() => setOpen(false)} className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-ash hover:text-white transition-colors -mr-2 -mt-1">
          <X size={14} />
        </button>
      </div>

      {/* City */}
      <Input
        label="City"
        placeholder="Bangalore, Mumbai, Delhi…"
        value={city}
        onChange={e => setCity(e.target.value)}
      />

      {/* Personality */}
      <div>
        <label className="text-sm font-medium text-mist mb-2 block">Personality</label>
        <div className="flex gap-2">
          {PERSONALITIES.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPersonality(p.value as PersonalityType)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1
                ${personality === p.value
                  ? 'bg-ember/15 border-ember/50 text-ember'
                  : 'bg-void-800/50 border-white/10 text-mist hover:border-white/20'}`}
            >
              <span className="text-base">{p.icon}</span>
              {p.label}
              {personality === p.value && <Check size={10} className="text-ember" />}
            </button>
          ))}
        </div>
      </div>

      {/* Fitness */}
      <div>
        <label className="text-sm font-medium text-mist mb-2 block">Fitness Level</label>
        <div className="grid grid-cols-5 gap-1.5">
          {FITNESS_LEVELS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFitness(f.value as FitnessLevel)}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-0.5
                ${fitness === f.value
                  ? 'bg-ember/15 border-ember/50 text-ember'
                  : 'bg-void-800/50 border-white/10 text-mist hover:border-white/20'}`}
            >
              <span>{f.icon}</span>
              <span className="text-[9px] text-center leading-tight">{f.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="text-sm font-medium text-mist mb-2 block">Budget</label>
        <div className="grid grid-cols-4 gap-1.5">
          {BUDGETS.map(b => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBudget(b.value as BudgetTier)}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-0.5
                ${budget === b.value
                  ? 'bg-ember/15 border-ember/50 text-ember'
                  : 'bg-void-800/50 border-white/10 text-mist hover:border-white/20'}`}
            >
              <span>{b.icon}</span>
              <span className="text-[9px] text-center leading-tight">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <Button fullWidth onClick={handleSave} loading={loading} disabled={saved}>
        {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
      </Button>
    </div>
  )
}
