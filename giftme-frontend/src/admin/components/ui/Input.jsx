import { forwardRef } from 'react'

// react-hook-form's `register(name)` spreads { name, onChange, onBlur, ref } onto the input -
// it never includes `id`. Falling back to `name` here means every field registered via RHF
// still gets a real id, so the wrapping <label htmlFor> actually associates with its input
// (click-to-focus and screen readers both depend on this) without every call site having to
// remember to pass `id` explicitly.
export const Input = forwardRef(({ label, error, hint, className = '', id, name, ...rest }, ref) => {
  const resolvedId = id ?? name
  return (
    <label className="block text-sm" htmlFor={resolvedId}>
      {label && <span className="mb-1 block font-medium text-slate-700">{label}</span>}
      <input
        ref={ref}
        id={resolvedId}
        name={name}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-black focus:ring-1 focus:ring-black ${
          error ? 'border-black' : 'border-slate-300'
        } ${className}`}
        {...rest}
      />
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-black">{error}</span>}
    </label>
  )
})
Input.displayName = 'Input'

export const Textarea = forwardRef(({ label, error, className = '', id, name, ...rest }, ref) => {
  const resolvedId = id ?? name
  return (
    <label className="block text-sm" htmlFor={resolvedId}>
      {label && <span className="mb-1 block font-medium text-slate-700">{label}</span>}
      <textarea
        ref={ref}
        id={resolvedId}
        name={name}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-black focus:ring-1 focus:ring-black ${
          error ? 'border-black' : 'border-slate-300'
        } ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs font-medium text-black">{error}</span>}
    </label>
  )
})
Textarea.displayName = 'Textarea'

export const Select = forwardRef(({ label, error, className = '', id, name, children, ...rest }, ref) => {
  const resolvedId = id ?? name
  return (
    <label className="block text-sm" htmlFor={resolvedId}>
      {label && <span className="mb-1 block font-medium text-slate-700">{label}</span>}
      <select
        ref={ref}
        id={resolvedId}
        name={name}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black ${
          error ? 'border-black' : 'border-slate-300'
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs font-medium text-black">{error}</span>}
    </label>
  )
})
Select.displayName = 'Select'
