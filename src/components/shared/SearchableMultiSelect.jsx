/**
 * @file Reusable searchable multi-select component with checkbox dropdown, tag pills, and search filtering.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function parseValueToArray(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function SearchableMultiSelect({
  id,
  name,
  value = '',
  options = [],
  placeholder = '--Select/Write Store--',
  disabled = false,
  readOnly = false,
  error = false,
  allowClear = true,
  fallbackDisplay = '',
  onChange = () => {},
  className = '',
  inputClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [coords, setCoords] = useState(null)
  const rootRef = useRef(null)
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)

  const selectedValues = useMemo(() => parseValueToArray(value), [value])

  const optionMap = useMemo(() => {
    const map = new Map()
    options.forEach((opt) => {
      map.set(String(opt.value), opt)
    })
    return map
  }, [options])

  const updateCoords = useCallback(() => {
    if (!rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()

    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false)
      return
    }

    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const estimatedHeight = 280
    const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow

    const dropdownWidth = Math.max(rect.width, 280)
    let left = rect.left
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - dropdownWidth - 8)
    }

    const maxHeight = Math.max(
      150,
      Math.min(280, (openUpward ? spaceAbove : spaceBelow) - 12),
    )

    setCoords({
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
      left,
      width: dropdownWidth,
      maxHeight,
      openUpward,
    })
  }, [])

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords()
    }
  }, [isOpen, updateCoords])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleScrollOrResize = () => {
      updateCoords()
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, updateCoords])

  useEffect(() => {
    const handlePointerDown = (event) => {
      const isInsideRoot = rootRef.current && rootRef.current.contains(event.target)
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target)
      if (!isInsideRoot && !isInsideDropdown) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options
    }
    const query = searchTerm.trim().toLowerCase()
    return options.filter((opt) => {
      const label = String(opt.label ?? '').toLowerCase()
      const code = String(opt.code ?? '').toLowerCase()
      const val = String(opt.value ?? '').toLowerCase()
      return label.includes(query) || code.includes(query) || val.includes(query)
    })
  }, [options, searchTerm])

  const notifyChange = (nextValues) => {
    const commaSeparated = nextValues.join(',')
    onChange(commaSeparated, nextValues)
  }

  const toggleOption = (optVal) => {
    const strVal = String(optVal)
    let next
    if (selectedValues.includes(strVal)) {
      next = selectedValues.filter((v) => v !== strVal)
    } else {
      next = [...selectedValues, strVal]
    }
    notifyChange(next)
  }

  const handleRemoveOne = (event, optVal) => {
    event.stopPropagation()
    const strVal = String(optVal)
    const next = selectedValues.filter((v) => v !== strVal)
    notifyChange(next)
  }

  const handleClearAll = (event) => {
    event.stopPropagation()
    notifyChange([])
  }

  const handleSelectAll = (event) => {
    event.stopPropagation()
    const allFilteredVals = filteredOptions.map((o) => String(o.value))
    const merged = Array.from(new Set([...selectedValues, ...allFilteredVals]))
    notifyChange(merged)
  }

  const isDisabled = disabled || readOnly

  // Read-only view
  if (readOnly) {
    const labels = selectedValues
      .map((val) => optionMap.get(val)?.label || val)
      .filter(Boolean)
    const displayText = labels.length ? labels.join(', ') : fallbackDisplay || '-'

    return (
      <div className={`relative ${className}`}>
        <div
          className={
            'w-full min-h-[32px] px-2.5 py-1 border border-gray-300 rounded bg-gray-100 text-gray-700 text-xs flex flex-wrap items-center gap-1.5 cursor-not-allowed'
          }
        >
          {labels.length > 0 ? (
            labels.map((lbl, idx) => (
              <span
                key={idx}
                className={
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200'
                }
              >
                {lbl}
              </span>
            ))
          ) : (
            <span>{displayText}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* Trigger Box */}
      <div
        id={id}
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => {
          if (isDisabled) return
          if (!isOpen) {
            updateCoords()
          }
          setIsOpen((prev) => !prev)
        }}
        onKeyDown={(e) => {
          if (isDisabled) return
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault()
            if (!isOpen) {
              updateCoords()
              setIsOpen(true)
            }
          }
        }}
        className={[
          'w-full min-h-[32px] rounded border px-2 py-1 text-xs transition-colors cursor-pointer flex items-center justify-between gap-1.5 focus:outline-none',
          error
            ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
            : 'border-gray-300 bg-white text-gray-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600',
          isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-75' : '',
          inputClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Selected Items or Placeholder */}
        <div className={'flex flex-wrap items-center gap-1 flex-1 min-w-0 py-0.5'}>
          {selectedValues.length === 0 ? (
            <span className={'text-gray-400 select-none'}>
              {fallbackDisplay || placeholder}
            </span>
          ) : (
            selectedValues.map((val) => {
              const opt = optionMap.get(val)
              const label = opt?.label || val
              return (
                <span
                  key={val}
                  className={
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 shrink-0'
                  }
                >
                  <span className={'max-w-[200px] truncate'}>{label}</span>
                  {!isDisabled && (
                    <button
                      type={'button'}
                      onClick={(e) => handleRemoveOne(e, val)}
                      className={
                        'text-teal-600 hover:text-teal-900 hover:bg-teal-100 rounded p-0.5 leading-none focus:outline-none'
                      }
                      title={'Remove'}
                      aria-label={`Remove ${label}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              )
            })
          )}
        </div>

        {/* Clear All & Dropdown Arrow */}
        <div className={'flex items-center gap-1 shrink-0'}>
          {selectedValues.length > 0 && allowClear && !isDisabled && (
            <button
              type={'button'}
              onClick={handleClearAll}
              className={'p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none text-xs leading-none'}
              title={'Clear all selected'}
              aria-label={'Clear all'}
            >
              ✕
            </button>
          )}

          <span className={'p-0.5 text-gray-400 shrink-0'}>
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
          </span>
        </div>
      </div>

      {/* Dropdown Menu via Portal */}
      {isOpen &&
        !isDisabled &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            role={'listbox'}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 99999,
            }}
            className={
              'bg-white rounded-md border border-gray-200 shadow-xl flex flex-col text-xs text-gray-800 animate-in fade-in duration-100 overflow-hidden'
            }
          >
            {/* Header: Search Input */}
            <div className={'p-2 border-b border-gray-100 bg-gray-50/70'}>
              <input
                ref={searchInputRef}
                type={'text'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={'Type to filter stores...'}
                className={
                  'w-full h-7 px-2.5 rounded border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white'
                }
              />
              <div className={'flex items-center justify-between mt-1.5 px-0.5 text-[11px] text-gray-500'}>
                <span>
                  {selectedValues.length} of {options.length} selected
                </span>
                <div className={'flex items-center gap-2'}>
                  <button
                    type={'button'}
                    onClick={handleSelectAll}
                    className={'text-teal-700 hover:text-teal-900 font-semibold focus:outline-none'}
                  >
                    Select All
                  </button>
                  <span>|</span>
                  <button
                    type={'button'}
                    onClick={handleClearAll}
                    className={'text-gray-500 hover:text-gray-800 font-medium focus:outline-none'}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Options List */}
            <div className={'overflow-y-auto flex-1 divide-y divide-gray-50 py-1'}>
              {filteredOptions.length === 0 ? (
                <div className={'py-4 text-center text-xs text-gray-400'}>
                  No stores found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const strVal = String(opt.value)
                  const isChecked = selectedValues.includes(strVal)
                  return (
                    <label
                      key={strVal}
                      className={[
                        'flex items-center gap-2.5 px-3 py-1.5 cursor-pointer text-xs transition-colors hover:bg-teal-50/60',
                        isChecked ? 'bg-teal-50/40 font-semibold text-teal-950' : 'text-gray-700',
                      ].join(' ')}
                    >
                      <input
                        type={'checkbox'}
                        checked={isChecked}
                        onChange={() => toggleOption(strVal)}
                        className={
                          'w-3.5 h-3.5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer'
                        }
                      />
                      <span className={'flex-1 break-words leading-tight'}>
                        {opt.label || strVal}
                      </span>
                    </label>
                  )
                })
              )}
            </div>

            {/* Footer with Done button */}
            <div className={'p-1.5 border-t border-gray-100 bg-gray-50/50 flex justify-end'}>
              <button
                type={'button'}
                onClick={() => {
                  setIsOpen(false)
                  setSearchTerm('')
                }}
                className={
                  'px-3 py-0.5 text-[11px] font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none transition-colors'
                }
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default SearchableMultiSelect

