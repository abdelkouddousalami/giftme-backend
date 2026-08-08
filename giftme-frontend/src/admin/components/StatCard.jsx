import { Card } from './ui/Card.jsx'

export function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  // Monochrome: "strong" gets the solid black treatment (the headline numbers), everything
  // else is a neutral gray tile - no color vocabulary, just weight.
  const toneClasses = tone === 'strong' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-black">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClasses}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  )
}
