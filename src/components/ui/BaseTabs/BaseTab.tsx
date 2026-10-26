import type { ComponentPropsWithoutRef } from 'react'

type TabProps = ComponentPropsWithoutRef<'button'> & {
  selected?: boolean
}

function BaseTab({ className, selected = false, type = 'button', ...rest }: TabProps) {
  const classes = ['base-tab', selected && 'base-tab-selected', className].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={classes}
      {...rest}
    />
  )
}

export default BaseTab
