import { AlertTriangle } from 'lucide-react'

/** Monochrome error banner - weight and icon carry "this is an error", not color. */
export function ErrorAlert({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-black bg-white px-3 py-2 text-sm text-black" role="alert">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
