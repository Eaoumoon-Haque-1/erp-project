/**
 * @file Shared reusable UI/workflow component: ListPage.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { useMemo, useState } from 'react'
import PageHeader from './PageHeader'

/**
 * Standard list shell.
 * `columns` maps backend keys to headings and optional render functions.
 * `filters` may provide options for exact matching or a custom `matches`.
 * `renderActions` receives the complete row and controls enabled actions.
 */
function ListPage({
  title,
  createLabel,
  createTo,
  filters = [],
  columns,
  rows = [],
  rowKey = 'ID',
  renderActions,
  loading = false,
  message = '',
}) {
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  // One memoized pass applies both global search and feature-specific filters.
  // Search reads raw row values; use column.render only for display formatting.
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        columns.some((column) =>
          String(row[column.key] ?? '')
            .toLowerCase()
            .includes(normalizedQuery),
        )

      const matchesFilters = filters.every((filter) => {
        const value = filterValues[filter.key]
        if (!value) return true
        if (filter.matches) return filter.matches(row, value)
        return String(row[filter.key] ?? '') === value
      })

      return matchesQuery && matchesFilters
    })
  }, [columns, filterValues, filters, query, rows])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  // Clamp the active page because filtering can reduce the number of pages.
  const safePage = Math.min(currentPage, pageCount)
  const startIndex = (safePage - 1) * pageSize
  const visibleRows = filteredRows.slice(startIndex, startIndex + pageSize)

  const updateFilter = (key, value) => {
    setFilterValues((current) => ({ ...current, [key]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilterValues({})
    setQuery('')
    setCurrentPage(1)
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={title} actionLabel={createLabel} actionTo={createTo} />

      <section className={'erp-form-card'}>
      {message && (
        <p className={'erp-form-message'} role={'status'}>
          {message}
        </p>
      )}
      {/* Filters render as selects when options exist, otherwise as search inputs. */}
      {filters.length > 0 && (
        <div className={'erp-list-filters'}>
          {filters.map((filter) =>
            filter.options ? (
              <select
                key={filter.key}
                className={'erp-list-control'}
                aria-label={filter.label}
                value={filterValues[filter.key] ?? ''}
                onChange={(event) => updateFilter(filter.key, event.target.value)}
              >
                <option value={''}>{filter.placeholder}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={filter.key}
                type={'search'}
                className={'erp-list-control'}
                placeholder={filter.placeholder}
                aria-label={filter.label}
                value={filterValues[filter.key] ?? ''}
                onChange={(event) => updateFilter(filter.key, event.target.value)}
              />
            ),
          )}
          <button className={'primary-button w-fit self-center'} type={'button'} onClick={resetFilters}>
            Reset
          </button>
        </div>
      )}

      <div>
        <div className={'erp-list-search-row'}>
          <input
            type={'search'}
            className={'erp-list-control'}
            placeholder={'Search....'}
            aria-label={'Search records'}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <div className={'erp-table-wrap'}>
          {/* The wrapper owns horizontal overflow for genuinely wide tables. */}
          <table className={'erp-table'}>
            <thead>
              <tr>
                <th className={'erp-number-column'}>#</th>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {renderActions && (
                  <th>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className={'erp-empty-cell'}
                    colSpan={columns.length + (renderActions ? 2 : 1)}
                  >
                    Loading...
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td
                    className={'erp-empty-cell'}
                    colSpan={columns.length + (renderActions ? 2 : 1)}
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, index) => (
                  <tr key={row[rowKey]}>
                    <td className={'erp-number-column'}>{startIndex + index + 1}</td>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {renderActions && (
                      <td>
                        {/* The feature decides which row actions are enabled. */}
                        {renderActions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </section>

        <div className={'flex justify-end'}>
          <div className={'erp-pagination'}>
          <button
            type={'button'}
            className={'erp-page-link'}
            disabled={safePage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            {'< Prev'}
          </button>
          <span className={'erp-page-link erp-page-link-active'}>
            {safePage}
          </span>
          <button
            type={'button'}
            className={'erp-page-link'}
            disabled={safePage === pageCount}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            {'Next >'}
          </button>
          </div>
        </div>
    </div>
  )
}

export default ListPage
