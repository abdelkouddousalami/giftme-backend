import { useId } from 'react'

/**
 * Quantity control.
 *
 * `max` is the product's real backend stock, so the stepper cannot be used to
 * build a basket the order endpoint would reject — `POST /api/orders` still
 * validates and atomically reserves stock server-side, this just avoids sending
 * a request that is guaranteed to fail.
 */
function QuantityStepper({ value, onChange, min = 1, max = 99, disabled = false, label = 'Quantity' }) {
  const id = useId()
  const clamp = (next) => Math.min(max, Math.max(min, next))

  return (
    <div className="inline-flex items-center">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="flex size-10 items-center justify-center rounded-l-(--radius-sm) border border-line-input text-ink transition-colors duration-200 hover:bg-bone disabled:cursor-not-allowed disabled:text-ink-soft"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M5.5 12h13" />
        </svg>
      </button>

      {/* No preflight: an <input> keeps its UA border and appearance unless reset. */}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10)
          if (!Number.isNaN(next)) onChange(clamp(next))
        }}
        className="h-10 w-14 appearance-none border-y border-line-input bg-white text-center text-ink [font-size:var(--text-sm)] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="flex size-10 items-center justify-center rounded-r-(--radius-sm) border border-line-input text-ink transition-colors duration-200 hover:bg-bone disabled:cursor-not-allowed disabled:text-ink-soft"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5.5v13" />
          <path d="M5.5 12h13" />
        </svg>
      </button>
    </div>
  )
}

export default QuantityStepper
