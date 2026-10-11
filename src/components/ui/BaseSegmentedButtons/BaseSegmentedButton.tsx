import type { ComponentPropsWithoutRef } from 'react'

import BaseButton from '../BaseButton/BaseButton'

type SegmentedButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  selected?: boolean
}

function BaseSegmentedButton({ className, selected = false, ...rest }: SegmentedButtonProps) {
  const classes = [
    'base-segmented-button',
    selected && 'base-segmented-button-selected',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <BaseButton aria-pressed={selected} className={classes} {...rest} />
}

export default BaseSegmentedButton
