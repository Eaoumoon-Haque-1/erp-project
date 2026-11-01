/**
 * @file Controlled Voucher and Payment Type Mapping entry form.
 * Arranged vertically, matching Payment Type Mapping layout and ERP design system.
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

function VoucherTypeMappingForm({
  values,
  errors = {},
  voucherTypeOptions = [],
  paymentTypeOptions = [],
  lookupsLoading = false,
  auditLog = null,
  submitLabel = '',
  submitting = false,
  voucherTypeRef,
  onChange,
}) {
  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-3.5 max-w-lg'}>
          {/* 1. Voucher Type (Drop Down) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'VOUCHER_TYPE_ID'}
            >
              Voucher Type<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              ref={voucherTypeRef}
              id={'VOUCHER_TYPE_ID'}
              name={'VOUCHER_TYPE_ID'}
              className={inputClass(errors.VOUCHER_TYPE_ID, !values.BU_ID)}
              value={values.VOUCHER_TYPE_ID || ''}
              required
              disabled={!values.BU_ID || lookupsLoading}
              aria-invalid={Boolean(errors.VOUCHER_TYPE_ID)}
              aria-describedby={errors.VOUCHER_TYPE_ID ? 'VOUCHER_TYPE_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {lookupsLoading
                  ? 'Loading Voucher Types...'
                  : voucherTypeOptions.length === 0
                  ? '--No Lookup Values Available--'
                  : '--Select Voucher Type--'}
              </option>
              {voucherTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.code ? ` (${opt.code})` : ''}
                </option>
              ))}
            </select>
            <FieldError id={'VOUCHER_TYPE_ID-error'} message={errors.VOUCHER_TYPE_ID} />
          </div>

          {/* 2. Payment Type (Drop Down) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'VMAP_PAYMENT_TYPE_ID'}
            >
              Payment Type<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'VMAP_PAYMENT_TYPE_ID'}
              name={'PAYMENT_TYPE_ID'}
              className={inputClass(errors.PAYMENT_TYPE_ID, !values.BU_ID)}
              value={values.PAYMENT_TYPE_ID || ''}
              required
              disabled={!values.BU_ID || lookupsLoading}
              aria-invalid={Boolean(errors.PAYMENT_TYPE_ID)}
              aria-describedby={errors.PAYMENT_TYPE_ID ? 'VMAP_PAYMENT_TYPE_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {lookupsLoading
                  ? 'Loading Payment Types...'
                  : paymentTypeOptions.length === 0
                  ? '--No Lookup Values Available--'
                  : '--Select Payment Type--'}
              </option>
              {paymentTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.code ? ` (${opt.code})` : ''}
                </option>
              ))}
            </select>
            <FieldError id={'VMAP_PAYMENT_TYPE_ID-error'} message={errors.PAYMENT_TYPE_ID} />
          </div>

          {/* 3. is active ? (Active / Inactive) */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'VMAP_STATUS'}
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

          {/* 4. Reset and Submit/Update buttons directly under is active ? */}
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

export default VoucherTypeMappingForm
