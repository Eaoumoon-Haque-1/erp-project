/**
 * @file Reusable searchable dropdown / combobox component with typing capability.
 */
import { useEffect, useMemo, useRef, useState } from 'react'

function SearchableSelect({
  id,
  name,
  value = '',
  options = [],
  placeholder = '--Select--',
  disabled = false,
  error = null,
  allowClear = true,
  emptyOptionLabel = '',
  onChange = () => {},
  className = '',
  inputClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  // Find currently selected option
  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  )

  // When value or selectedOption changes and dropdown is closed, sync input display text
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? selectedOption.label : '')
    }
  }, [selectedOption, isOpen])

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchTerm(selectedOption ? selectedOption.label : '')
      }
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [selectedOption])

  // Filtered options based on user typing
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim() || (selectedOption && searchTerm === selectedOption.label)) {
      return options
    }
    const query = searchTerm.toLowerCase().trim()
    return options.filter((opt) => {
      const label = String(opt.label || '').toLowerCase()
      const code = String(opt.code || '').toLowerCase()
      const name = String(opt.name || '').toLowerCase()
      return label.includes(query) || code.includes(query) || name.includes(query)
    })
  }, [options, searchTerm, selectedOption])

  const handleInputFocus = () => {
    if (disabled) return
    setIsOpen(true)
  }

  const handleInputChange = (e) => {
    const text = e.target.value
    setSearchTerm(text)
    if (!isOpen) setIsOpen(true)
    if (!text.trim() && value) {
      onChange('')
    }
  }

  const handleSelectOption = (optValue) => {
    onChange(optValue)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSearchTerm('')
    onChange('')
    if (inputRef.current) inputRef.current.focus()
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={searchTerm}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          className={`w-full h-8 pl-2.5 pr-12 border rounded text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed text-gray-500'
              : 'bg-white'
          } ${error ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300'} ${inputClassName}`}
        />

        {/* Clear Button */}
        {allowClear && !disabled && (value || searchTerm) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-6 p-1 text-gray-400 hover:text-gray-600 focus:outline-none text-xs leading-none"
            title="Clear"
          >
            ✕
          </button>
        )}

        {/* Dropdown Toggle Chevron */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return
            setIsOpen((prev) => !prev)
            if (!isOpen && inputRef.current) inputRef.current.focus()
          }}
          className="absolute right-1 p-1 text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
        >
          <svg className={`w-3 h-3 fill-current transform transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100 text-xs sm:text-sm">
          {/* Empty / None Option if configured */}
          {emptyOptionLabel && (
            <div
              className={`px-3 py-1.5 cursor-pointer transition-colors ${
                !value ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => handleSelectOption('')}
            >
              {emptyOptionLabel}
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2.5 text-center text-gray-400 text-xs">
              No matching accounts found
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <div
                  key={opt.value}
                  className={`px-3 py-1.5 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-semibold'
                      : 'text-gray-800 hover:bg-teal-50/60 hover:text-teal-900'
                  }`}
                  onClick={() => handleSelectOption(opt.value)}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <span className="text-teal-600 font-bold ml-2 shrink-0">✓</span>
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

export default SearchableSelect
