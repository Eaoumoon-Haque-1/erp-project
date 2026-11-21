/**
 * @file Controlled Location Master entry form.
 * Matches standard compact entry layout with audit log block.
 * Group Name (bgId) and Business Unit (buId) are managed via session and hidden from UI.
 */
import { isRequired } from '../../../../config/devFlags'

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

function LocationMasterForm({
  values,
  errors = {},
  custodianOptions = [],
  custodiansLoading = false,
  subCustodianOptions = [],
  departmentOptions = [],
  departmentsLoading = false,
  auditLog = null,
  submitLabel = '',
  submitting = false,
  locationNameRef,
  onChange,
}) {
  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: LOCATION MASTER ENTRY FORM
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl'}>
          {/* 1. Custodian */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'CUSTODIAN_ID'}
            >
              Custodian<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'CUSTODIAN_ID'}
              name={'CUSTODIAN_ID'}
              className={inputClass(errors.CUSTODIAN_ID)}
              value={values.CUSTODIAN_ID || ''}
              required
              disabled={custodiansLoading}
              aria-invalid={Boolean(errors.CUSTODIAN_ID)}
              aria-describedby={errors.CUSTODIAN_ID ? 'CUSTODIAN_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {custodiansLoading ? 'Loading Custodians...' : '--Select Custodian--'}
              </option>
              {custodianOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'CUSTODIAN_ID-error'} message={errors.CUSTODIAN_ID} />
          </div>

          {/* 2. Sub Custodian */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'SUB_CUSTODIAN_ID'}
            >
              Sub Custodian<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'SUB_CUSTODIAN_ID'}
              name={'SUB_CUSTODIAN_ID'}
              className={inputClass(errors.SUB_CUSTODIAN_ID)}
              value={values.SUB_CUSTODIAN_ID || ''}
              required
              disabled={!values.CUSTODIAN_ID}
              aria-invalid={Boolean(errors.SUB_CUSTODIAN_ID)}
              aria-describedby={errors.SUB_CUSTODIAN_ID ? 'SUB_CUSTODIAN_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Sub Custodian--</option>
              {subCustodianOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'SUB_CUSTODIAN_ID-error'} message={errors.SUB_CUSTODIAN_ID} />
          </div>

          {/* 3. Location Name */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'LOCATION_NAME'}
            >
              Location Name{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <input
              ref={locationNameRef}
              id={'LOCATION_NAME'}
              name={'LOCATION_NAME'}
              type={'text'}
              className={inputClass(errors.LOCATION_NAME)}
              value={values.LOCATION_NAME || ''}
              minLength={2}
              maxLength={100}
              placeholder={'Enter location name'}
              required={isRequired()}
              aria-invalid={Boolean(errors.LOCATION_NAME)}
              aria-describedby={errors.LOCATION_NAME ? 'LOCATION_NAME-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'LOCATION_NAME-error'} message={errors.LOCATION_NAME} />
          </div>

          {/* 4. Location Code */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'LOCATION_CODE'}
            >
              Location Code{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <input
              id={'LOCATION_CODE'}
              name={'LOCATION_CODE'}
              type={'text'}
              className={inputClass(errors.LOCATION_CODE)}
              value={values.LOCATION_CODE || ''}
              minLength={2}
              maxLength={30}
              placeholder={'Enter location code'}
              required={isRequired()}
              aria-invalid={Boolean(errors.LOCATION_CODE)}
              aria-describedby={errors.LOCATION_CODE ? 'LOCATION_CODE-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'LOCATION_CODE-error'} message={errors.LOCATION_CODE} />
          </div>

          {/* 5. Department */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'DEPT_ID'}
            >
              Department<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'DEPT_ID'}
              name={'DEPT_ID'}
              className={inputClass(errors.DEPT_ID)}
              value={values.DEPT_ID || ''}
              required
              disabled={departmentsLoading}
              aria-invalid={Boolean(errors.DEPT_ID)}
              aria-describedby={errors.DEPT_ID ? 'DEPT_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {departmentsLoading ? 'Loading Departments...' : '--Select Department--'}
              </option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'DEPT_ID-error'} message={errors.DEPT_ID} />
          </div>

          {/* 6. Building */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'BUILDING'}
            >
              Building{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <input
              id={'BUILDING'}
              name={'BUILDING'}
              type={'text'}
              className={inputClass(errors.BUILDING)}
              value={values.BUILDING || ''}
              maxLength={100}
              placeholder={'Enter building'}
              required={isRequired()}
              aria-invalid={Boolean(errors.BUILDING)}
              aria-describedby={errors.BUILDING ? 'BUILDING-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'BUILDING-error'} message={errors.BUILDING} />
          </div>

          {/* 7. Floor */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'FLOOR'}
            >
              Floor{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <input
              id={'FLOOR'}
              name={'FLOOR'}
              type={'text'}
              className={inputClass(errors.FLOOR)}
              value={values.FLOOR || ''}
              maxLength={20}
              placeholder={'Enter floor'}
              required={isRequired()}
              aria-invalid={Boolean(errors.FLOOR)}
              aria-describedby={errors.FLOOR ? 'FLOOR-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'FLOOR-error'} message={errors.FLOOR} />
          </div>

          {/* 8. Room */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ROOM'}
            >
              Room{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <input
              id={'ROOM'}
              name={'ROOM'}
              type={'text'}
              className={inputClass(errors.ROOM)}
              value={values.ROOM || ''}
              maxLength={50}
              placeholder={'Enter room'}
              required={isRequired()}
              aria-invalid={Boolean(errors.ROOM)}
              aria-describedby={errors.ROOM ? 'ROOM-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'ROOM-error'} message={errors.ROOM} />
          </div>

          {/* 9. Address (full width) */}
          <div className={'md:col-span-2'}>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ADDRESS'}
            >
              Address{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <textarea
              id={'ADDRESS'}
              name={'ADDRESS'}
              rows={2}
              className={[
                'w-full px-2.5 py-1.5 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
                errors.ADDRESS ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300',
              ].join(' ')}
              value={values.ADDRESS || ''}
              minLength={5}
              maxLength={255}
              placeholder={'Enter address'}
              required={isRequired()}
              aria-invalid={Boolean(errors.ADDRESS)}
              aria-describedby={errors.ADDRESS ? 'ADDRESS-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'ADDRESS-error'} message={errors.ADDRESS} />
          </div>

          {/* 10. is active ? */}
          <div className={'md:col-span-2'}>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'LOCATION_STATUS'}
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

        {/* Action buttons (Reset & Save / Update) directly inside form card on bottom-left */}
        {submitLabel && (
          <div className={'flex items-center gap-2 pt-4 mt-4 border-t border-gray-100'}>
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

export default LocationMasterForm
