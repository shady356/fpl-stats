import type { ComponentPropsWithoutRef, KeyboardEvent } from 'react'

import './BaseTabs.css'

type TabsProps = ComponentPropsWithoutRef<'div'>

/** Keys that move between tabs, and where they move. */
const TAB_KEYS: Record<string, (index: number, count: number) => number> = {
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowRight: (index, count) => (index + 1) % count,
  Home: () => 0,
  End: (_, count) => count - 1,
}

function BaseTabs({ children, className, onKeyDown, ...rest }: TabsProps) {
  const classes = ['base-tabs', className].filter(Boolean).join(' ')

  // Arrow keys move focus to the next tab and select it.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    const move = TAB_KEYS[event.key]
    if (!move) return

    const tabs = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement)
    if (index === -1) return

    event.preventDefault()
    const next = tabs[move(index, tabs.length)]
    next.focus()
    next.click()
  }

  return (
    <div role="tablist" className={classes} onKeyDown={handleKeyDown} {...rest}>
      {children}
    </div>
  )
}

export default BaseTabs
