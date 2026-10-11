import type { ComponentPropsWithoutRef } from 'react'

import './BaseSegmentedButtons.css'

type SegmentedButtonsProps = ComponentPropsWithoutRef<'div'>

function BaseSegmentedButtons({ children, className, ...rest }: SegmentedButtonsProps) {
  const classes = ['base-segmented-buttons', className].filter(Boolean).join(' ')

  return (
    <div role="group" className={classes} {...rest}>
      {children}
    </div>
  )
}

export default BaseSegmentedButtons
