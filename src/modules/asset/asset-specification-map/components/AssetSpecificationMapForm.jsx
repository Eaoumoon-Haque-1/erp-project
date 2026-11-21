/**
 * @file Controlled Asset Specification Mapping entry form.
 * Matches standard compact entry layout with audit log block.
 */

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

function AssetSpecificationMapForm({
  values,
  errors = {},
  references = {},
  auditLog = null,
  submitLabel = '',
  submitting = false,
  assetItemRef,
  onChange,
}) {
  const { assetItems = [], specificationOptions = [] } = references

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: ASSET SPECIFICATION MAPPING (ENTRY FORM)
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-3.5 max-w-lg'}>
          {/* 1. Asset Item Name */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ITEM_NAME'}
            >
              Asset Item Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              ref={assetItemRef}
              id={'ITEM_NAME'}
              name={'ITEM_NAME'}
              className={inputClass(errors.ITEM_NAME)}
              value={values.ITEM_NAME || ''}
              required
              aria-invalid={Boolean(errors.ITEM_NAME)}
              aria-describedby={errors.ITEM_NAME ? 'ITEM_NAME-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Asset Item--</option>
              {assetItems.map((record) => (
                <option key={record.ID} value={record.ID}>
                  {record.ITEM_NAME}
                </option>
              ))}
            </select>
            <FieldError id={'ITEM_NAME-error'} message={errors.ITEM_NAME} />
          </div>

          {/* 2. Specification */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'SPECIFICATION'}
            >
              Specification<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'SPECIFICATION'}
              name={'SPECIFICATION'}
              className={inputClass(errors.SPECIFICATION)}
              value={values.SPECIFICATION || ''}
              required
              aria-invalid={Boolean(errors.SPECIFICATION)}
              aria-describedby={errors.SPECIFICATION ? 'SPECIFICATION-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Specification--</option>
              {specificationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'SPECIFICATION-error'} message={errors.SPECIFICATION} />
          </div>

          {/* 3. Sort Order */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'SORT_ORDER'}
            >
              Sort Order
            </label>
            <input
              id={'SORT_ORDER'}
              name={'SORT_ORDER'}
              type={'number'}
              min={'1'}
              step={'1'}
              className={inputClass(errors.SORT_ORDER)}
              value={values.SORT_ORDER || ''}
              placeholder={'Enter sort order'}
              aria-invalid={Boolean(errors.SORT_ORDER)}
              aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
          </div>

          {/* 4. is active ? */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'ASSET_SPEC_STATUS'}
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

          {/* 5. Action buttons (Reset & Save / Update) directly inside the form card on left side */}
          {submitLabel && (
            <div className={'flex items-center gap-2 pt-1'}>
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
      </div>

      {/* =========================================================================
          SECTION 2: AUDIT LOG DATA (DISPLAYED ON EDIT)
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

export default AssetSpecificationMapForm
