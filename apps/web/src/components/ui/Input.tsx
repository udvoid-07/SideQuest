'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-mist">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ash pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-11 px-4 rounded-xl bg-void-800/80',
            'border border-white/10 text-white placeholder:text-ash',
            'transition-all duration-200 outline-none',
            'focus:border-ember/60 focus:bg-void-700/80 focus:ring-2 focus:ring-ember/20',
            error && 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20',
            icon && 'pl-10',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-ash">{hint}</p>}
    </div>
  ),
)
Input.displayName = 'Input'
