import { Link } from 'react-router-dom'
import { paths } from '../../app/paths.js'
import './Brand.css'

/** The GiftMe wordmark. `tone="inverse"` is for dark surfaces. */
function Brand({ tone = 'default', size = 'md', className = '' }) {
  const classes = ['brand', `brand--${tone}`, `brand--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Link to={paths.home} className={classes} aria-label="GiftMe, home">
      Gift<span className="brand__accent">Me</span>
    </Link>
  )
}

export default Brand
