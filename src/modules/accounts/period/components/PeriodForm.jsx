/**
 * @file Controlled form for Accounting Period (Open / Close Create & Edit).
 * Specifications:
 * - OpenPeriodCreate:
 *     - Year: Dropdown showing distinct CALENDAR_YEAR from AFM_CALENDAR_MONTH
 *     - Period Name: Dropdown showing periods where PERIOD_STATUS is close and not in AFM_PERIOD
 *     - Period Status: Readonly textfield with default "Open"
 * - ClosePeriodCreate:
 *     - Year: Dropdown showing distinct CALENDAR_YEAR from AFM_CALENDAR_MONTH
 *     - Period Name: Dropdown showing periods where PERIOD_STATUS is open and not in AFM_PERIOD
 *     - Period Status: Readonly textfield with default "Close"
 * - PeriodEdit:
 *     - Year: Textfield in readonly format
 *     - Period Name: Textfield in readonly format
 *     - Period Status: Dropdown (Open / Close) showing database inserted data, changeable and saveable
 * - Group Name, Business Unit, and "is active ?" are excluded from the form.
 */
import { PERIOD_STATUS_OPTIONS } from '../validation/periodValidation'

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

function PeriodForm({
  values,
  errors = {},
  availableYears = [],
  periodNameOptions = [],
  periodsLoading = false,
  mode = 'open-create', // 'open-create' | 'close-create' | 'edit'
  isEdit = false,
  auditLog = null,
  submitLabel = 'Submit',
  submitting = false,
  yearRef,
  onChange,
  onReset,
}) {
  const isEditMode = isEdit || mode === 'edit'
  const isOpenCreate = mode === 'open-create'
  const isCloseCreate = mode === 'close-create'

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-3.5 max-w-lg'}>
          {/* 1. Year: Dropdown in Create, Readonly textfield in Edit */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'PERIOD_YEAR'}
            >
              Year<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            {isEditMode ? (
              <input
                ref={yearRef}
                id={'PERIOD_YEAR'}
                name={'PERIOD_YEAR'}
                type={'text'}
                readOnly
                className={inputClass(errors.PERIOD_YEAR, true)}
                value={values.PERIOD_YEAR || ''}
              />
            ) : (
              <select
                ref={yearRef}
                id={'PERIOD_YEAR'}
                name={'PERIOD_YEAR'}
                className={inputClass(errors.PERIOD_YEAR)}
                value={values.PERIOD_YEAR || ''}
                required
                aria-invalid={Boolean(errors.PERIOD_YEAR)}
                aria-describedby={errors.PERIOD_YEAR ? 'PERIOD_YEAR-error' : undefined}
                onChange={onChange}
              >
                <option value={''}>--Select Year--</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
                {values.PERIOD_YEAR && !availableYears.includes(values.PERIOD_YEAR) && (
                  <option value={values.PERIOD_YEAR}>{values.PERIOD_YEAR}</option>
                )}
              </select>
            )}
            <FieldError id={'PERIOD_YEAR-error'} message={errors.PERIOD_YEAR} />
          </div>

          {/* 2. Period Name: Dropdown in Create, Readonly textfield in Edit */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'PERIOD_NAME'}
            >
              Period Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            {isEditMode ? (
              <input
                id={'PERIOD_NAME'}
                name={'PERIOD_NAME'}
                type={'text'}
                readOnly
                className={inputClass(errors.PERIOD_NAME, true)}
                value={values.PERIOD_NAME || ''}
              />
            ) : (
              <select
                id={'PERIOD_NAME'}
                name={'PERIOD_NAME'}
                className={inputClass(errors.PERIOD_NAME, !values.PERIOD_YEAR)}
                value={values.PERIOD_NAME || ''}
                required
                disabled={!values.PERIOD_YEAR || periodsLoading}
                aria-invalid={Boolean(errors.PERIOD_NAME)}
                aria-describedby={errors.PERIOD_NAME ? 'PERIOD_NAME-error' : undefined}
                onChange={onChange}
              >
                <option value={''}>
                  {!values.PERIOD_YEAR
                    ? '--Select Year First--'
                    : periodsLoading
                    ? 'Loading Period Names...'
                    : periodNameOptions.length === 0
                    ? '--No Periods Available for this Year--'
                    : '--Select Period Name--'}
                </option>
                {periodNameOptions.map((opt) => {
                  const name =
                    typeof opt === 'object' && opt !== null
                      ? opt.periodName || opt.value || opt.label
                      : opt
                  return (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  )
                })}
                {values.PERIOD_NAME &&
                  !periodNameOptions.some((opt) => {
                    const name =
                      typeof opt === 'object' && opt !== null
                        ? opt.periodName || opt.value || opt.label
                        : opt
                    return name === values.PERIOD_NAME
                  }) && (
                    <option value={values.PERIOD_NAME}>{values.PERIOD_NAME}</option>
                  )}
              </select>
            )}
            <FieldError id={'PERIOD_NAME-error'} message={errors.PERIOD_NAME} />
          </div>

          {/* 3. Period Status: Readonly textfield in Create, Dropdown in Edit */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'PERIOD_STATUS'}
            >
              Period Status<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            {isEditMode ? (
              <select
                id={'PERIOD_STATUS'}
                name={'PERIOD_STATUS'}
                className={inputClass(errors.PERIOD_STATUS)}
                value={values.PERIOD_STATUS || 'Open'}
                required
                aria-invalid={Boolean(errors.PERIOD_STATUS)}
                aria-describedby={errors.PERIOD_STATUS ? 'PERIOD_STATUS-error' : undefined}
                onChange={onChange}
              >
                {PERIOD_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : isOpenCreate ? (
              <input
                id={'PERIOD_STATUS'}
                name={'PERIOD_STATUS'}
                type={'text'}
                readOnly
                className={inputClass(errors.PERIOD_STATUS, true)}
                value={values.PERIOD_STATUS || 'Open'}
              />
            ) : isCloseCreate ? (
              <input
                id={'PERIOD_STATUS'}
                name={'PERIOD_STATUS'}
                type={'text'}
                readOnly
                className={inputClass(errors.PERIOD_STATUS, true)}
                value={values.PERIOD_STATUS || 'Close'}
              />
            ) : (
              <select
                id={'PERIOD_STATUS'}
                name={'PERIOD_STATUS'}
                className={inputClass(errors.PERIOD_STATUS)}
                value={values.PERIOD_STATUS || 'Open'}
                required
                aria-invalid={Boolean(errors.PERIOD_STATUS)}
                aria-describedby={errors.PERIOD_STATUS ? 'PERIOD_STATUS-error' : undefined}
                onChange={onChange}
              >
                {PERIOD_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <FieldError id={'PERIOD_STATUS-error'} message={errors.PERIOD_STATUS} />
          </div>

          {/* 4. Action Buttons */}
          {submitLabel && (
            <div className={'flex items-center gap-2 pt-2'}>
              {!isEditMode && onReset && (
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

      {/* Audit Log for Edit */}
      {auditLog && (
        <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
                Audit Log :
              </h3>
            </div>
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

export default PeriodForm
