import { Link } from 'react-router-dom'
import Icon from './Icon'
import './Button.css'

/**
 * The single call-to-action primitive.
 *
 * Renders the right element for the job — never a div:
 *   `to`    -> react-router <Link>  (internal navigation)
 *   `href`  -> <a>                  (external / anchor)
 *   neither -> <button>             (actions)
 */
function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  trailingIcon,
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span className="btn__label">{children}</span>
      {trailingIcon ? (
        // Every call site uses this for a "forward" affordance (arrowRight) -
        // in RTL, forward points the other way, so the icon mirrors with the
        // reading direction rather than staying pinned to the right.
        <Icon name={trailingIcon} size={18} className="btn__icon rtl:-scale-x-100" />
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  )
}

export default Button
