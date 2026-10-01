import type { ComponentPropsWithoutRef } from 'react'

import './BaseButton.css'

type ButtonProps = ComponentPropsWithoutRef<'button'>

function BaseButton({ children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={className ? `base-button ${className}` : 'base-button'}
      {...rest}
    >
      {children}
    </button>
  )
}

export default BaseButton
