/**
 * @file Controlled Item Master and Item Attributes Form.
 * Master Form:
 * - Item Name (required)
 * - Item Code (auto-generated placeholder or manual code)
 * - Item Category (SearchableSelect)
 * - Brand (SearchableSelect)
 * - Unit of Measure (SearchableSelect)
 * - Item Store (SearchableSelect)
 * - Picture (file input with preview thumbnail & remove)
 * - Is Warranty Applicable? (Yes / No dropdown)
 * - Warranty Days (numeric input)
 * - Warranty Criteria (textarea)
 * - Is Active? (Active / Inactive dropdown)
 * Child Detail Table (Item Attributes):
 * - Attribute Name (SearchableSelect / Dropdown)
 * - Price
 * - Opening Stock
 * - Is Active?
 * - Remove row & Add More
 * Audit Log Block: 8 cards + status badge for View and Edit
 */
import { useId, useRef } from 'react'
import MultiSelectField from '../../../../components/shared/MultiSelectField'
import SearchableSelect from '../../../../components/shared/SearchableSelect'
import {
  ITEM_STATUS_OPTIONS,
  WARRANTY_OPTIONS,
} from '../validation/itemValidation'

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

function tableInputClass(error, readOnly = false, extraClasses = '') {
  return [
    'w-full h-7 px-2 py-0.5 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
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

function ItemForm({
  values,
  rows = [],
  categoryOptions = [],
  brandOptions = [],
  uomOptions = [],
  storeOptions = [],
  attributeOptions = [],
  errors = {},
  auditLog = null,
  submitting = false,
  readOnly = false,
  isEdit = false,
  onChange = () => {},
  onRowChange = () => {},
  onAddRow = () => {},
  onRemoveRow = () => {},
  onSubmit = () => {},
  onReset,
  onEdit,
  onCancel,
}) {
  const formId = useId()
  const fileInputRef = useRef(null)
  const isWarrantyApplicable = String(values.IS_WARRANTY_APPLICABLE) === '1'

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Allow only .jpg, .jpeg, .png
    const validExtensions = ['.jpg', '.jpeg', '.png']
    const fileName = (file.name || '').toLowerCase()
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext))
    const hasValidMime = ['image/jpeg', 'image/png'].includes(file.type)

    if (!hasValidExt && !hasValidMime) {
      alert('Only .JPG and .PNG image files can be uploaded.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Limit file size to 2MB for base64 storage
    if (file.size > 2 * 1024 * 1024) {
      alert('Selected image exceeds 2MB size limit. Please choose a smaller image.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      onChange('ITEM_IMAGE', uploadEvent.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    onChange('ITEM_IMAGE', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={'space-y-5 max-w-5xl'}>
      {/* =========================================================================
          SECTION 1: ITEM MASTER
          ========================================================================= */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3.5'}>
        <div className={'grid grid-cols-1 lg:grid-cols-3 gap-3.5'}>
          {/* Row 1: Item Name (2 cols) & Item Code (1 col) */}
          <div className={'lg:col-span-2'}>
            <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
              Item Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            {readOnly ? (
              <input
                type={'text'}
                value={values.ITEM_NAME || '-'}
                readOnly
                className={inputClass(null, true)}
              />
            ) : (
              <input
                type={'text'}
                value={values.ITEM_NAME || ''}
                onChange={(e) => onChange('ITEM_NAME', e.target.value)}
                placeholder={'Enter item name'}
                className={inputClass(errors.ITEM_NAME, false)}
              />
            )}
            <FieldError id={`${formId}-name-err`} message={errors.ITEM_NAME} />
          </div>

          <div className={'lg:col-span-1'}>
            <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
              Item Code
            </label>
            {readOnly ? (
              <input
                type={'text'}
                value={values.ITEM_CODE || '-'}
                readOnly
                className={inputClass(null, true)}
              />
            ) : (
              <input
                type={'text'}
                value={values.ITEM_CODE || ''}
                onChange={(e) => onChange('ITEM_CODE', e.target.value)}
                placeholder={isEdit ? 'Enter item code' : 'Auto Generated (e.g. ITEM-00001)'}
                className={inputClass(errors.ITEM_CODE, false)}
              />
            )}
            <FieldError id={`${formId}-code-err`} message={errors.ITEM_CODE} />
          </div>

          {/* Row 2: Item Category (1 col), Brand (1 col), Unit of Measure (1 col) */}
          <div className={'lg:col-span-1'}>
            <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
              Item Category
            </label>
            {readOnly ? (
              <input
                type={'text'}
                value={values.CATEGORY_NAME || '-'}
                readOnly
                className={inputClass(null, true)}
              />
            ) : (
              <SearchableSelect
                id={`${formId}-category`}
                value={values.CATEGORY_ID ? String(values.CATEGORY_ID) : ''}
                options={categoryOptions}
                placeholder={'--Select/Write Category--'}
                fallbackDisplay={values.CATEGORY_NAME || ''}
                error={Boolean(errors.CATEGORY_ID)}
                allowClear={true}
                onChange={(val) => onChange('CATEGORY_ID', val)}
                inputClassName={'h-8 text-xs'}
              />
            )}
            <FieldError id={`${formId}-cat-err`} message={errors.CATEGORY_ID} />
          </div>

          <div className={'lg:col-span-1'}>
            <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
              Brand
            </label>
            {readOnly ? (
              <input
                type={'text'}
                value={values.BRAND_NAME || '-'}
                readOnly
                className={inputClass(null, true)}
              />
            ) : (
              <SearchableSelect
                id={`${formId}-brand`}
                value={values.BRAND_ID ? String(values.BRAND_ID) : ''}
                options={brandOptions}
                placeholder={'--Select/Write Brand--'}
                fallbackDisplay={values.BRAND_NAME || ''}
                error={Boolean(errors.BRAND_ID)}
                allowClear={true}
                onChange={(val) => onChange('BRAND_ID', val)}
                inputClassName={'h-8 text-xs'}
              />
            )}
            <FieldError id={`${formId}-brand-err`} message={errors.BRAND_ID} />
          </div>

          <div className={'lg:col-span-1'}>
            <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
              Unit of Measure
            </label>
            {readOnly ? (
              <input
                type={'text'}
                value={values.UOM_NAME || '-'}
                readOnly
                className={inputClass(null, true)}
              />
            ) : (
              <SearchableSelect
                id={`${formId}-uom`}
                value={values.UOM_ID ? String(values.UOM_ID) : ''}
                options={uomOptions}
                placeholder={'--Select/Write UOM--'}
                fallbackDisplay={values.UOM_NAME || ''}
                error={Boolean(errors.UOM_ID)}
                allowClear={true}
                onChange={(val) => onChange('UOM_ID', val)}
                inputClassName={'h-8 text-xs'}
              />
            )}
            <FieldError id={`${formId}-uom-err`} message={errors.UOM_ID} />
          </div>

          {/* Row 3 onwards: Left area (2 cols) and Right area (1 col Picture) */}
          <div className={'lg:col-span-2 space-y-3.5'}>
            {/* Item Store (col 1 of left side) */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 gap-3.5'}>
              <div>
                <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                  Item Store
                </label>
                <MultiSelectField
                  id={`${formId}-store`}
                  name={'STORE_ID'}
                  placeholder={values.STORE_NAME || '--Select Store(s)--'}
                  options={storeOptions}
                  value={
                    Array.isArray(values.STORE_ID)
                      ? values.STORE_ID.map(String)
                      : values.STORE_ID
                        ? String(values.STORE_ID).split(',').map((s) => s.trim()).filter(Boolean)
                        : []
                  }
                  disabled={readOnly}
                  error={Boolean(errors.STORE_ID)}
                  buttonClassName={
                    readOnly
                      ? '!h-8 !text-xs !py-1 !px-2.5 !bg-gray-100 !text-gray-700 !cursor-not-allowed !border-gray-300'
                      : '!h-8 !text-xs !py-1 !px-2.5'
                  }
                  onChange={(name, nextValue) => onChange('STORE_ID', nextValue)}
                />
                <FieldError id={`${formId}-store-err`} message={errors.STORE_ID} />
              </div>
            </div>

            {/* Is Warranty Applicable? & Warranty Days */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 gap-3.5'}>
              <div>
                <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                  Is Warranty Applicable?
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={String(values.IS_WARRANTY_APPLICABLE) === '1' ? 'Yes' : 'No'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    value={String(values.IS_WARRANTY_APPLICABLE ?? '0')}
                    onChange={(e) => onChange('IS_WARRANTY_APPLICABLE', e.target.value)}
                    className={inputClass(null, false)}
                  >
                    {WARRANTY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                  Warranty Days
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.WARRANTY_DAY ? `${values.WARRANTY_DAY} days` : '-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <input
                    type={'number'}
                    min={0}
                    value={values.WARRANTY_DAY || ''}
                    readOnly={!isWarrantyApplicable}
                    tabIndex={!isWarrantyApplicable ? -1 : undefined}
                    onChange={(e) => {
                      if (!isWarrantyApplicable) return
                      onChange('WARRANTY_DAY', e.target.value)
                    }}
                    placeholder={isWarrantyApplicable ? 'e.g. 365' : ''}
                    className={inputClass(errors.WARRANTY_DAY, !isWarrantyApplicable)}
                  />
                )}
                <FieldError id={`${formId}-wdays-err`} message={errors.WARRANTY_DAY} />
              </div>
            </div>

            {/* Warranty Criteria (textarea across full left side) */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Warranty Criteria
              </label>
              {readOnly ? (
                <div className={'p-2 rounded bg-gray-100 text-gray-700 text-xs border border-gray-300 min-h-[58px]'}>
                  {values.WARRANTY_CRITERIA || '-'}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={values.WARRANTY_CRITERIA || ''}
                  readOnly={!isWarrantyApplicable}
                  tabIndex={!isWarrantyApplicable ? -1 : undefined}
                  onChange={(e) => {
                    if (!isWarrantyApplicable) return
                    onChange('WARRANTY_CRITERIA', e.target.value)
                  }}
                  placeholder={
                    isWarrantyApplicable
                      ? 'Enter warranty terms, coverage, and repair conditions...'
                      : ''
                  }
                  className={
                    isWarrantyApplicable
                      ? 'w-full px-2.5 py-1.5 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white border-gray-300 resize-y'
                      : 'w-full px-2.5 py-1.5 border rounded text-xs text-gray-700 bg-gray-100 border-gray-300 cursor-not-allowed resize-none'
                  }
                />
              )}
            </div>

            {/* Is Active? */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 gap-3.5'}>
              <div>
                <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                  Is Active?
                </label>
                <div className={'flex items-center h-8'}>
                  <label
                    className={`erp-switch-field !h-8 !w-auto !text-xs gap-2 ${
                      readOnly ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      id={`${formId}-status`}
                      className={'erp-switch-control'}
                      type={'checkbox'}
                      role={'switch'}
                      name={'STATUS'}
                      checked={String(values.STATUS ?? '1') === '1'}
                      disabled={readOnly}
                      onChange={(e) => {
                        if (readOnly) return
                        onChange('STATUS', e.target.checked ? '1' : '0')
                      }}
                    />
                    <span className={'text-xs font-medium text-gray-700 select-none'}>
                      {String(values.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Picture (Column 3 on the right, under Unit of Measure) */}
          <div className={'lg:col-span-1 flex flex-col'}>
            <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
              Picture
            </label>
            <div className={'space-y-2 flex-1 flex flex-col'}>
              {!readOnly && (
                <div>
                  <input
                    ref={fileInputRef}
                    type={'file'}
                    accept={'.jpg,.jpeg,.png,image/jpeg,image/png'}
                    onChange={handleImageFileChange}
                    className={
                      'block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#038b8d] hover:file:bg-teal-100 cursor-pointer'
                    }
                  />
                  <p className={'text-[11px] text-gray-400 mt-0.5'}>Only .jpg and .png images allowed</p>
                </div>
              )}

              {/* Framed Image Preview Box matching image */}
              <div
                className={
                  'w-full min-h-[160px] flex-1 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center p-2 relative overflow-hidden'
                }
              >
                {values.ITEM_IMAGE ? (
                  <>
                    <img
                      src={values.ITEM_IMAGE}
                      alt={'Picture'}
                      className={'w-full h-full max-h-[220px] object-contain rounded'}
                    />
                    {!readOnly && (
                      <button
                        type={'button'}
                        onClick={handleRemoveImage}
                        className={
                          'absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md transition-colors'
                        }
                        title={'Remove picture'}
                      >
                        ✕
                      </button>
                    )}
                  </>
                ) : (
                  <div className={'text-center text-gray-400 p-4'}>
                    <svg
                      className={'mx-auto h-12 w-12 text-gray-300 mb-1'}
                      fill={'none'}
                      viewBox={'0 0 24 24'}
                      stroke={'currentColor'}
                    >
                      <path
                        strokeLinecap={'round'}
                        strokeLinejoin={'round'}
                        strokeWidth={'1.5'}
                        d={
                          'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                        }
                      />
                    </svg>
                    <span className={'block text-xs'}>No picture uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: ITEM ATTRIBUTES (DETAIL TABLE)
          ========================================================================= */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3'}>
        <div className={'flex items-center justify-between pb-2 border-b border-gray-100'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
            <h2 className={'text-sm font-semibold text-gray-800'}>Item Attributes</h2>
          </div>
          {!readOnly && (
            <button
              type={'button'}
              onClick={onAddRow}
              className={
                'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none transition-colors'
              }
            >
              + Add More
            </button>
          )}
        </div>

        <div className={'overflow-x-auto border border-gray-200 rounded-md'}>
          <table className={'min-w-full text-xs divide-y divide-gray-200'}>
            <thead className={'bg-[#038b8d] text-white font-semibold uppercase text-[11px] tracking-wider'}>
              <tr>
                <th className={'w-10 px-2 py-1.5 text-center'}>#</th>
                <th className={'min-w-[180px] px-2.5 py-1.5 text-left'}>
                  Attribute Name<span className={'text-amber-300 ml-0.5'}>*</span>
                </th>
                <th className={'min-w-[120px] px-2.5 py-1.5 text-left'}>Price</th>
                <th className={'min-w-[120px] px-2.5 py-1.5 text-left'}>Opening Stock</th>
                <th className={'min-w-[120px] px-2.5 py-1.5 text-left'}>Is Active?</th>
                {!readOnly && <th className={'w-20 px-2 py-1.5 text-center'}>Action</th>}
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-100 bg-white'}>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={readOnly ? 5 : 6}
                    className={'px-3 py-6 text-center text-gray-400 bg-gray-50/50'}
                  >
                    No item attributes added yet.
                    {!readOnly && ' Click "+ Add More" to add attributes.'}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const rowErrors = errors.subRows?.[row._ROW_ID] || {}
                  const selectedAttrLabel =
                    attributeOptions.find(
                      (opt) => String(opt.value) === String(row.ATTRIBUTE_ID),
                    )?.label ||
                    row.ATTRIBUTE_NAME ||
                    '-'

                  return (
                    <tr
                      key={row._ROW_ID}
                      className={index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}
                    >
                      {/* Row Index */}
                      <td className={'px-2 py-1.5 text-center text-gray-500 font-mono text-[11px]'}>
                        {index + 1}
                      </td>

                      {/* Attribute Name */}
                      <td className={'px-2.5 py-1.5'}>
                        {readOnly ? (
                          <span className={'font-semibold text-gray-800'}>
                            {selectedAttrLabel}
                          </span>
                        ) : (
                          <div>
                            <select
                              value={row.ATTRIBUTE_ID ? String(row.ATTRIBUTE_ID) : ''}
                              onChange={(e) =>
                                onRowChange(row._ROW_ID, 'ATTRIBUTE_ID', e.target.value)
                              }
                              className={tableInputClass(rowErrors.ATTRIBUTE_ID)}
                            >
                              <option value={''}>--Select Attribute--</option>
                              {attributeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <FieldError message={rowErrors.ATTRIBUTE_ID} />
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className={'px-2.5 py-1.5'}>
                        {readOnly ? (
                          <span className={'font-mono text-gray-800'}>
                            {row.PRICE !== '' && row.PRICE != null ? Number(row.PRICE).toFixed(2) : '-'}
                          </span>
                        ) : (
                          <div>
                            <input
                              type={'number'}
                              step={'0.01'}
                              min={'0'}
                              value={row.PRICE || ''}
                              onChange={(e) =>
                                onRowChange(row._ROW_ID, 'PRICE', e.target.value)
                              }
                              placeholder={'0.00'}
                              className={tableInputClass(rowErrors.PRICE)}
                            />
                            <FieldError message={rowErrors.PRICE} />
                          </div>
                        )}
                      </td>

                      {/* Opening Stock */}
                      <td className={'px-2.5 py-1.5'}>
                        {readOnly ? (
                          <span className={'font-mono text-gray-800'}>
                            {row.OPENING_STOCK !== '' && row.OPENING_STOCK != null
                              ? Number(row.OPENING_STOCK).toFixed(2)
                              : '-'}
                          </span>
                        ) : (
                          <div>
                            <input
                              type={'number'}
                              step={'0.01'}
                              min={'0'}
                              value={row.OPENING_STOCK || ''}
                              onChange={(e) =>
                                onRowChange(row._ROW_ID, 'OPENING_STOCK', e.target.value)
                              }
                              placeholder={'0.00'}
                              className={tableInputClass(rowErrors.OPENING_STOCK)}
                            />
                            <FieldError message={rowErrors.OPENING_STOCK} />
                          </div>
                        )}
                      </td>

                      {/* Is Active? */}
                      <td className={'px-2.5 py-1.5'}>
                        <div className={'flex items-center'}>
                          <label
                            className={`erp-switch-field justify-center !h-auto !w-auto !text-xs gap-2 ${
                              readOnly ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                            }`}
                          >
                            <input
                              id={`STATUS-${row._ROW_ID}`}
                              name={`STATUS-${row._ROW_ID}`}
                              className={'erp-switch-control'}
                              type={'checkbox'}
                              role={'switch'}
                              checked={String(row.STATUS ?? '1') === '1'}
                              disabled={readOnly}
                              aria-label={`Attribute row ${index + 1} status`}
                              onChange={(e) => {
                                if (readOnly) return
                                onRowChange(row._ROW_ID, 'STATUS', e.target.checked ? '1' : '0')
                              }}
                            />
                            <span className={'text-xs font-medium text-gray-700 select-none'}>
                              {String(row.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* Action */}
                      {!readOnly && (
                        <td className={'px-2 py-1.5 text-center'}>
                          <button
                            type={'button'}
                            onClick={() => onRemoveRow(row._ROW_ID)}
                            className={
                              'px-2 py-0.5 text-[11px] font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors'
                            }
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Buttons / Actions placed above Audit Log */}
        {readOnly && (
          <div className={'flex items-center gap-2 pt-2'}>
            {onCancel && (
              <button
                type={'button'}
                onClick={onCancel}
                className={
                  'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                }
              >
                Back to List
              </button>
            )}
            {onEdit && (
              <button
                type={'button'}
                onClick={onEdit}
                className={
                  'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none transition-colors'
                }
              >
                Edit Item
              </button>
            )}
          </div>
        )}

        {!readOnly && isEdit && (
          <div className={'flex items-center gap-2 pt-2'}>
            {onReset && (
              <button
                type={'button'}
                onClick={onReset}
                disabled={submitting}
                className={
                  'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                }
              >
                Reset
              </button>
            )}
            <button
              type={'button'}
              onClick={onSubmit}
              disabled={submitting}
              className={
                'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none disabled:opacity-50 transition-colors'
              }
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        )}

        {!readOnly && !isEdit && (
          <div className={'flex items-center gap-2 pt-2'}>
            {onReset && (
              <button
                type={'button'}
                onClick={onReset}
                disabled={submitting}
                className={
                  'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                }
              >
                Reset
              </button>
            )}
            <button
              type={'button'}
              onClick={onSubmit}
              disabled={submitting}
              className={
                'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none disabled:opacity-50 transition-colors'
              }
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: AUDIT LOG BLOCK (FOR VIEW AND EDIT PAGES)
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
                String(values?.STATUS ?? auditLog?.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(values?.STATUS ?? auditLog?.STATUS ?? '1') === '1'
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

export default ItemForm

