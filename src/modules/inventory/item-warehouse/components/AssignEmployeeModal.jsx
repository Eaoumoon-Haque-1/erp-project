/**
 * @file Modal dialog to assign employees to a warehouse.
 * Matches design in media_1794313493413_da91a9fe.jpg:
 * - Header: "Assign Employee To Warehouse" with dark circular close (✕) button
 * - Business Unit (read-only)
 * - Warehouse (read-only)
 * - Employee * (multiselect with write/search option)
 * - Centered "Submit" button
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SearchableMultiSelect from '../../../../components/shared/SearchableMultiSelect'

function AssignEmployeeModal({
  isOpen,
  onClose,
  warehouseName = '',
  employeeOptions = [],
  alreadyAssignedIds = [],
  onAssign = () => {},
}) {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployeeIds([])
      setError('')
      setSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filter out options that are already assigned
  const availableOptions = employeeOptions.filter(
    (opt) => !alreadyAssignedIds.includes(String(opt.value)),
  )

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault?.()
      e.stopPropagation?.()
    }
    if (!selectedEmployeeIds || selectedEmployeeIds.length === 0) {
      setError('Please select at least one employee')
      return
    }

    const selectedEmployees = employeeOptions
      .filter((opt) => selectedEmployeeIds.includes(String(opt.value)))
      .map((opt) => ({
        employeeId: String(opt.value),
        employeeDisplay: opt.label,
        employeeName: opt.name || opt.label,
        employeeCode: opt.code || '',
        status: 1,
      }))

    try {
      setSubmitting(true)
      await onAssign(selectedEmployees, selectedEmployeeIds)
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to assign employees')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleSubmit(e)
    }
  }

  const modalContent = (
    <div
      className={'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200'}
      onClick={(e) => {
        // Prevent click events from propagating to parent forms
        e.stopPropagation()
      }}
    >
      <div
        className={'relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-100 overflow-visible'}
        onKeyDown={handleKeyDown}
      >
        {/* Close Button Top Right */}
        <button
          type={'button'}
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label={'Close'}
          className={
            'absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#2c3e50] text-white hover:bg-gray-800 flex items-center justify-center shadow-md transition-transform hover:scale-105 focus:outline-none'
          }
        >
          <svg
            className={'w-4 h-4'}
            fill={'none'}
            stroke={'currentColor'}
            viewBox={'0 0 24 24'}
          >
            <path
              strokeLinecap={'round'}
              strokeLinejoin={'round'}
              strokeWidth={2.5}
              d={'M6 18L18 6M6 6l12 12'}
            />
          </svg>
        </button>

        {/* Header */}
        <div className={'px-6 pt-6 pb-4 border-b border-gray-100'}>
          <h3 className={'text-base font-bold text-gray-800'}>
            Assign Employee To Warehouse
          </h3>
        </div>

        {/* Dialog Body - NOT a form to completely prevent outer HTML form submission */}
        <div className={'p-6 space-y-4'}>
          {/* Warehouse (read-only) */}
          <div>
            <label className={'block text-xs font-semibold text-gray-800 mb-1.5'}>
              Warehouse
            </label>
            <input
              type={'text'}
              value={warehouseName || '(Unsaved Warehouse)'}
              readOnly
              className={
                'w-full h-9 px-3 py-1.5 bg-[#f3f5f8] border border-gray-200 rounded text-xs text-gray-700 cursor-not-allowed font-medium'
              }
            />
          </div>

          {/* Employee * (Searchable Multiselect with write/search option) */}
          <div>
            <label className={'block text-xs font-semibold text-gray-800 mb-1.5'}>
              Employee <span className={'text-rose-500'}>*</span>
            </label>
            <SearchableMultiSelect
              id={'assign-employee-select'}
              value={selectedEmployeeIds}
              options={availableOptions}
              placeholder={'-- Select / Write Employee --'}
              allowClear={true}
              error={Boolean(error)}
              onChange={(newVal) => {
                const arr = Array.isArray(newVal)
                  ? newVal
                  : String(newVal || '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                setSelectedEmployeeIds(arr)
                if (arr.length > 0) setError('')
              }}
              inputClassName={'text-xs min-h-[36px]'}
            />
            {error && (
              <p className={'text-xs text-rose-600 mt-1.5 font-medium'}>
                {error}
              </p>
            )}
            {availableOptions.length === 0 && (
              <p className={'text-[11px] text-gray-400 mt-1 italic'}>
                All active employees are already assigned or no employees available.
              </p>
            )}
          </div>

          {/* Submit Button (Centered teal rounded button) - type="button" to prevent native form submission */}
          <div className={'pt-4 flex justify-center'}>
            <button
              type={'button'}
              onClick={handleSubmit}
              disabled={submitting}
              className={
                'px-10 py-2 rounded-full bg-[#48757c] hover:bg-[#3d6369] text-white text-xs font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#48757c]/50 disabled:opacity-50'
              }
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent
}

export default AssignEmployeeModal
