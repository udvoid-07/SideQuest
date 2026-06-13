'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { getLevelInfo, LEVEL_TABLE } from '@sidequest/core'
import { Button } from './Button'

interface LevelUpModalProps {
  readonly levelAfter: number
  readonly xpEarned: number
  readonly newBadges: Array<{ name: string; icon: string; description: string }>
  readonly onClose: () => void
}

export function LevelUpModal({ levelAfter, xpEarned, newBadges, onClose }: LevelUpModalProps) {
  const level = LEVEL_TABLE.find(l => l.level === levelAfter) ?? LEVEL_TABLE[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          className="relative rounded-3xl p-8 max-w-sm w-full text-center overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at top, ${level.color}25 0%, rgba(50,24,71,0.98) 70%)`,
            border: `2px solid ${level.color}60`,
            boxShadow: `0 0 60px ${level.color}40`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-mist">
            <X size={15} />
          </button>

          {/* Burst */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl"
            style={{ background: level.color, opacity: 0.2 }}
          />

          {/* Level badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-black mb-5 border-4"
            style={{
              borderColor: level.color,
              background: `radial-gradient(circle, ${level.color}30 0%, transparent 70%)`,
              color: level.color,
              boxShadow: `0 0 30px ${level.color}60`,
            }}
          >
            {level.level}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: level.color }}>
              Level Up!
            </p>
            <h2 className="text-3xl font-black text-white mb-1">{level.title}</h2>
            <p className="text-mist text-sm mb-4">You reached Level {level.level}</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap size={16} style={{ color: '#F5A623' }} />
              <span className="font-bold text-amber-400">+{xpEarned} XP earned</span>
            </div>
          </motion.div>

          {/* New badges */}
          {newBadges.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mb-6 p-4 rounded-2xl border border-white/10 bg-void-800/50">
              <p className="text-xs text-ash uppercase tracking-wider mb-3">New Badges Unlocked</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {newBadges.map(b => (
                  <div key={b.name} className="flex flex-col items-center gap-1" title={b.description}>
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-[10px] text-mist text-center">{b.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <Button fullWidth size="lg" onClick={onClose}
            style={{ background: level.color, boxShadow: `0 4px 20px ${level.color}50` }}>
            Keep Questing 🗺️
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
