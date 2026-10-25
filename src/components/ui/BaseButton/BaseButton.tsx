import type { ComponentPropsWithoutRef } from 'react'

import './BaseButton.scss'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  square?: boolean
  ghost?: boolean
}

function BaseButton({
  children,
  className,
  square = false,
  type = 'button',
  ghost = false,
  ...rest
}: ButtonProps) {
  const classes = [
    'base-button',
    square && 'base-button-square',
    ghost && 'base-button-ghost',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

export default BaseButton
