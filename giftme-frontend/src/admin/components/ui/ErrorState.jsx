import { AlertTriangle } from 'lucide-react'
import { Button } from './Button.jsx'

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <AlertTriangle size={36} className="text-black" />
      <p className="max-w-sm text-sm font-medium text-slate-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
