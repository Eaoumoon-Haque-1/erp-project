/**
 * @file Controlled Asset Item Information entry form.
 * Matches standard master-detail entry form with Asset Item Sets block and audit log block.
 */
import { useState } from 'react'

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

function tableInputClass(error, extraClasses = '') {
  return [
    'w-full h-7 px-2 py-0.5 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white transition-colors',
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

function ReadonlyField({ id, name, label, value, error }) {
  return (
    <div>
      <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={id || name}>
        {label}
      </label>
      <input
        id={id || name}
        name={name}
        type={'text'}
        className={inputClass(error, true)}
        value={value || ''}
        readOnly
      />
      <FieldError id={`${id || name}-error`} message={error} />
    </div>
  )
}

function AssetItemInformationForm({
  values,
  errors = {},
  references = {},
  setRows = [],
  auditLog = null,
  submitLabel = '',
  submitting = false,
  itemNameRef,
  onChange,
  onSetRowChange,
  onAddSetRow,
  onRemoveSetRow,
  onReorderSetRows,
}) {
  const { assetGroups = [], depreciationCategories = [], uomOptions = [] } = references
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDrop = (targetIndex) => {
    if (
      draggedIndex === null ||
      draggedIndex === targetIndex ||
      !onReorderSetRows
    ) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    onReorderSetRows(draggedIndex, targetIndex)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleAddMore = () => {
    if (onAddSetRow) {
      onAddSetRow()
    }
    if (values.ITEM_PIECE_OR_SET !== 'Set' && onChange) {
      onChange({ target: { name: 'ITEM_PIECE_OR_SET', value: 'Set' } })
    }
  }

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: ASSET ITEM INFORMATION (MASTER ENTRY FORM)
          ========================================================================= */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5'}>
          {/* 1. Item Name */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ITEM_NAME'}
            >
              Item Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              ref={itemNameRef}
              id={'ITEM_NAME'}
              name={'ITEM_NAME'}
              type={'text'}
              className={inputClass(errors.ITEM_NAME)}
              value={values.ITEM_NAME || ''}
              maxLength={100}
              placeholder={'Enter item name'}
              required
              aria-invalid={Boolean(errors.ITEM_NAME)}
              aria-describedby={errors.ITEM_NAME ? 'ITEM_NAME-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'ITEM_NAME-error'} message={errors.ITEM_NAME} />
          </div>

          {/* 2. Item Group */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ITEM_GROUP'}
            >
              Item Group<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'ITEM_GROUP'}
              name={'ITEM_GROUP'}
              className={inputClass(errors.ITEM_GROUP)}
              value={values.ITEM_GROUP || ''}
              required
              aria-invalid={Boolean(errors.ITEM_GROUP)}
              aria-describedby={errors.ITEM_GROUP ? 'ITEM_GROUP-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Asset Group--</option>
              {assetGroups.map((record) => (
                <option key={record.ID} value={record.ID}>
                  {record.ASSET_GROUP}
                </option>
              ))}
            </select>
            <FieldError id={'ITEM_GROUP-error'} message={errors.ITEM_GROUP} />
          </div>

          {/* 3. Depreciation Category */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_DEPRI_CATE_ID'}
            >
              Depreciation Category<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'ASSET_DEPRI_CATE_ID'}
              name={'ASSET_DEPRI_CATE_ID'}
              className={inputClass(errors.ASSET_DEPRI_CATE_ID)}
              value={values.ASSET_DEPRI_CATE_ID || ''}
              required
              aria-invalid={Boolean(errors.ASSET_DEPRI_CATE_ID)}
              aria-describedby={errors.ASSET_DEPRI_CATE_ID ? 'ASSET_DEPRI_CATE_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Depreciation Category--</option>
              {depreciationCategories.map((record) => (
                <option key={record.ID} value={record.ID}>
                  {record.DEPRI_CATEGORY}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_DEPRI_CATE_ID-error'} message={errors.ASSET_DEPRI_CATE_ID} />
          </div>

          {/* 5. UOM */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'UOM'}
            >
              UOM<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'UOM'}
              name={'UOM'}
              className={inputClass(errors.UOM)}
              value={values.UOM || ''}
              required
              aria-invalid={Boolean(errors.UOM)}
              aria-describedby={errors.UOM ? 'UOM-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select UOM--</option>
              {uomOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'UOM-error'} message={errors.UOM} />
          </div>

          {/* Readonly: Depreciation Method */}
          <ReadonlyField
            id={'DEPRI_METHOD'}
            name={'DEPRI_METHOD'}
            label={'Depreciation Method'}
            value={values.DEPRI_METHOD}
            error={errors.DEPRI_METHOD}
          />

          {/* Readonly: Asset Type */}
          <ReadonlyField
            id={'CATEGORY_TYPE'}
            name={'CATEGORY_TYPE'}
            label={'Asset Type'}
            value={values.CATEGORY_TYPE}
            error={errors.CATEGORY_TYPE}
          />

          {/* Readonly: Depreciation Life (Months) */}
          <ReadonlyField
            id={'DEPRI_LIFE'}
            name={'DEPRI_LIFE'}
            label={'Depreciation Life (Months)'}
            value={values.DEPRI_LIFE}
            error={errors.DEPRI_LIFE}
          />

          {/* Readonly: Depreciation (%) */}
          <ReadonlyField
            id={'DEPRI_PERCENTAGE'}
            name={'DEPRI_PERCENTAGE'}
            label={'Depreciation (%)'}
            value={values.DEPRI_PERCENTAGE}
            error={errors.DEPRI_PERCENTAGE}
          />

          {/* Readonly: Asset Owner */}
          <ReadonlyField
            id={'ASSET_OWNER'}
            name={'ASSET_OWNER'}
            label={'Asset Owner'}
            value={values.ASSET_OWNER}
            error={errors.ASSET_OWNER}
          />

          {/* Is Active? Switch */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'ASSET_ITEM_STATUS'}
                  className={'erp-switch-control'}
                  type={'checkbox'}
                  role={'switch'}
                  name={'STATUS'}
                  checked={values.STATUS === '1'}
                  onChange={onChange}
                />
                <span className={'text-xs font-medium text-gray-700 select-none'}>
                  {values.STATUS === '1' ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Item Unit Switch (Piece / Set) */}
          <div data-column={'ITEM_PIECE_OR_SET'}>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              Item Unit<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'ITEM_PIECE_OR_SET'}
                  className={'erp-switch-control'}
                  type={'checkbox'}
                  role={'switch'}
                  name={'ITEM_PIECE_OR_SET'}
                  checked={values.ITEM_PIECE_OR_SET === 'Set'}
                  aria-invalid={Boolean(errors.ITEM_PIECE_OR_SET)}
                  aria-describedby={
                    errors.ITEM_PIECE_OR_SET ? 'ITEM_PIECE_OR_SET-error' : undefined
                  }
                  onChange={(e) =>
                    onChange({
                      target: {
                        name: 'ITEM_PIECE_OR_SET',
                        type: 'text',
                        value: e.target.checked ? 'Set' : 'Piece',
                      },
                    })
                  }
                />
                <span className={'text-xs font-medium text-gray-700 select-none'}>
                  {values.ITEM_PIECE_OR_SET === 'Set' ? 'Set' : 'Piece'}
                </span>
              </label>
            </div>
            <FieldError
              id={'ITEM_PIECE_OR_SET-error'}
              message={errors.ITEM_PIECE_OR_SET}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: ASSET ITEM SETS (SHOWN ONLY WHEN ITEM UNIT IS SET)
          ========================================================================= */}
      {values.ITEM_PIECE_OR_SET === 'Set' && (
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#0b7562] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Asset Item Sets
            </h3>
            <span className={'ml-2 px-1.5 py-0.2 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded'}>
              {setRows.length} {setRows.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <div className={'flex items-center gap-3'}>
            <span className={'text-xs text-gray-500 italic hidden sm:inline'}>
              Drag <span className={'font-bold text-teal-700 select-none'}>≡</span> to reorder. Sort order rearranges automatically.
            </span>
            <button
              type={'button'}
              className={'inline-flex items-center gap-1 h-7 px-2.5 bg-[#0b7562] hover:bg-[#096353] text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-xs'}
              onClick={handleAddMore}
            >
              <span className={'text-sm font-bold leading-none'}>+</span> Add More
            </button>
          </div>
        </div>

        {errors.ITEM_SETS && (
          <div className={'mb-2'}>
            <FieldError id={'ITEM_SETS-error'} message={errors.ITEM_SETS} />
          </div>
        )}

        <div className={'erp-table-wrap overflow-x-auto rounded border border-gray-200'}>
          <table className={'w-full text-xs text-left border-collapse'} data-table={'asset_item_set'}>
            <thead className={'bg-[#0b7562] text-white font-semibold'}>
              <tr>
                <th className={'w-12 px-2 py-1.5 text-center border-r border-[#096353]'} title={'Drag to reorder'}>
                  ≡
                </th>
                <th className={'min-w-[220px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Item Name <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[100px] w-28 px-2.5 py-1.5 border-r border-[#096353]'}>
                  Sort Order
                </th>
                <th className={'min-w-[120px] w-32 px-2.5 py-1.5 text-center border-r border-[#096353]'}>
                  Is Active?
                </th>
                <th className={'w-28 px-2.5 py-1.5 text-center'}>Action</th>
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-200 bg-white'}>
              {setRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50'}>
                    <p className={'text-xs font-medium text-gray-600'}>No Asset Item Set added yet.</p>
                    <p className={'text-[11px] text-gray-400 mt-0.5'}>Click &quot;+ Add More&quot; above to add set items.</p>
                  </td>
                </tr>
              ) : (
                setRows.map((row, index) => {
                  const rowId = row._ROW_ID || `set-row-${index}`
                  const itemNameError = errors[`setRow_${index}_ITEM_NAME`]
                  const isDragTarget = dragOverIndex === index
                  const isDragging = draggedIndex === index
                  return (
                    <tr
                      key={rowId}
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
                        'transition-colors',
                        isDragTarget
                          ? 'bg-teal-50 border-t-2 border-teal-500'
                          : index % 2 === 1
                            ? 'bg-gray-50/40 hover:bg-teal-50/20'
                            : 'bg-white hover:bg-teal-50/20',
                        isDragging ? 'opacity-40' : '',
                      ].join(' ')}
                    >
                      {/* Drag Handle (≡) */}
                      <td className={'px-2 py-1 text-center align-middle border-r border-gray-100'}>
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

                      {/* Item Name */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`SET_ITEM_NAME_${index}`}
                          name={'ITEM_NAME'}
                          type={'text'}
                          className={tableInputClass(itemNameError)}
                          value={row.ITEM_NAME || ''}
                          maxLength={150}
                          placeholder={'e.g. Table, Chair'}
                          aria-label={`Item Name ${index + 1}`}
                          aria-invalid={Boolean(itemNameError)}
                          aria-describedby={itemNameError ? `SET_ITEM_NAME_${index}-error` : undefined}
                          onChange={(e) => onSetRowChange && onSetRowChange(index, 'ITEM_NAME', e.target.value)}
                        />
                        <FieldError id={`SET_ITEM_NAME_${index}-error`} message={itemNameError} />
                      </td>

                      {/* Sort Order (Auto-Rearranged, Read-Only) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100 text-center'}>
                        <input
                          id={`SET_SORT_ORDER_${index}`}
                          name={'SORT_ORDER'}
                          type={'text'}
                          readOnly
                          className={'w-16 h-7 text-center bg-gray-100 border border-gray-300 rounded text-xs font-bold text-gray-700 cursor-not-allowed select-none mx-auto'}
                          value={row.SORT_ORDER || index + 1}
                          aria-label={`Sort Order ${index + 1}`}
                          title={'Automatically rearranged as rows reorder'}
                        />
                      </td>

                      {/* Is Active? */}
                      <td className={'px-1.5 py-1 border-r border-gray-100 text-center'}>
                        <div className={'flex items-center justify-center'}>
                          <label className={'erp-switch-field cursor-pointer !h-7 !w-auto !text-xs gap-1.5 justify-center'}>
                            <input
                              type={'checkbox'}
                              role={'switch'}
                              checked={String(row.STATUS) === '1'}
                              aria-label={`Set item ${index + 1} is active`}
                              onChange={(e) =>
                                onSetRowChange &&
                                onSetRowChange(
                                  index,
                                  'STATUS',
                                  e.target.checked ? '1' : '0',
                                )
                              }
                              className={'erp-switch-control'}
                            />
                            <span className={'text-xs font-medium text-gray-700 select-none'}>
                              {String(row.STATUS) === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* Action: Remove */}
                      <td className={'px-1.5 py-1 text-center'}>
                        <button
                          type={'button'}
                          className={'inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-white bg-[#fa5c70] hover:bg-[#e04a5e] transition-colors shadow-xs cursor-pointer'}
                          onClick={() => onRemoveSetRow && onRemoveSetRow(index)}
                        >
                          <span className={'text-sm leading-none font-bold'}>❌</span>
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={'mt-2.5 flex items-center justify-between'}>
          <button
            type={'button'}
            className={'inline-flex items-center gap-1 h-7 px-3 bg-[#0b7562] hover:bg-[#096353] text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-xs'}
            onClick={handleAddMore}
          >
            <span className={'text-sm font-bold'}>+</span> Add More
          </button>
          <span className={'text-[11px] text-gray-400'}>
            Click &quot;❌ Remove&quot; to delete any row.
          </span>
        </div>
      </div>
      )}

      {/* =========================================================================
          SECTION 3: ACTION BUTTONS (Reset & Update / Save)
          ========================================================================= */}
      {submitLabel && (
        <div className={'flex items-center justify-end gap-2'}>
          <button
            type={'reset'}
            className={'secondary-button'}
            disabled={submitting}
          >
            Reset
          </button>
          <button
            type={'submit'}
            className={'primary-button'}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: AUDIT LOG DATA (DISPLAYED ON EDIT)
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
              data-column={'STATUS'}
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                String(values.STATUS ?? auditLog.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(values.STATUS ?? auditLog.STATUS ?? '1') === '1'
                ? 'Active'
                : 'Inactive'}
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
                  {auditLog.CREATED_USER_NAME || auditLog.CREATED_USER_ID || auditLog.CREATED_BY || '-'}
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
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(auditLog.CREATED_DATETIME || auditLog.CREATED_AT)}
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
                  {auditLog.UPDATED_USER_NAME || auditLog.UPDATED_USER_ID || auditLog.UPDATED_BY || '-'}
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
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(auditLog.UPDATED_DATETIME || auditLog.UPDATED_AT)}
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

export default AssetItemInformationForm
