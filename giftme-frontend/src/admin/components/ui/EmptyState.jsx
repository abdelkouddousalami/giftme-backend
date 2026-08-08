import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', description, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-2 text-slate-300">{icon ?? <Inbox size={40} />}</div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
