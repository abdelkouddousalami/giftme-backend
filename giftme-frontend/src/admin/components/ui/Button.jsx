import { Loader2 } from 'lucide-react'

// Monochrome only, by design (black/white/gray - no brand colors). Danger actions are
// distinguished by icon + the existing ConfirmDialog step, not by color (see Badge.jsx
// for the same reasoning applied to status indicators).
const VARIANT_CLASSES = {
  primary: 'bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300',
  secondary: 'bg-white text-black border border-neutral-300 hover:bg-neutral-50 disabled:text-neutral-400',
  danger: 'bg-white text-black border border-neutral-300 hover:bg-black hover:text-white disabled:text-neutral-400',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  disabled,
  children,
  className = '',
  ...rest
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}
