/**
 * @file Controlled Bulk Entry / Bulk Manage form for Asset Specification Mapping.
 * Matches the hand-drawn wireframe specification:
 * - Top: Asset Item Name dropdown selector
 * - Table: Drag handle (≡), Specification (select), Sort Order (auto-sequenced), is Active (switch), Remove button
 * - Bottom Left: + Add More button
 * - Bottom Right: Reset, Save / Update buttons
 * - Drag-to-reorder facility with automatic Sort Order recalculation.
 */
import { useState } from 'react'
import SearchableSelect from '../../../../components/shared/SearchableSelect'

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className={'text-xs text-rose-600 mt-1 font-medium'}>
      {message}
    </p>
  )
}

function inputClass(error, readOnly = false, extraClasses = '') {
  return [
    'w-full h-8 px-2.5 py-1 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
    readOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white',
    error ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300',
    extraClasses,
  ]
    .filter(Boolean)
    .join(' ')
}

function formatAuditDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `${day}/${month}/${year} ${time}`
}

export default function AssetSpecificationMapBulkForm({
  selectedItemId = '',
  onSelectItem,
  rows = [],
  onRowFieldChange,
  onAddRow,
  onRemoveRow,
  onReorderRows,
  onReset,
  onSubmit,
  references = {},
  errors = {},
  submitting = false,
  submitLabel = 'Save',
  itemDisabled = false,
  mode = 'bulk',
  onModeChange,
  auditLog = null,
  message = '',
}) {
  const { assetItems = [], specificationOptions = [] } = references
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // Hide specifications already selected in other rows (keep the current row's own value)
  const getAvailableSpecOptions = (rowIndex) => {
    const usedInOtherRows = new Set(
      rows
        .filter((r, i) => i !== rowIndex && r.SPECIFICATION)
        .map((r) => String(r.SPECIFICATION).trim().toLowerCase()),
    )
    return specificationOptions.filter(
      (opt) => !usedInOtherRows.has(String(opt.value).trim().toLowerCase()),
    )
  }

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    onReorderRows(draggedIndex, targetIndex)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          MODE SWITCHER TABS: Bulk Entry vs Single Entry
          ========================================================================= */}
      {onModeChange && (
        <div className={'flex items-center gap-2 mb-2'}>
          <button
            type={'button'}
            onClick={() => onModeChange('bulk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              mode === 'bulk'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            📋 Bulk Entry (Multiple Specifications)
          </button>
          <button
            type={'button'}
            onClick={() => onModeChange('single')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              mode === 'single'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            📄 Single Entry
          </button>
        </div>
      )}

      {/* General Alert Message */}
      {message && (
        <div className={'rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium'}>
          {message}
        </div>
      )}

      {/* =========================================================================
          SECTION 1: ASSET SPECIFICATION MAPPING (TOP: ASSET ITEM NAME)
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'max-w-md'}>
          <label
            className={'block text-xs font-semibold text-gray-800 mb-1'}
            htmlFor={'BULK_ASSET_ITEM_NAME'}
          >
            Asset Item Name<span className={'text-rose-500 ml-0.5'}>*</span>
          </label>
          <SearchableSelect
            id={'BULK_ASSET_ITEM_NAME'}
            name={'ITEM_NAME'}
            value={selectedItemId || ''}
            disabled={itemDisabled}
            placeholder={'--Select Asset Item--'}
            error={Boolean(errors.ITEM_NAME)}
            inputClassName={'h-8'}
            options={assetItems.map((item) => ({
              value: String(item.ID),
              label: item.ITEM_NAME,
            }))}
            onChange={(nextValue) => onSelectItem && onSelectItem(nextValue || '')}
          />
          <FieldError id={'BULK_ASSET_ITEM_NAME-error'} message={errors.ITEM_NAME} />
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: REORDERABLE SPECIFICATION TABLE (AS PER WIREFRAME)
          ========================================================================= */}
      <div className={'bg-white rounded border border-gray-200 shadow-xs overflow-hidden'}>
        <div className={'p-3 bg-gray-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
            <span className={'text-xs font-bold text-gray-800 uppercase tracking-tight'}>
              Specification Mapping Details
            </span>
            <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800'}>
              {rows.length} {rows.length === 1 ? 'row' : 'rows'}
            </span>
          </div>
          <div className={'flex items-center gap-3'}>
            <span className={'text-xs text-gray-500 italic hidden sm:inline'}>
              Drag <span className={'font-bold text-teal-700 select-none'}>≡</span> to reorder. Sort order rearranges automatically.
            </span>
            <button
              type={'button'}
              onClick={onAddRow}
              className={'inline-flex items-center gap-1 h-7 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-xs'}
            >
              <span className={'text-sm font-bold leading-none'}>+</span> Add More
            </button>
          </div>
        </div>

        <div className={'overflow-x-auto'}>
          <table className={'w-full text-left border-collapse text-xs'}>
            <thead>
              <tr className={'bg-gray-100/75 border-b border-gray-200 text-gray-700 font-semibold select-none'}>
                <th className={'py-2.5 px-3 w-12 text-center'} title={'Drag to reorder'}>
                  ≡
                </th>
                <th className={'py-2.5 px-3 min-w-[220px]'}>
                  Specification<span className={'text-rose-500 ml-0.5'}>*</span>
                </th>
                <th className={'py-2.5 px-3 w-28 text-center'}>
                  Sort Order
                </th>
                <th className={'py-2.5 px-3 w-32 text-center'}>
                  is Active<span className={'text-rose-500 ml-0.5'}>*</span>
                </th>
                <th className={'py-2.5 px-3 w-28 text-center'}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className={'py-8 text-center text-gray-400 italic'}>
                    No specifications added yet. Click &quot;+ Add More&quot; below to add one.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const specError = errors[`row_${index}_SPECIFICATION`]
                  const isDragTarget = dragOverIndex === index
                  const isDragging = draggedIndex === index

                  return (
                    <tr
                      key={row._ROW_ID}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        if (dragOverIndex !== index) setDragOverIndex(index)
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) setDragOverIndex(null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        handleDrop(index)
                      }}
                      className={[
                        'border-b border-gray-100 transition-colors',
                        isDragTarget ? 'bg-teal-50 border-t-2 border-teal-500' : 'hover:bg-gray-50/70',
                        isDragging ? 'opacity-40' : '',
                      ].join(' ')}
                    >
                      {/* 1. Drag Handle (≡) */}
                      <td className={'py-2 px-3 text-center align-middle'}>
                        <button
                          type={'button'}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move'
                            setDraggedIndex(index)
                          }}
                          onDragEnd={() => {
                            setDraggedIndex(null)
                            setDragOverIndex(null)
                          }}
                          className={'cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-teal-700 hover:bg-gray-100 rounded text-base font-bold leading-none select-none transition-colors'}
                          title={'Drag to reorder row'}
                          aria-label={`Drag row ${index + 1}`}
                        >
                          ≡
                        </button>
                      </td>

                      {/* 2. Specification Dropdown */}
                      <td className={'py-2 px-3 align-middle'}>
                        <SearchableSelect
                          id={`row_${index}_SPECIFICATION`}
                          name={'SPECIFICATION'}
                          value={row.SPECIFICATION || ''}
                          placeholder={'--Select Specification--'}
                          error={Boolean(specError)}
                          inputClassName={'h-8'}
                          options={getAvailableSpecOptions(index)}
                          onChange={(nextValue) =>
                            onRowFieldChange(index, 'SPECIFICATION', nextValue || '')
                          }
                        />
                        <FieldError id={`row_${index}_SPECIFICATION-error`} message={specError} />
                      </td>

                      {/* 3. Sort Order (Auto-Rearranged) */}
                      <td className={'py-2 px-3 text-center align-middle'}>
                        <input
                          type={'text'}
                          readOnly
                          value={row.SORT_ORDER}
                          className={'w-16 h-8 text-center bg-gray-100 border border-gray-300 rounded text-xs font-bold text-gray-700 cursor-not-allowed select-none mx-auto'}
                          title={'Automatically rearranged as rows reorder'}
                        />
                      </td>

                      {/* 4. is Active Switch */}
                      <td className={'py-2 px-3 text-center align-middle'}>
                        <div className={'flex items-center justify-center'}>
                          <label className={'erp-switch-field justify-center cursor-pointer !h-auto !w-auto !text-xs gap-2'}>
                            <input
                              type={'checkbox'}
                              role={'switch'}
                              checked={String(row.STATUS) === '1'}
                              onChange={(e) =>
                                onRowFieldChange(index, 'STATUS', e.target.checked ? '1' : '0')
                              }
                              className={'erp-switch-control'}
                            />
                            <span className={'text-xs font-medium text-gray-700 select-none'}>
                              {String(row.STATUS) === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* 5. Remove Button */}
                      <td className={'py-2 px-3 text-center align-middle'}>
                        <button
                          type={'button'}
                          onClick={() => onRemoveRow(index)}
                          className={'inline-flex items-center gap-1 rounded-[5px] bg-action-danger px-2.5 py-1 text-xs font-bold leading-none text-white shadow-sm hover:opacity-90 transition-opacity'}
                          title={'Remove specification'}
                        >
                          ❌ Remove
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom bar of table: Add More (left) and note (right) */}
        <div className={'p-3 bg-gray-50/80 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2'}>
          <button
            type={'button'}
            onClick={onAddRow}
            className={'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-xs cursor-pointer transition-colors'}
          >
            <span className={'text-sm font-bold leading-none'}>+</span> Add More
          </button>
          <span className={'text-xs text-gray-500'}>
            Click &quot;❌ Remove&quot; to delete any row.
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ACTION BUTTONS (RESET, SAVE)
          ========================================================================= */}
      <div className={'flex items-center justify-start gap-2 pt-2'}>
        <button
          type={'button'}
          onClick={onReset}
          disabled={submitting}
          className={'secondary-button'}
        >
          Reset
        </button>
        <button
          type={'button'}
          onClick={onSubmit}
          disabled={submitting}
          className={'primary-button min-w-[80px]'}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>

      {/* =========================================================================
          SECTION 4: AUDIT LOG (LIKE CUSTODIAN AUDIT LOG BLOCK)
          ========================================================================= */}
      {auditLog && (
        <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
                Audit Log :
              </h3>
            </div>
            <span
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                String(auditLog?.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(auditLog?.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'space-y-3 text-xs'}>
            {/* Row 1: Created Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div
                data-column={'CREATED_USER_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_USER_NAME || auditLog.CREATED_USER_ID || '-'}
                </span>
              </div>

              <div
                data-column={'CREATED_EMP_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_EMP_NAME || auditLog.CREATED_EMP_ID || '-'}
                </span>
              </div>

              <div
                data-column={'CREATED_DATETIME'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created At:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {formatAuditDateTime(auditLog.CREATED_DATETIME)}
                </span>
              </div>

              <div
                data-column={'CREATED_APP'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_APP || '-'}
                </span>
              </div>
            </div>

            {/* Row 2: Updated Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div
                data-column={'UPDATED_USER_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_USER_NAME || auditLog.UPDATED_USER_ID || '-'}
                </span>
              </div>

              <div
                data-column={'UPDATED_EMP_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_EMP_NAME || auditLog.UPDATED_EMP_ID || '-'}
                </span>
              </div>

              <div
                data-column={'UPDATED_DATETIME'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated At:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {formatAuditDateTime(auditLog.UPDATED_DATETIME)}
                </span>
              </div>

              <div
                data-column={'UPDATED_APP'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_APP || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
