import './SectionHeading.css'

/**
 * Shared editorial section header: eyebrow + title + optional lead paragraph.
 * `title` accepts a node so sections can highlight part of the line in rose.
 */
function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Tag = 'h2',
  id,
  className = '',
}) {
  const classes = ['section-heading', `section-heading--${align}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {eyebrow ? (
        <p
          className={
            align === 'center' ? 'eyebrow eyebrow--centered' : 'eyebrow'
          }
        >
          {eyebrow}
        </p>
      ) : null}

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
