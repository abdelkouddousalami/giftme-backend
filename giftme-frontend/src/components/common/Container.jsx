import './Container.css'

/**
 * Horizontal layout wrapper: max-width + responsive gutters.
 * `size` picks between the default editorial width and a narrow reading width.
 */
function Container({
  as: Tag = 'div',
  size = 'default',
  className = '',
  children,
  ...rest
}) {
  const classes = ['container', `container--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}

export default Container
