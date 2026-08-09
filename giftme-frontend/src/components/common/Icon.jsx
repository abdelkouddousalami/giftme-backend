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
  user: (
    <>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
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
  arrowUpRight: (
    <>
      <path d="M7.5 16.5 16.5 7.5" />
      <path d="M9 7.5h7.5V15" />
    </>
  ),
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  check: <path d="m5 12.6 4.6 4.6L19 7.2" />,
  /* The accordion's two states. A plus that becomes a minus is quieter than a
     rotating chevron and reads as "open / close" rather than "there is more
     below". */
  plus: (
    <>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </>
  ),
  minus: <path d="M5.5 12h13" />,
  box: (
    <>
      <path d="M3.4 7.8 12 3.6l8.6 4.2v8.4L12 20.4l-8.6-4.2z" />
      <path d="m3.4 7.8 8.6 4.2 8.6-4.2" />
      <path d="M12 12v8.4" />
    </>
  ),
  lock: (
    <>
      <rect x="4.6" y="10.4" width="14.8" height="9.6" rx="2" />
      <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6" />
    </>
  ),
  /* The name/monogram line — an "A" with a rule under it, for the
     personalization section's "your names" layer. */
  type: (
    <>
      <path d="M5.4 15.6 12 4.4l6.6 11.2" />
      <path d="M7.8 12.2h8.4" />
      <path d="M4.6 19.6h14.8" />
    </>
  ),
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
  person: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.4 20.4a6.6 6.6 0 0 1 13.2 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9.2" cy="8.2" r="3.3" />
      <path d="M2.9 20.4a6.3 6.3 0 0 1 12.6 0" />
      <path d="M16.1 5.2a3.3 3.3 0 0 1 0 6" />
      <path d="M17.5 15a6.3 6.3 0 0 1 3.6 5.4" />
    </>
  ),
  family: (
    <>
      <circle cx="6.4" cy="9" r="2.5" />
      <circle cx="12" cy="6.9" r="2.6" />
      <circle cx="17.6" cy="9" r="2.5" />
      <path d="M2.7 20.4c1.4-3.9 4.9-6.2 9.3-6.2s7.9 2.3 9.3 6.2" />
    </>
  ),
  home: (
    <>
      <path d="M3.6 10.3 12 3.7l8.4 6.6v9.8H3.6z" />
      <path d="M9.5 20.1v-6h5v6" />
    </>
  ),
  cake: (
    <>
      <rect x="3.8" y="11.6" width="16.4" height="8.8" rx="2" />
      <path d="M3.8 15.9h16.4" />
      <path d="M12 11.6V8.5" />
      <path d="M12 5.3c1.1 1.3 1.1 2.4 0 3.2-1.1-.8-1.1-1.9 0-3.2Z" />
    </>
  ),
  /* Two interlocking rings — the anniversary mark. */
  rings: (
    <>
      <circle cx="9.2" cy="14.2" r="5.4" />
      <circle cx="14.8" cy="14.2" r="5.4" />
    </>
  ),
  envelope: (
    <>
      <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.2" />
      <path d="m3.7 7 8.3 6.2L20.3 7" />
    </>
  ),
  truck: (
    <>
      <path d="M2.8 6.4h10.6v9.2H2.8z" />
      <path d="M13.4 9.6h3.9l3 3.1v2.9h-6.9z" />
      <circle cx="7.1" cy="17.6" r="1.9" />
      <circle cx="16.9" cy="17.6" r="1.9" />
    </>
  ),
  cash: (
    <>
      <rect x="2.6" y="6" width="18.8" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.7" />
      <path d="M6.2 9.4v5.2M17.8 9.4v5.2" />
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
  /* The brand's "discovery" motif. Filled, because a hairline four-point star
     disappears below ~14px. */
  sparkle: {
    filled: true,
    node: (
      <path d="M12 2.8C12.9 8.4 15.6 11.1 21.2 12 15.6 12.9 12.9 15.6 12 21.2 11.1 15.6 8.4 12.9 2.8 12 8.4 11.1 11.1 8.4 12 2.8Z" />
    ),
  },
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
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.4c2.5 2.3 3.9 5.3 3.9 8.6s-1.4 6.3-3.9 8.6c-2.5-2.3-3.9-5.3-3.9-8.6S9.5 5.7 12 3.4Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.3" />
      <path d="M12 2.8v2.6M12 18.6v2.6M4.5 4.5l1.85 1.85M17.65 17.65l1.85 1.85M2.8 12h2.6M18.6 12h2.6M4.5 19.5l1.85-1.85M17.65 6.35l1.85-1.85" />
    </>
  ),
  moon: (
    <path d="M20.2 14.4A8.6 8.6 0 1 1 9.6 3.8a7 7 0 0 0 10.6 10.6Z" />
  ),
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
