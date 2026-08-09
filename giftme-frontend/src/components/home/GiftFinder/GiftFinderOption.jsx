import Icon from '../../common/Icon.jsx'

/**
 * One answer in a step.
 *
 * A real <button> carrying radio semantics rather than a styled <div>: the
 * group above owns arrow-key movement and the roving tabindex, so Tab reaches
 * the chosen option (or the first one, when nothing is chosen yet) and the
 * arrows move between them — the same keyboard contract as native radios.
 *
 * `focus-visible:rounded-…` is not decoration. globals.css sets a 4px radius on
 * every :focus-visible element, and an unqualified utility loses to it; the
 * variant raises the specificity enough for the tile to keep its own corners
 * while focused.
 */
function GiftFinderOption({ option, checked, tabbable, onSelect }) {
  const shell = checked
    ? 'border-olive bg-olive-tint'
    : 'border-line bg-ivory hover:border-line-strong hover:bg-bone'

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onSelect(option.value)}
      className={`group flex min-h-[3.25rem] w-full items-center gap-2.5 rounded-(--radius-md) border px-2.5 py-2.5 text-left transition-[background-color,border-color] duration-200 ease-brand focus-visible:rounded-(--radius-md) sm:min-h-[3.5rem] sm:gap-3 sm:px-3.5 ${shell}`}
    >
      {option.icon ? (
        <Icon
          name={option.icon}
          size={19}
          strokeWidth={1.4}
          className="shrink-0 text-olive-deep"
        />
      ) : null}

      <span className="flex min-w-0 flex-col">
        <span
          className={`block text-[0.8125rem] leading-snug sm:text-sm ${
            checked ? 'font-medium' : ''
          }`}
        >
          {option.label}
        </span>

        {option.note ? (
          <span className="mt-0.5 block text-[0.72rem] leading-snug text-ink-soft">
            {option.note}
          </span>
        ) : null}
      </span>

      {/* Always in the layout, never toggled in and out: a check that took up
          space only once chosen would shift every label beside it. */}
      <span
        aria-hidden="true"
        className={`ms-auto flex size-4 shrink-0 items-center justify-center rounded-full bg-olive-deep text-white transition-opacity duration-200 ${
          checked ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Icon name="check" size={10} strokeWidth={3} />
      </span>
    </button>
  )
}

export default GiftFinderOption
