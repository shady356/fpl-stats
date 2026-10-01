import type { ComponentPropsWithoutRef } from 'react'

import './Table.css'

type TableProps = ComponentPropsWithoutRef<'table'> & {
  /**
   * Wrap the table in a horizontally scrolling container. Off by default, since the
   * wrapper becomes the scroll container and the sticky header then no longer sticks
   * to the page.
   */
  scrollable?: boolean
}

function Table({ className, scrollable = false, ...rest }: TableProps) {
  const classes = ['table', className].filter(Boolean).join(' ')
  const table = <table className={classes} {...rest} />

  return scrollable ? <div className="table-scroll-wrapper">{table}</div> : table
}

export default Table
