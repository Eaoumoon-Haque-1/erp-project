/**
 * @file Shared reusable UI/workflow component: ListPage.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import AutocompleteFilter from './AutocompleteFilter'
import { getEntityNameFromTitle } from './actionAlerts'
import ListActionContext from './ListActionContext'
import PageHeader from './PageHeader'

/**
 * Searchable dropdown filter with write-enable (typing) capability.
 */
function SearchableFilterSelect({ filter, value = '', disabled = false, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const selectedOption = useMemo(
    () =>
      (filter.options || []).find(
        (opt) =>
          String(opt.value).toLowerCase() === String(value).toLowerCase() ||
          String(opt.label).toLowerCase() === String(value).toLowerCase(),
      ),
    [filter.options, value],
  )

  const displayValue = useMemo(() => {
    if (isTyping) return value
    if (selectedOption) return selectedOption.label
    return value
  }, [isTyping, selectedOption, value])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsTyping(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const filteredOptions = useMemo(() => {
    const options = filter.options || []
    if (!isTyping || !displayValue.trim()) {
      return options
    }
    const query = displayValue.trim().toLowerCase()
    return options.filter((opt) => {
      const label = String(opt.label ?? '').toLowerCase()
      const code = String(opt.code ?? '').toLowerCase()
      const val = String(opt.value ?? '').toLowerCase()
      return label.includes(query) || code.includes(query) || val.includes(query)
    })
  }, [displayValue, filter.options, isTyping])

  const handleInputChange = (event) => {
    const nextText = event.target.value
    setIsTyping(true)
    if (!isOpen) setIsOpen(true)
    onChange(nextText)
  }

  const handleSelectOption = (optionValue) => {
    setIsTyping(false)
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleClear = (event) => {
    event.stopPropagation()
    setIsTyping(false)
    onChange('')
    if (inputRef.current) inputRef.current.focus()
  }

  return (
    <div ref={rootRef} className={'relative'}>
      <div className={'relative flex items-center'}>
        <input
          ref={inputRef}
          type={'text'}
          autoComplete={'off'}
          className={'erp-list-control pr-12'}
          placeholder={filter.placeholder}
          aria-label={filter.label}
          value={displayValue}
          disabled={disabled}
          onFocus={() => !disabled && setIsOpen(true)}
          onClick={() => !disabled && setIsOpen(true)}
          onChange={handleInputChange}
        />

        {value && !disabled && (
          <button
            type={'button'}
            onClick={handleClear}
            className={
              'absolute right-6 p-1 text-gray-400 hover:text-gray-600 focus:outline-none text-xs leading-none'
            }
            title={'Clear'}
            aria-label={`Clear ${filter.label}`}
          >
            ✕
          </button>
        )}

        <button
          type={'button'}
          disabled={disabled}
          onClick={() => {
            if (disabled) return
            setIsTyping(false)
            setIsOpen((prev) => !prev)
            if (!isOpen && inputRef.current) inputRef.current.focus()
          }}
          className={
            'absolute right-1.5 p-1 text-gray-500 hover:text-gray-700 focus:outline-none shrink-0'
          }
          aria-label={`Toggle ${filter.label} options`}
        >
          <svg
            className={`w-3.5 h-3.5 fill-current transform transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox={'0 0 20 20'}
          >
            <path
              d={
                'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              }
            />
          </svg>
        </button>
      </div>

      {isOpen && !disabled && (
        <div
          role={'listbox'}
          aria-label={filter.label}
          className={
            'absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100 text-sm'
          }
        >
          <div
            role={'option'}
            aria-selected={!value}
            className={`px-3 py-1.5 cursor-pointer transition-colors ${
              !value
                ? 'bg-teal-50 text-teal-800 font-semibold'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => handleSelectOption('')}
          >
            {filter.placeholder}
          </div>

          {filteredOptions.length === 0 ? (
            <div className={'px-3 py-2 text-center text-gray-400 text-xs'}>
              No matching options found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected =
                Boolean(value) &&
                (String(option.value).toLowerCase() ===
                  String(value).toLowerCase() ||
                  String(option.label).toLowerCase() ===
                    String(value).toLowerCase())
              return (
                <div
                  key={option.value}
                  role={'option'}
                  aria-selected={isSelected}
                  className={`px-3 py-1.5 cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-semibold'
                      : 'text-gray-800 hover:bg-teal-50/60 hover:text-teal-900'
                  }`}
                  onClick={() => handleSelectOption(option.value)}
                >
                  <div className={'flex items-center gap-1.5 truncate'}>
                    <span className={'truncate'}>{option.label}</span>
                    {option.code && (
                      <span
                        className={
                          'px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 text-[10px] font-mono font-semibold shrink-0'
                        }
                      >
                        {option.code}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className={'text-teal-600 font-bold shrink-0'}>✓</span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

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
    setFilterValues((current) => {
      const next = { ...current, [key]: value }
      filters.forEach((filter) => {
        if (filter.dependsOn === key) next[filter.key] = ''
      })
      return next
    })
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilterValues({})
    setQuery('')
    setCurrentPage(1)
  }

  return (
    <ListActionContext.Provider value={getEntityNameFromTitle(title)}>
    <div className={'erp-list-page'}>
      <PageHeader title={title} actionLabel={createLabel} actionTo={createTo} />

      <section className={'erp-form-card'}>
      {/* Filters render as searchable comboboxes, selects, or search inputs. */}
      {filters.length > 0 && (
        <div
          className={[
            'erp-list-filters',
            filters.length === 4 ? 'md:!grid-cols-[repeat(4,minmax(0,1fr))_auto]' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {filters.map((filter) => {
            const options = typeof filter.options === 'function'
              ? filter.options(filterValues)
              : filter.options || (filter.searchable
                ? [...new Map(rows
                  .filter((row) => row[filter.key] != null && String(row[filter.key]).trim())
                  .map((row) => {
                    const optionValue = String(row[filter.optionValueKey || filter.key])
                    const optionLabel = String(row[filter.optionLabelKey || filter.key])
                    return [optionValue, { value: optionValue, label: optionLabel }]
                  })).values()]
                : undefined)
            const disabled = typeof filter.disabled === 'function'
              ? filter.disabled(filterValues)
              : filter.disabled || (filter.dependsOn && !filterValues[filter.dependsOn])

            return filter.searchable && filter.options && filter.matches && Array.isArray(options) ? (
              <SearchableFilterSelect
                key={filter.key}
                filter={{ ...filter, options }}
                value={filterValues[filter.key] ?? ''}
                disabled={disabled}
                onChange={(val) => updateFilter(filter.key, val)}
              />
            ) : filter.searchable && options ? (
              <AutocompleteFilter
                key={`${filter.key}:${filterValues[filter.key] ?? ''}`}
                label={filter.label}
                placeholder={filter.placeholder}
                options={options}
                value={filterValues[filter.key] ?? ''}
                disabled={disabled}
                onChange={(value) => updateFilter(filter.key, value)}
              />
            ) : options ? (
              <select
                key={filter.key}
                className={'erp-list-control'}
                aria-label={filter.label}
                value={filterValues[filter.key] ?? ''}
                disabled={disabled}
                onChange={(event) => updateFilter(filter.key, event.target.value)}
              >
                <option value={''}>{filter.placeholder}</option>
                {options.map((option) => (
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
                disabled={disabled}
                onChange={(event) => updateFilter(filter.key, event.target.value)}
              />
            )
          })}
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
    </ListActionContext.Provider>
  )
}

export default ListPage
