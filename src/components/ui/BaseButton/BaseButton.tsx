import type { ComponentPropsWithoutRef } from 'react'

import './BaseButton.css'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  square?: boolean
}

function BaseButton({
  children,
  className,
  square = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = ['base-button', square && 'base-button-square', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

export default BaseButton
