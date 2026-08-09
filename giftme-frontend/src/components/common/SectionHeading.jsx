import './SectionHeading.css'

/**
 * Shared editorial section header: eyebrow + title + optional lead paragraph.
 *
 * `title` accepts a node so a section can set part of the line as an <em>, which
 * the stylesheet renders as a burgundy italic — one emphasis mechanic, used in
 * every heading on the page, so the sections read as chapters of one document.
 * `tone="inverse"` is the same object on the two ink bands, where the italic
 * switches to clay because burgundy disappears against near-black.
 */
function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'default',
  as: Tag = 'h2',
  id,
  className = '',
}) {
  const classes = [
    'section-heading',
    `section-heading--${align}`,
    tone === 'inverse' ? 'section-heading--inverse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const eyebrowClasses = [
    'eyebrow',
    align === 'center' ? 'eyebrow--centered' : '',
    tone === 'inverse' ? 'eyebrow--inverse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {eyebrow ? <p className={eyebrowClasses}>{eyebrow}</p> : null}

      <Tag id={id} className="section-heading__title">
        {title}
      </Tag>

      {description ? (
        <p className="section-heading__description">{description}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading
