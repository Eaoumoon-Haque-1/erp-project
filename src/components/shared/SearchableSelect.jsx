/**
 * @file Reusable searchable select / combobox component with dropdown and typing capability.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function SearchableSelect({
  id,
  name,
  value = '',
  options = [],
  placeholder = '--Select--',
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
  const [isTyping, setIsTyping] = useState(false)
  const [coords, setCoords] = useState(null)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const selectedOption = useMemo(() => {
    return options.find(
      (opt) =>
        String(opt.value).toLowerCase() === String(value).toLowerCase() ||
        String(opt.label).toLowerCase() === String(value).toLowerCase(),
    )
  }, [options, value])

  const displayValue = useMemo(() => {
    if (!value && !isTyping) return ''
    if (isTyping) return searchTerm
    if (selectedOption) return selectedOption.label
    if (fallbackDisplay) return fallbackDisplay
    return String(value ?? '')
  }, [fallbackDisplay, isTyping, searchTerm, selectedOption, value])

  const updateCoords = useCallback(() => {
    if (!rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()

    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false)
      return
    }

    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const estimatedHeight = 224
    const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow

    const dropdownWidth = Math.max(rect.width, 240)
    let left = rect.left
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - dropdownWidth - 8)
    }

    const maxHeight = Math.max(
      120,
      Math.min(224, (openUpward ? spaceAbove : spaceBelow) - 12),
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
      const isInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target)
      if (!isInsideRoot && !isInsideDropdown) {
        setIsOpen(false)
        setIsTyping(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const filteredOptions = useMemo(() => {
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
  }, [displayValue, options, isTyping])

  const handleInputChange = (event) => {
    const nextText = event.target.value
    setIsTyping(true)
    setSearchTerm(nextText)
    if (!isOpen) {
      updateCoords()
      setIsOpen(true)
    }
    if (!nextText.trim()) {
      onChange('')
    }
  }

  const handleSelectOption = (opt) => {
    setIsTyping(false)
    setSearchTerm('')
    const optVal = typeof opt === 'object' && opt !== null ? opt.value : opt
    onChange(optVal, opt)
    setIsOpen(false)
  }

  const handleClear = (event) => {
    event.stopPropagation()
    setIsTyping(false)
    setSearchTerm('')
    onChange('', null)
    if (inputRef.current) inputRef.current.focus()
  }

  const isDisabled = disabled || readOnly

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className={'relative flex items-center'}>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={'text'}
          autoComplete={'off'}
          disabled={isDisabled}
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => {
            if (!isDisabled) {
              updateCoords()
              setIsOpen(true)
            }
          }}
          onClick={() => {
            if (!isDisabled) {
              updateCoords()
              setIsOpen(true)
            }
          }}
          onChange={handleInputChange}
          className={[
            'w-full rounded border px-2.5 py-1 text-xs transition-colors pr-12',
            error
              ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-gray-300 bg-white text-gray-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600',
            isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-75' : '',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {value && allowClear && !isDisabled && (
          <button
            type={'button'}
            onClick={handleClear}
            className={
              'absolute right-6 p-1 text-gray-400 hover:text-gray-600 focus:outline-none text-xs leading-none'
            }
            title={'Clear'}
            aria-label={'Clear selection'}
          >
            ✕
          </button>
        )}

        <button
          type={'button'}
          disabled={isDisabled}
          onClick={() => {
            if (isDisabled) return
            setIsTyping(false)
            if (!isOpen) {
              updateCoords()
            }
            setIsOpen((prev) => !prev)
            if (!isOpen && inputRef.current) inputRef.current.focus()
          }}
          className={
            'absolute right-1.5 p-1 text-gray-400 hover:text-gray-600 focus:outline-none shrink-0'
          }
          aria-label={'Toggle options'}
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
              'bg-white border border-gray-200 rounded shadow-2xl overflow-y-auto divide-y divide-gray-100 text-xs'
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
              {placeholder}
            </div>

            {filteredOptions.length === 0 ? (
              <div className={'px-3 py-2 text-center text-gray-400 text-xs'}>
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = typeof opt === 'object' && opt !== null ? opt.value : opt
                const optLabel = typeof opt === 'object' && opt !== null ? opt.label : opt
                const isSelected =
                  Boolean(value) &&
                  String(optVal).toLowerCase() === String(value).toLowerCase()
                return (
                  <div
                    key={optVal}
                    role={'option'}
                    aria-selected={isSelected}
                    className={`px-3 py-1.5 cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-semibold'
                        : 'text-gray-800 hover:bg-teal-50/60 hover:text-teal-900'
                    }`}
                    onClick={() => handleSelectOption(opt)}
                  >
                    <div className={'flex items-center gap-1.5 truncate'}>
                      <span className={'truncate'}>{optLabel}</span>
                      {opt.code && (
                        <span
                          className={
                            'px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 text-[10px] font-mono font-semibold shrink-0'
                          }
                        >
                          {opt.code}
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
          </div>,
          document.body,
        )}
    </div>
  )
}

export default SearchableSelect

