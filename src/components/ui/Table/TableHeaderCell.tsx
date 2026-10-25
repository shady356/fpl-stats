import type { ReactNode } from 'react'

import './Table.css'

export type SortOrder = 'asc' | 'desc'

type TableHeaderCellProps = {
  children: ReactNode
  align?: 'left' | 'center' | 'right'
  title?: string
  /** Current sort order when the table is sorted by this column, otherwise null. */
  sortOrder?: SortOrder | null
  /** Makes the header clickable for sorting; without it the header is a plain label. */
  onSort?: () => void
}

function TableHeaderCell({
  children,
  align,
  title,
  sortOrder = null,
  onSort,
}: TableHeaderCellProps) {
  return (
    <th style={{ textAlign: align }} title={title}>
      {onSort ? (
        TableHeaderButton({ children, sortOrder, onClick: onSort })
      ) : (
        <span className="table-header-label">{children}</span>
      )}
    </th>
  )
}

type TableHeaderButtonProps = {
  children: ReactNode
  sortOrder?: SortOrder | null
  onClick: () => void
}

function TableHeaderButton({ children, sortOrder, onClick }: TableHeaderButtonProps) {
  return (
    <button
      type="button"
      className={`table-header-label table-sort-button${sortOrder ? ' table-sort-button-selected' : ''}`}
      onClick={onClick}
    >
      {children}
      {sortOrder && (
        <span className="material-symbols-rounded">
          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      )}
    </button>
  )
}

export default TableHeaderCell
