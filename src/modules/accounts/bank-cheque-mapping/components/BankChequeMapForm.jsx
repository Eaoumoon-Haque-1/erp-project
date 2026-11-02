/**
 * @file Controlled Bank Cheque Mapping entry form.
 * Form design:
 * - Bank Name (Drop Down)
 * - Bank Account No (Drop Down)
 * - From Cheque.
 * - To Cheque.
 * - Cheque Status (Not Use / Void / Used)
 * - Submit Button
 */
import { CHEQUE_STATUS_OPTIONS } from '../validation/bankChequeMapValidation'

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

function BankChequeMapForm({
  values,
  errors = {},
  bankOptions = [],
  accountOptions = [],
  banksLoading = false,
  accountsLoading = false,
  isEdit = false,
  auditLog = null,
  submitLabel = 'Submit',
  submitting = false,
  bankRef,
  onChange,
  onReset,
}) {
  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-3.5 max-w-lg'}>
          {/* 1. Bank Name (Drop Down) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'BANK_ID'}
            >
              Bank Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              ref={bankRef}
              id={'BANK_ID'}
              name={'BANK_ID'}
              className={inputClass(errors.BANK_ID, isEdit || banksLoading)}
              value={values.BANK_ID || ''}
              required
              disabled={isEdit || banksLoading}
              aria-invalid={Boolean(errors.BANK_ID)}
              aria-describedby={errors.BANK_ID ? 'BANK_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {banksLoading
                  ? 'Loading Banks...'
                  : bankOptions.length === 0
                  ? '--No Banks Available--'
                  : '--Select Bank--'}
              </option>
              {bankOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.shortName ? ` (${opt.shortName})` : ''}
                </option>
              ))}
            </select>
            <FieldError id={'BANK_ID-error'} message={errors.BANK_ID} />
          </div>

          {/* 4. Bank Account No (Drop Down) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'BANK_ACCOUNT_ID'}
            >
              Bank Account No<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'BANK_ACCOUNT_ID'}
              name={'BANK_ACCOUNT_ID'}
              className={inputClass(errors.BANK_ACCOUNT_ID, isEdit || !values.BANK_ID || accountsLoading)}
              value={values.BANK_ACCOUNT_ID || ''}
              required
              disabled={isEdit || !values.BANK_ID || accountsLoading}
              aria-invalid={Boolean(errors.BANK_ACCOUNT_ID)}
              aria-describedby={errors.BANK_ACCOUNT_ID ? 'BANK_ACCOUNT_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {!values.BANK_ID
                  ? '--Select Bank First--'
                  : accountsLoading
                  ? 'Loading Bank Accounts...'
                  : accountOptions.length === 0
                  ? '--No Accounts Available for Selected Bank--'
                  : '--Select Bank Account--'}
              </option>
              {accountOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'BANK_ACCOUNT_ID-error'} message={errors.BANK_ACCOUNT_ID} />
          </div>

          {/* On Edit, show individual Cheque No */}
          {isEdit && values.CHEQUE_NO && (
            <div>
              <label
                className={'block text-xs font-medium text-gray-700 mb-1'}
                htmlFor={'CHEQUE_NO'}
              >
                Cheque No.<span className={'text-rose-500 ml-0.5'}>*</span>
              </label>
              <input
                id={'CHEQUE_NO'}
                name={'CHEQUE_NO'}
                type={'text'}
                readOnly
                disabled
                value={values.CHEQUE_NO || ''}
                className={inputClass(null, true)}
              />
            </div>
          )}

          {/* 5. From Cheque. */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'CHEQUE_NO_FROM'}
            >
              From Cheque.<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              id={'CHEQUE_NO_FROM'}
              name={'CHEQUE_NO_FROM'}
              type={'text'}
              inputMode={'numeric'}
              placeholder={'e.g. 1000'}
              value={values.CHEQUE_NO_FROM || ''}
              readOnly={isEdit}
              disabled={isEdit}
              className={inputClass(errors.CHEQUE_NO_FROM, isEdit)}
              aria-invalid={Boolean(errors.CHEQUE_NO_FROM)}
              aria-describedby={errors.CHEQUE_NO_FROM ? 'CHEQUE_NO_FROM-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'CHEQUE_NO_FROM-error'} message={errors.CHEQUE_NO_FROM} />
          </div>

          {/* 6. To Cheque. */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'CHEQUE_NO_TO'}
            >
              To Cheque.<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              id={'CHEQUE_NO_TO'}
              name={'CHEQUE_NO_TO'}
              type={'text'}
              inputMode={'numeric'}
              placeholder={'e.g. 1005'}
              value={values.CHEQUE_NO_TO || ''}
              readOnly={isEdit}
              disabled={isEdit}
              className={inputClass(errors.CHEQUE_NO_TO, isEdit)}
              aria-invalid={Boolean(errors.CHEQUE_NO_TO)}
              aria-describedby={errors.CHEQUE_NO_TO ? 'CHEQUE_NO_TO-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'CHEQUE_NO_TO-error'} message={errors.CHEQUE_NO_TO} />
          </div>

          {/* 7. Cheque Status (Not Use / Void / Used) */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'CHEQUE_STATUS'}
            >
              Cheque Status<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'CHEQUE_STATUS'}
              name={'CHEQUE_STATUS'}
              className={inputClass(errors.CHEQUE_STATUS)}
              value={values.CHEQUE_STATUS || 'Not Use'}
              required
              aria-invalid={Boolean(errors.CHEQUE_STATUS)}
              aria-describedby={errors.CHEQUE_STATUS ? 'CHEQUE_STATUS-error' : undefined}
              onChange={onChange}
            >
              {CHEQUE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'CHEQUE_STATUS-error'} message={errors.CHEQUE_STATUS} />
          </div>

          {/* Buttons */}
          {submitLabel && (
            <div className={'flex items-center gap-2 pt-2'}>
              {!isEdit && onReset && (
                <button
                  type={'button'}
                  onClick={onReset}
                  className={'secondary-button'}
                  disabled={submitting}
                >
                  Reset
                </button>
              )}
              <button
                type={'submit'}
                className={'primary-button'}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : submitLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log on Edit */}
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

export default BankChequeMapForm

