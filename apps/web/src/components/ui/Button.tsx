'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-ember text-white shadow-ember hover:bg-ember-600 active:scale-95 disabled:bg-ember/40',
  secondary:
    'bg-void-700 text-white border border-white/10 hover:bg-void-600 active:scale-95',
  ghost:
    'text-mist hover:text-white hover:bg-white/5 active:scale-95',
  danger:
    'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 active:scale-95',
  outline:
    'border border-ember/50 text-ember hover:bg-ember/10 active:scale-95',
}

const sizes: Record<Size, string> = {
  sm:  'h-8  px-3  text-sm  rounded-lg  gap-1.5',
  md:  'h-10 px-4  text-sm  rounded-xl  gap-2',
  lg:  'h-12 px-6  text-base rounded-xl gap-2',
  xl:  'h-14 px-8  text-lg  rounded-2xl gap-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 focus-ember select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  ),
)
Button.displayName = 'Button'
