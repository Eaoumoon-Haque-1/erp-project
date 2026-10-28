/** @file Accessible searchable dropdown used by list-page filters. */
import { useMemo, useState } from 'react'

function AutocompleteFilter({ label, placeholder, options = [], value = '', disabled = false, onChange }) {
  const selected = options.find((option) => String(option.value) === String(value))
  const [query, setQuery] = useState(selected?.label || '')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized || selected?.label === query) return options
    return options.filter((option) => String(option.label).toLowerCase().includes(normalized))
  }, [options, query, selected?.label])

  const choose = (option) => {
    setQuery(option.label)
    setOpen(false)
    setHighlightedIndex(0)
    onChange(String(option.value))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlightedIndex((index) => Math.min(index + 1, filteredOptions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && open && filteredOptions[highlightedIndex]) {
      event.preventDefault()
      choose(filteredOptions[highlightedIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={'relative min-w-0'}>
      <input
        type={'search'}
        role={'combobox'}
        className={'erp-list-control'}
        placeholder={placeholder}
        aria-label={label}
        aria-autocomplete={'list'}
        aria-expanded={open}
        value={query}
        disabled={disabled}
        onFocus={() => {
          setOpen(true)
          setHighlightedIndex(0)
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setHighlightedIndex(0)
          if (value) onChange('')
        }}
      />
      {open && !disabled && (
        <div
          role={'listbox'}
          className={'absolute left-0 right-0 top-[calc(100%+2px)] z-50 max-h-60 overflow-y-auto rounded border border-slate-300 bg-white py-1 shadow-lg'}
        >
          {filteredOptions.length === 0 ? (
            <div className={'px-3 py-2 text-sm text-slate-500'}>No matching names</div>
          ) : filteredOptions.map((option, index) => (
            <button
              key={option.value}
              type={'button'}
              role={'option'}
              aria-selected={String(option.value) === String(value)}
              className={[
                'block w-full px-3 py-2 text-left text-sm',
                index === highlightedIndex ? 'bg-[#eaf8f8]' : 'bg-white hover:bg-[#eaf8f8]',
              ].join(' ')}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => choose(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AutocompleteFilter
