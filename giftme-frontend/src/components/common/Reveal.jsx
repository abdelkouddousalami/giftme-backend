import { useEffect, useRef, useState } from 'react'

/**
 * Subtle one-shot scroll reveal (fade + 18px rise).
 *
 * Deliberately minimal: no library, no parallax, observer disconnects after the
 * first intersection, and `prefers-reduced-motion` disables the transform in
 * globals.css. Falls back to "always visible" where IntersectionObserver is
 * unavailable, so content is never hidden by a missing API.
 */
function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const classes = ['reveal', isVisible ? 'is-visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      ref={ref}
      className={classes}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal
