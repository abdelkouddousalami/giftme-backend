/**
 * Single thin-line icon set for the whole app.
 *
 * Keeping every glyph in one map avoids an icon dependency and a folder of
 * one-line components. Icons inherit `currentColor`, so colour is controlled
 * entirely by CSS.
 *
 * Icons are decorative by default (`aria-hidden`). Pass a `title` when an icon
 * is the only content of a control and no visible label exists.
 */

const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.2 16.2 21 21" />
    </>
  ),
  bag: (
    <>
      <path d="M5.6 7.5h12.8l1.1 13H4.5z" />
      <path d="M9 10V6.6a3 3 0 0 1 6 0V10" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7.5h16" />
      <path d="M4 12.5h16" />
      <path d="M4 17.5h11" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  check: <path d="m5 12.6 4.6 4.6L19 7.2" />,
  gift: (
    <>
      <rect x="3.2" y="8" width="17.6" height="4.2" rx="1" />
      <path d="M5 12.2v8.3h14v-8.3" />
      <path d="M12 8v12.5" />
      <path d="M12 8H8.6a2.25 2.25 0 0 1 0-4.5C10.7 3.5 12 8 12 8Z" />
      <path d="M12 8h3.4a2.25 2.25 0 0 0 0-4.5C13.3 3.5 12 8 12 8Z" />
    </>
  ),
  pen: (
    <>
      <path d="m4 20 1.1-4.1L16.6 4.4a2.1 2.1 0 0 1 3 3L8.1 18.9 4 20Z" />
      <path d="m14.6 6.4 3 3" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.2" height="6.2" rx="1.2" />
      <rect x="14.3" y="3.5" width="6.2" height="6.2" rx="1.2" />
      <rect x="3.5" y="14.3" width="6.2" height="6.2" rx="1.2" />
      <path d="M14.3 14.3h3v3h-3z" />
      <path d="M20.5 14.3v2M20.5 20.5h-3M20.5 19.4v1.1" />
    </>
  ),
  heart: (
    <path d="M12 20.4S3.9 15.5 3.9 10a4.4 4.4 0 0 1 8.1-2.4A4.4 4.4 0 0 1 20.1 10c0 5.5-8.1 10.4-8.1 10.4Z" />
  ),
  truck: (
    <>
      <path d="M2.8 6.4h10.6v9.2H2.8z" />
      <path d="M13.4 9.6h3.9l3 3.1v2.9h-6.9z" />
      <circle cx="7.1" cy="17.6" r="1.9" />
      <circle cx="16.9" cy="17.6" r="1.9" />
    </>
  ),
  photo: (
    <>
      <rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2" />
      <circle cx="8.6" cy="10.1" r="1.5" />
      <path d="m20.6 15.4-4.7-4.6-6.9 7.8" />
    </>
  ),
  music: (
    <>
      <path d="M9.2 17.4V6l9.6-2v11.4" />
      <circle cx="6.7" cy="17.4" r="2.5" />
      <circle cx="16.3" cy="15.4" r="2.5" />
    </>
  ),
  message: (
    <path d="M20.4 11.9a7.6 7.6 0 0 1-11 6.8L4 20.4l1.5-5.3A7.6 7.6 0 1 1 20.4 11.9Z" />
  ),
  star: {
    filled: true,
    node: (
      <path d="M12 3.1 14.7 8.7l6.2.9-4.5 4.3 1.1 6.1L12 17.1l-5.5 2.9 1.1-6.1-4.5-4.3 6.2-.9z" />
    ),
  },
  play: { filled: true, node: <path d="M8.6 5.9 19 12 8.6 18.1z" /> },
  instagram: (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: {
    filled: true,
    node: (
      <path d="M14.3 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A21 21 0 0 0 15.1 3.5c-2.4 0-4 1.45-4 4.12V9.9H8.4V13h2.7v8z" />
    ),
  },
  pinterest: {
    filled: true,
    node: (
      <path d="M12 2.6c-5.2 0-8 3.4-8 6.9 0 1.6.9 3.6 2.3 4.2.2.1.3 0 .4-.2l.3-1.2c0-.1 0-.2-.1-.3-.5-.6-.8-1.5-.8-2.4 0-2.4 1.8-4.7 4.9-4.7 2.7 0 4.5 1.8 4.5 4.3 0 2.9-1.4 4.9-3.3 4.9-1 0-1.8-.9-1.5-1.9.3-1.3.9-2.6.9-3.5 0-.8-.4-1.5-1.3-1.5-1.1 0-1.9 1.1-1.9 2.5 0 .9.3 1.5.3 1.5l-1.2 5.2c-.3 1.5-.1 3.3 0 3.5 0 .1.2.1.2 0 .1-.1 1.5-1.8 1.9-3.4l.7-2.7c.4.7 1.4 1.3 2.5 1.3 3.3 0 5.5-3 5.5-7 0-2.6-2.3-5.6-6.6-5.6z" />
    ),
  },
}

function Icon({ name, size = 20, strokeWidth = 1.5, title, className }) {
  const entry = ICONS[name]

  if (!entry) return null

  const filled = entry.filled === true
  const node = filled ? entry.node : entry

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {node}
    </svg>
  )
}

export default Icon
