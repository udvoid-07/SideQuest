'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Calendar, Sparkles } from 'lucide-react'
import { WeekPlanModal } from './WeekPlanModal'

export function WeekPlanButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
      >
        <Sparkles size={12} />
        Plan Week
      </button>

      <AnimatePresence>
        {open && <WeekPlanModal userId={userId} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
