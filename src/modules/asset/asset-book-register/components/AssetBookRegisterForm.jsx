/**
 * @file Controlled Asset Book Register entry form.
 * Form layout: 4-column grid with Asset Basic Information, Asset Allocation, left-aligned buttons, and Audit Log block.
 */
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

function AssetBookRegisterForm({
  values,
  errors = {},
  references = {},
  auditLog = null,
  submitLabel = '',
  submitting = false,
  assetNoRef,
  onChange,
}) {
  const {
    itemOptions = [],
    unitOptions = [],
    categoryOptions = [],
    departmentOptions = [],
    allocationTypeOptions = [],
    employeeOptions = [],
    usageStatusOptions = [],
    conditionOptions = [],
    assetStatusOptions = [],
  } = references

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: ASSET BASIC INFORMATION (4 COLUMN LAYOUT)
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs space-y-3.5'}>
        <div className={'flex items-center gap-2 pb-2 border-b border-gray-100'}>
          <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
          <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
            Asset Basic Information
          </h3>
        </div>

        <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}>
          {/* 1. Asset No */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_NO'}
            >
              Asset No
            </label>
            <input
              ref={assetNoRef}
              id={'ASSET_NO'}
              name={'ASSET_NO'}
              type={'text'}
              className={inputClass(errors.ASSET_NO)}
              value={values.ASSET_NO || ''}
              placeholder={'Enter Asset No'}
              maxLength={50}
              aria-invalid={Boolean(errors.ASSET_NO)}
              aria-describedby={errors.ASSET_NO ? 'ASSET_NO-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'ASSET_NO-error'} message={errors.ASSET_NO} />
          </div>

          {/* 2. Asset Item (Drop Down) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_ITEM_ID'}
            >
              Asset Item<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <SearchableSelect
              id={'ASSET_ITEM_ID'}
              name={'ASSET_ITEM_ID'}
              value={values.ASSET_ITEM_ID || ''}
              placeholder={'--Select Asset Item--'}
              error={Boolean(errors.ASSET_ITEM_ID)}
              inputClassName={'h-8'}
              options={itemOptions}
              onChange={(nextValue) =>
                onChange({
                  target: { name: 'ASSET_ITEM_ID', type: 'text', value: nextValue || '' },
                })
              }
            />
            <FieldError id={'ASSET_ITEM_ID-error'} message={errors.ASSET_ITEM_ID} />
          </div>

          {/* 3. Asset Unit (Drop Down) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_UNIT'}
            >
              Asset Unit<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'ASSET_UNIT'}
              name={'ASSET_UNIT'}
              className={inputClass(errors.ASSET_UNIT)}
              value={values.ASSET_UNIT || 'Piece'}
              required
              aria-invalid={Boolean(errors.ASSET_UNIT)}
              aria-describedby={errors.ASSET_UNIT ? 'ASSET_UNIT-error' : undefined}
              onChange={onChange}
            >
              {unitOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_UNIT-error'} message={errors.ASSET_UNIT} />
          </div>

          {/* 4. Depreciation Major Category */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_MAJOR_CATEGORY_ID'}
            >
              Depreciation Major Category
            </label>
            <select
              id={'ASSET_MAJOR_CATEGORY_ID'}
              name={'ASSET_MAJOR_CATEGORY_ID'}
              className={inputClass(errors.ASSET_MAJOR_CATEGORY_ID)}
              value={values.ASSET_MAJOR_CATEGORY_ID || ''}
              aria-invalid={Boolean(errors.ASSET_MAJOR_CATEGORY_ID)}
              aria-describedby={errors.ASSET_MAJOR_CATEGORY_ID ? 'ASSET_MAJOR_CATEGORY_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Major Category--</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_MAJOR_CATEGORY_ID-error'} message={errors.ASSET_MAJOR_CATEGORY_ID} />
          </div>

          {/* 5. Asset Owner */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_OWNER_ID'}
            >
              Asset Owner
            </label>
            <select
              id={'ASSET_OWNER_ID'}
              name={'ASSET_OWNER_ID'}
              className={inputClass(errors.ASSET_OWNER_ID)}
              value={values.ASSET_OWNER_ID || ''}
              aria-invalid={Boolean(errors.ASSET_OWNER_ID)}
              aria-describedby={errors.ASSET_OWNER_ID ? 'ASSET_OWNER_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Asset Owner (Dept)--</option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_OWNER_ID-error'} message={errors.ASSET_OWNER_ID} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: ASSET ALLOCATION (4 COLUMN LAYOUT)
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs space-y-3.5'}>
        <div className={'flex items-center gap-2 pb-2 border-b border-gray-100'}>
          <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
          <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
            Asset Allocation
          </h3>
        </div>

        <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}>
          {/* 1. Allocation Type (Dropdown Hard Coded) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ALLOCATION_TYPE'}
            >
              Allocation Type
            </label>
            <select
              id={'ALLOCATION_TYPE'}
              name={'ALLOCATION_TYPE'}
              className={inputClass(errors.ALLOCATION_TYPE)}
              value={values.ALLOCATION_TYPE || 'Individual'}
              onChange={onChange}
            >
              {allocationTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ALLOCATION_TYPE-error'} message={errors.ALLOCATION_TYPE} />
          </div>

          {/* 2. Employee Name (Drop Down) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ALLOCATION_REF_ID'}
            >
              Employee Name
            </label>
            <SearchableSelect
              id={'ALLOCATION_REF_ID'}
              name={'ALLOCATION_REF_ID'}
              value={values.ALLOCATION_REF_ID || ''}
              placeholder={'--Select Employee--'}
              error={Boolean(errors.ALLOCATION_REF_ID)}
              inputClassName={'h-8'}
              options={employeeOptions}
              onChange={(nextValue) =>
                onChange({
                  target: { name: 'ALLOCATION_REF_ID', type: 'text', value: nextValue || '' },
                })
              }
            />
            <FieldError id={'ALLOCATION_REF_ID-error'} message={errors.ALLOCATION_REF_ID} />
          </div>

          {/* 3. Usages Status (Dropdown Hard Coded) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'USAGE_STATUS'}
            >
              Usages Status
            </label>
            <select
              id={'USAGE_STATUS'}
              name={'USAGE_STATUS'}
              className={inputClass(errors.USAGE_STATUS)}
              value={values.USAGE_STATUS || 'In Use'}
              onChange={onChange}
            >
              {usageStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'USAGE_STATUS-error'} message={errors.USAGE_STATUS} />
          </div>

          {/* 4. Asset Condition (Dropdown Hard Coded) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_CONDITION'}
            >
              Asset Condition
            </label>
            <select
              id={'ASSET_CONDITION'}
              name={'ASSET_CONDITION'}
              className={inputClass(errors.ASSET_CONDITION)}
              value={values.ASSET_CONDITION || 'New'}
              onChange={onChange}
            >
              {conditionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_CONDITION-error'} message={errors.ASSET_CONDITION} />
          </div>

          {/* 5. Asset Status (Dropdown Hard Coded) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_STATUS'}
            >
              Asset Status
            </label>
            <select
              id={'ASSET_STATUS'}
              name={'ASSET_STATUS'}
              className={inputClass(errors.ASSET_STATUS)}
              value={values.ASSET_STATUS || 'Active'}
              onChange={onChange}
            >
              {assetStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_STATUS-error'} message={errors.ASSET_STATUS} />
          </div>

          {/* 6. Allocation Date */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ALLOCATION_DATE'}
            >
              Allocation Date
            </label>
            <input
              id={'ALLOCATION_DATE'}
              name={'ALLOCATION_DATE'}
              type={'date'}
              className={inputClass(errors.ALLOCATION_DATE)}
              value={values.ALLOCATION_DATE || ''}
              onChange={onChange}
            />
            <FieldError id={'ALLOCATION_DATE-error'} message={errors.ALLOCATION_DATE} />
          </div>

          {/* 7. is active ? */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'BOOK_STATUS'}
                  className={'erp-switch-control'}
                  type={'checkbox'}
                  role={'switch'}
                  name={'STATUS'}
                  checked={String(values.STATUS ?? '1') === '1'}
                  onChange={onChange}
                />
                <span className={'text-xs font-medium text-gray-700 select-none'}>
                  {String(values.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action buttons (Reset & Save / Update) directly inside the form card on left side */}
        {submitLabel && (
          <div className={'flex items-center gap-2 pt-2'}>
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
      </div>

      {/* =========================================================================
          SECTION 3: AUDIT LOG DATA (DISPLAYED ON EDIT)
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

export default AssetBookRegisterForm
