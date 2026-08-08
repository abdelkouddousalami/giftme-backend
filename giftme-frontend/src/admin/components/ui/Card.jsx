export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
