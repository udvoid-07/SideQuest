'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase'

// ── Step data ──────────────────────────────────────────────

const PERSONALITIES = [
  { value: 'introvert',  label: 'Introvert',  icon: '🌙', desc: 'I recharge alone. Small steps are fine.' },
  { value: 'ambivert',   label: 'Ambivert',   icon: '🌅', desc: 'I enjoy both worlds depending on the day.' },
  { value: 'extrovert',  label: 'Extrovert',  icon: '☀️', desc: 'I thrive around people and action.' },
]

const FITNESS_LEVELS = [
  { value: 1, label: 'Sedentary',         icon: '🛋️', desc: 'Desk life. Stairs are a workout.' },
  { value: 2, label: 'Lightly Active',    icon: '🚶', desc: 'Occasional walks, casual movement.' },
  { value: 3, label: 'Moderately Active', icon: '🚴', desc: 'Regular exercise, can handle a hike.' },
  { value: 4, label: 'Active',            icon: '🏃', desc: 'Consistent training, good endurance.' },
  { value: 5, label: 'Athletic',          icon: '🏋️', desc: 'High-intensity activities? Bring them on.' },
]

const BUDGETS = [
  { value: 1, label: 'Free only',       icon: '🆓', desc: 'Only suggest zero-cost quests.' },
  { value: 2, label: 'Up to ₹500',      icon: '💵', desc: 'Affordable adventures under ₹500.' },
  { value: 3, label: 'Up to ₹2,000',    icon: '💸', desc: 'Mid-range experiences welcome.' },
  { value: 4, label: 'No limit',        icon: '🎯', desc: 'Show me everything worth doing.' },
]

const GENDERS = [
  { value: 'male',                label: 'Male'           },
  { value: 'female',              label: 'Female'         },
  { value: 'non-binary',          label: 'Non-binary'     },
  { value: 'prefer-not-to-say',   label: 'Prefer not to say' },
]

// ── Component ─────────────────────────────────────────────

interface FormData {
  age: string
  gender: string
  city: string
  personality_type: string
  fitness_level: number
  budget_tier: number
  disclaimer_accepted: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    age: '', gender: '', city: '',
    personality_type: '', fitness_level: 0, budget_tier: 0,
    disclaimer_accepted: false,
  })

  const TOTAL_STEPS = 5

  function update<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function canProceed(): boolean {
    if (step === 0) return !!form.age && !!form.gender && !!form.city
    if (step === 1) return !!form.personality_type
    if (step === 2) return form.fitness_level > 0
    if (step === 3) return form.budget_tier > 0
    if (step === 4) return form.disclaimer_accepted
    return true
  }

  async function handleFinish() {
    setLoading(true)
    setSaveError(null)
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) { window.location.href = '/login'; return }

    const { error: upsertError } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.username ?? user.email!.split('@')[0],
      age: parseInt(form.age),
      gender: form.gender,
      city: form.city,
      personality_type: form.personality_type,
      fitness_level: form.fitness_level,
      budget_tier: form.budget_tier,
      disclaimer_accepted: true,
      xp: 0, level: 1, streak_count: 0, longest_streak: 0,
      total_quests_completed: 0, streak_freeze_available: true,
    })

    if (upsertError) {
      setSaveError(upsertError.message)
      setLoading(false)
      return
    }

    // Full page navigation so the server layout re-fetches the new profile
    window.location.href = '/dashboard'
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  const [dir, setDir] = useState(1)

  function goNext() { setDir(1); setStep(s => s + 1) }
  function goPrev() { setDir(-1); setStep(s => s - 1) }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: '#f15153' }} />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-ash font-medium">Step {step + 1} of {TOTAL_STEPS}</span>
            <span className="text-xs text-ash">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-void-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ember to-amber-400"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {step === 0 && (
              <StepBasics form={form} update={update} />
            )}
            {step === 1 && (
              <StepPersonality form={form} update={update} />
            )}
            {step === 2 && (
              <StepFitness form={form} update={update} />
            )}
            {step === 3 && (
              <StepBudget form={form} update={update} />
            )}
            {step === 4 && (
              <StepDisclaimer form={form} update={update} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex items-center justify-between mt-8 gap-4">
          {step > 0 ? (
            <Button variant="ghost" size="lg" onClick={goPrev}>
              <ArrowLeft size={16} /> Back
            </Button>
          ) : <div />}

          <div className="flex flex-col items-end gap-2">
            {saveError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {saveError}
              </p>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <Button size="lg" onClick={goNext} disabled={!canProceed()}>
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button size="lg" loading={loading} onClick={handleFinish} disabled={!canProceed()}>
                Start Questing! <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step subcomponents ────────────────────────────────────

function StepBasics({ form, update }: any) {
  return (
    <div className="glass rounded-2xl p-7 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">Tell us about yourself</h2>
        <p className="text-mist text-sm mt-1">We use this to personalise your quests.</p>
      </div>
      <Input label="Age" type="number" placeholder="25" min={13} max={99}
             value={form.age} onChange={(e: any) => update('age', e.target.value)} required />
      <div>
        <label className="text-sm font-medium text-mist mb-1.5 block">Gender</label>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map(g => (
            <button key={g.value} type="button"
              onClick={() => update('gender', g.value)}
              className={`p-3 rounded-xl text-sm font-medium border transition-all
                ${form.gender === g.value
                  ? 'bg-ember/15 border-ember/50 text-ember'
                  : 'bg-void-800/50 border-white/10 text-mist hover:border-white/20'
                }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <Input label="City" placeholder="Bangalore, Mumbai, Delhi…"
             value={form.city} onChange={(e: any) => update('city', e.target.value)} required />
    </div>
  )
}

function StepPersonality({ form, update }: any) {
  return (
    <div className="glass rounded-2xl p-7 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">How do you recharge?</h2>
        <p className="text-mist text-sm mt-1">This shapes the social difficulty of your quests.</p>
      </div>
      <div className="space-y-3">
        {PERSONALITIES.map(p => (
          <button key={p.value} type="button" onClick={() => update('personality_type', p.value)}
            className={`w-full p-4 rounded-xl text-left border transition-all flex items-center gap-4
              ${form.personality_type === p.value
                ? 'bg-ember/15 border-ember/50'
                : 'bg-void-800/50 border-white/10 hover:border-white/20'
              }`}
          >
            <span className="text-3xl">{p.icon}</span>
            <div>
              <p className={`font-bold ${form.personality_type === p.value ? 'text-ember' : 'text-white'}`}>{p.label}</p>
              <p className="text-xs text-mist mt-0.5">{p.desc}</p>
            </div>
            {form.personality_type === p.value && (
              <Check size={18} className="ml-auto text-ember flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepFitness({ form, update }: any) {
  return (
    <div className="glass rounded-2xl p-7 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">Physical fitness level?</h2>
        <p className="text-mist text-sm mt-1">We won't give you a marathon quest if you chose sedentary.</p>
      </div>
      <div className="space-y-2">
        {FITNESS_LEVELS.map(f => (
          <button key={f.value} type="button" onClick={() => update('fitness_level', f.value)}
            className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center gap-3
              ${form.fitness_level === f.value
                ? 'bg-ember/15 border-ember/50'
                : 'bg-void-800/50 border-white/10 hover:border-white/20'
              }`}
          >
            <span className="text-xl w-8 text-center">{f.icon}</span>
            <div>
              <p className={`font-semibold text-sm ${form.fitness_level === f.value ? 'text-ember' : 'text-white'}`}>{f.label}</p>
              <p className="text-xs text-ash">{f.desc}</p>
            </div>
            {form.fitness_level === f.value && (
              <Check size={16} className="ml-auto text-ember flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepBudget({ form, update }: any) {
  return (
    <div className="glass rounded-2xl p-7 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">Budget comfort?</h2>
        <p className="text-mist text-sm mt-1">We'll only show quests within your range.</p>
      </div>
      <div className="space-y-3">
        {BUDGETS.map(b => (
          <button key={b.value} type="button" onClick={() => update('budget_tier', b.value)}
            className={`w-full p-4 rounded-xl text-left border transition-all flex items-center gap-4
              ${form.budget_tier === b.value
                ? 'bg-ember/15 border-ember/50'
                : 'bg-void-800/50 border-white/10 hover:border-white/20'
              }`}
          >
            <span className="text-2xl">{b.icon}</span>
            <div>
              <p className={`font-bold ${form.budget_tier === b.value ? 'text-ember' : 'text-white'}`}>{b.label}</p>
              <p className="text-xs text-mist mt-0.5">{b.desc}</p>
            </div>
            {form.budget_tier === b.value && (
              <Check size={18} className="ml-auto text-ember flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepDisclaimer({ form, update }: any) {
  return (
    <div className="glass rounded-2xl p-7 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">One last thing 🛡️</h2>
        <p className="text-mist text-sm mt-1">Please read this before we begin.</p>
      </div>
      <div className="rounded-xl p-4 space-y-3 text-sm text-mist leading-relaxed"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p><strong className="text-white">SideQuest is a suggestion engine, not an instruction manual.</strong></p>
        <p>Every quest listed on this platform is a voluntary suggestion for entertainment and personal growth only. You are never obligated to complete any quest.</p>
        <p>By participating, you acknowledge that:</p>
        <ul className="space-y-1.5 ml-3">
          {[
            'You are solely responsible for your personal safety and wellbeing.',
            'SideQuest is not liable for any expenses, injuries, or outcomes.',
            'All activities are designed to comply with Indian law.',
            'Some quests may have age restrictions which you must verify.',
            'You will use good judgment before attempting any physical activity.',
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-ember flex-shrink-0" />
              {point}
            </li>
          ))}
        </ul>
        <p className="text-xs text-ash">This disclaimer complies with Indian IT Act 2000, Consumer Protection Act 2019, and applicable laws.</p>
      </div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => update('disclaimer_accepted', !form.disclaimer_accepted)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${form.disclaimer_accepted ? 'bg-ember border-ember' : 'border-void-500 group-hover:border-ember/60'}`}
        >
          {form.disclaimer_accepted && <Check size={12} className="text-white" strokeWidth={3} />}
        </div>
        <span className="text-sm text-mist">
          I have read and understand the above. I'm ready to start my SideQuest adventure.
        </span>
      </label>
    </div>
  )
}
