import { ListSkeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import Pagination from '@/components/Pagination'

/**
 * The one list component (CLAUDE.md rule 6): table on desktop, cards on mobile.
 *
 * columns:    [{ key, header, render?, className? }]
 * renderCard: (row) => JSX — mobile card body
 * toolbar:    JSX rendered inside the top of the bordered container
 * empty:      props for <EmptyState>
 * pagination: props for <Pagination> (meta, onPage, onPerPage, onRefresh)
 */
export default function DataList({
  columns = [],
  rows = [],
  rowKey = (row) => row.id,
  onRowClick,
  renderCard,
  toolbar,
  loading = false,
  empty,
  pagination,
}) {
  const hasRows = rows.length > 0

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {toolbar && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            {toolbar}
          </div>
        )}

        {loading ? (
          <ListSkeleton />
        ) : !hasRows ? (
          <EmptyState {...(empty ?? { title: 'Nothing here yet' })} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink-muted uppercase">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-2.5 font-medium ${col.className ?? ''}`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((row) => (
                    <tr
                      key={rowKey(row)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={
                        onRowClick
                          ? 'cursor-pointer transition-colors hover:bg-surface-2'
                          : ''
                      }
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-ink ${col.className ?? ''}`}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-line lg:hidden">
              {rows.map((row) => (
                <div
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`p-4 ${onRowClick ? 'cursor-pointer active:bg-surface-2' : ''}`}
                >
                  {renderCard ? (
                    renderCard(row)
                  ) : (
                    <DefaultCard row={row} columns={columns} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {pagination && !loading && hasRows && <Pagination {...pagination} />}
    </div>
  )
}

function DefaultCard({ row, columns }) {
  return (
    <dl className="space-y-1">
      {columns.map((col) => (
        <div key={col.key} className="flex justify-between gap-3 text-sm">
          <dt className="text-ink-muted">{col.header}</dt>
          <dd className="text-right text-ink">
            {col.render ? col.render(row) : row[col.key]}
          </dd>
        </div>
      ))}
    </dl>
  )
}
