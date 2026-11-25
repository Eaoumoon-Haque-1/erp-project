/**
 * @file Controlled Depreciation Category entry form.
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

function DepreciationCategoryForm({
  values,
  errors = {},
  methodOptions = [],
  assetTypeOptions = [],
  departmentOptions = [],
  auditLog = null,
  submitLabel = '',
  submitting = false,
  categoryRef,
  onChange,
}) {
  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: DEPRECIATION CATEGORY (ENTRY FORM)
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-3.5 max-w-lg'}>
          {/* 1. Depreciation Category */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'DEPRI_CATEGORY'}
            >
              Asset Major Category<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              ref={categoryRef}
              id={'DEPRI_CATEGORY'}
              name={'DEPRI_CATEGORY'}
              type={'text'}
              className={inputClass(errors.DEPRI_CATEGORY)}
              value={values.DEPRI_CATEGORY || ''}
              placeholder={'Enter asset major category'}
              required
              aria-invalid={Boolean(errors.DEPRI_CATEGORY)}
              aria-describedby={errors.DEPRI_CATEGORY ? 'DEPRI_CATEGORY-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'DEPRI_CATEGORY-error'} message={errors.DEPRI_CATEGORY} />
          </div>

          {/* 2. Depreciation Method */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'DEPRI_METHOD'}
            >
              Depreciation Method<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'DEPRI_METHOD'}
              name={'DEPRI_METHOD'}
              className={inputClass(errors.DEPRI_METHOD)}
              value={values.DEPRI_METHOD || ''}
              required
              aria-invalid={Boolean(errors.DEPRI_METHOD)}
              aria-describedby={errors.DEPRI_METHOD ? 'DEPRI_METHOD-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Depreciation Method--</option>
              {methodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'DEPRI_METHOD-error'} message={errors.DEPRI_METHOD} />
          </div>

          {/* 3. Asset Type */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_TYPE'}
            >
              Asset Type<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'ASSET_TYPE'}
              name={'ASSET_TYPE'}
              className={inputClass(errors.ASSET_TYPE)}
              value={values.ASSET_TYPE || ''}
              required
              aria-invalid={Boolean(errors.ASSET_TYPE)}
              aria-describedby={errors.ASSET_TYPE ? 'ASSET_TYPE-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Asset Type--</option>
              {assetTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_TYPE-error'} message={errors.ASSET_TYPE} />
          </div>

          {/* 4. Depreciation Life (Months) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'DEPRI_LIFE'}
            >
              Depreciation Life (Months)<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              id={'DEPRI_LIFE'}
              name={'DEPRI_LIFE'}
              type={'number'}
              min={'1'}
              step={'1'}
              className={inputClass(errors.DEPRI_LIFE)}
              value={values.DEPRI_LIFE || ''}
              placeholder={'Enter months'}
              required
              aria-invalid={Boolean(errors.DEPRI_LIFE)}
              aria-describedby={errors.DEPRI_LIFE ? 'DEPRI_LIFE-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'DEPRI_LIFE-error'} message={errors.DEPRI_LIFE} />
          </div>

          {/* 5. Depreciation (%) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'DEPRI_PERCENTAGE'}
            >
              Depreciation (%)<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              id={'DEPRI_PERCENTAGE'}
              name={'DEPRI_PERCENTAGE'}
              type={'number'}
              min={'0.01'}
              max={'100'}
              step={'any'}
              className={inputClass(errors.DEPRI_PERCENTAGE)}
              value={values.DEPRI_PERCENTAGE || ''}
              placeholder={'Enter percentage'}
              required
              aria-invalid={Boolean(errors.DEPRI_PERCENTAGE)}
              aria-describedby={errors.DEPRI_PERCENTAGE ? 'DEPRI_PERCENTAGE-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'DEPRI_PERCENTAGE-error'} message={errors.DEPRI_PERCENTAGE} />
          </div>

          {/* 6. Asset Owner */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_OWNER'}
            >
              Asset Owner<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'ASSET_OWNER'}
              name={'ASSET_OWNER'}
              className={inputClass(errors.ASSET_OWNER)}
              value={values.ASSET_OWNER || ''}
              required
              aria-invalid={Boolean(errors.ASSET_OWNER)}
              aria-describedby={errors.ASSET_OWNER ? 'ASSET_OWNER-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Department--</option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_OWNER-error'} message={errors.ASSET_OWNER} />
          </div>

          {/* 7. is active ? */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'DEPRI_CATEGORY_STATUS'}
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

          {/* 8. Action buttons (Reset & Save / Update) directly inside the form card on left side */}
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

export default DepreciationCategoryForm

