import { useId } from 'react'

/**
 * Form controls.
 *
 * Tailwind runs here without preflight, so `<input>`, `<select>` and
 * `<textarea>` arrive carrying their user-agent border, background and
 * appearance. Every control below therefore resets `appearance` and states its
 * own border explicitly — inheriting the UA look is not an option.
 *
 * Border colour is `--color-border-input` (3.3:1 on ivory), which is the WCAG
 * 1.4.11 non-text contrast minimum for a form control.
 */

const CONTROL_CLASS = [
  'w-full appearance-none rounded-(--radius-sm) border border-line-input bg-white',
  'px-3.5 py-2.5 text-ink [font-size:var(--text-sm)]',
  'transition-colors duration-200',
  'placeholder:text-ink-soft',
  'focus:border-burgundy focus:outline-none',
  'disabled:cursor-not-allowed disabled:bg-bone disabled:text-ink-soft',
].join(' ')

/** Label + control + hint/error, wired up with a generated id. */
export function Field({ label, hint, error, required, htmlFor, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink uppercase"
        >
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-1 text-clay-deep">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p role="alert" className="text-burgundy-deep [font-size:var(--text-xs)]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-ink-soft [font-size:var(--text-xs)]">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextField({ label, hint, error, required, className, ...rest }) {
  const generatedId = useId()
  const id = rest.id ?? generatedId

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} className={className}>
      <input
        {...rest}
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        className={[CONTROL_CLASS, error ? 'border-burgundy' : ''].join(' ')}
      />
    </Field>
  )
}

export function TextAreaField({ label, hint, error, required, rows = 4, className, ...rest }) {
  const generatedId = useId()
  const id = rest.id ?? generatedId

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} className={className}>
      <textarea
        {...rest}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        className={[CONTROL_CLASS, 'resize-y', error ? 'border-burgundy' : ''].join(' ')}
      />
    </Field>
  )
}

export function SelectField({ label, hint, error, required, children, className, ...rest }) {
  const generatedId = useId()
  const id = rest.id ?? generatedId

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} className={className}>
      <div className="relative">
        <select
          {...rest}
          id={id}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          className={[CONTROL_CLASS, 'pe-10', error ? 'border-burgundy' : ''].join(' ')}
        >
          {children}
        </select>
        {/* appearance-none removed the native arrow — draw our own. */}
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="pointer-events-none absolute top-1/2 end-3.5 -translate-y-1/2 text-ink-soft"
        >
          <path d="m6 9.5 6 6 6-6" />
        </svg>
      </div>
    </Field>
  )
}

export { CONTROL_CLASS }
