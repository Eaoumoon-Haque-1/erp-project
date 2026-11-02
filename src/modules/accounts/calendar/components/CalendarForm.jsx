/**
 * @file Controlled Accounting Calendar Form (Master-Detail).
 * Form design follows exact specifications:
 * - Group Name (Session, read-only)
 * - Business Unit (Session, read-only)
 * - Account Year & Calendar Type
 * - Date (From) & Date (To)
 * - Period & Status (Active / Inactive)
 * - Detail table: SL No., Month, Year, Quarter, Date (From), Date (To), Period Name, Period Status, Active, Remove
 * - Action buttons: Save As Draft, Submit
 */
import {
  CALENDAR_TYPE_OPTIONS,
  MONTH_OPTIONS,
  MONTH_ABBR,
  QUARTER_OPTIONS,
  PERIOD_STATUS_OPTIONS,
  extractYears,
} from '../validation/calendarValidation'

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

function CalendarForm({
  values,
  errors = {},
  rows = [],
  auditLog = null,
  submitting = false,
  yearRef,
  onChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
  onAutoGenerate,
  onSaveDraft,
}) {
  const availableYears = extractYears(values.CALENDAR_YEAR)

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: MASTER DATA (ACCOUNTING CALENDAR)
          ========================================================================= */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'}>
          {/* 1. Account Year */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'CALENDAR_YEAR'}>
              Account Year<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              ref={yearRef}
              id={'CALENDAR_YEAR'}
              name={'CALENDAR_YEAR'}
              type={'text'}
              placeholder={'e.g. 2026 or 2025-2026'}
              className={inputClass(errors.CALENDAR_YEAR)}
              value={values.CALENDAR_YEAR || ''}
              required
              aria-invalid={Boolean(errors.CALENDAR_YEAR)}
              aria-describedby={errors.CALENDAR_YEAR ? 'CALENDAR_YEAR-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'CALENDAR_YEAR-error'} message={errors.CALENDAR_YEAR} />
          </div>

          {/* 4. Calendar Type */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'CALENDAR_TYPE'}>
              Calendar Type<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'CALENDAR_TYPE'}
              name={'CALENDAR_TYPE'}
              className={inputClass(errors.CALENDAR_TYPE)}
              value={values.CALENDAR_TYPE || 'Calendar Year'}
              onChange={onChange}
            >
              {CALENDAR_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError id={'CALENDAR_TYPE-error'} message={errors.CALENDAR_TYPE} />
          </div>

          {/* 5. Date (From) */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'FROM_DATE'}>
              From Date (dd-Mon-yyyy)<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              id={'FROM_DATE'}
              name={'FROM_DATE'}
              type={'date'}
              className={inputClass(errors.FROM_DATE)}
              value={values.FROM_DATE || ''}
              required
              aria-invalid={Boolean(errors.FROM_DATE)}
              aria-describedby={errors.FROM_DATE ? 'FROM_DATE-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'FROM_DATE-error'} message={errors.FROM_DATE} />
          </div>

          {/* 6. Date (To) */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'TO_DATE'}>
              To Date (dd-Mon-yyyy)<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              id={'TO_DATE'}
              name={'TO_DATE'}
              type={'date'}
              className={inputClass(errors.TO_DATE)}
              value={values.TO_DATE || ''}
              required
              aria-invalid={Boolean(errors.TO_DATE)}
              aria-describedby={errors.TO_DATE ? 'TO_DATE-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'TO_DATE-error'} message={errors.TO_DATE} />
          </div>

          {/* 7. Period */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'PERIOD'}>
              Period
            </label>
            <input
              id={'PERIOD'}
              name={'PERIOD'}
              type={'text'}
              readOnly
              className={inputClass(null, true)}
              value={values.PERIOD || String(rows.length || '12')}
              onChange={onChange}
            />
          </div>

          {/* 8. Status (Active / Inactive) */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              Status<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'STATUS'}
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
        </div>

        {errors.GENERAL && (
          <div
            id={'CALENDAR_GENERAL_ERROR'}
            role={'alert'}
            aria-live={'assertive'}
            className={'mt-3 p-2.5 rounded bg-rose-50 border border-rose-300 text-xs text-rose-700 font-medium flex items-center gap-2'}
          >
            <span className={'text-base leading-none text-rose-600'}>⚠️</span>
            <span>{errors.GENERAL}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: CALENDAR MONTH DETAILS (REPEATABLE TABLE)
          ========================================================================= */}
      <div className={'bg-white rounded border border-gray-200 shadow-xs overflow-hidden'}>
        <div className={'flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 border-b border-gray-200'}>
          <div className={'flex items-center gap-2'}>
            <span className={'font-semibold text-xs text-gray-700 uppercase tracking-wider'}>
              Calendar Month Details
            </span>
            <span className={'px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200/60'}>
              {rows.length} {rows.length === 1 ? 'Period' : 'Periods'}
            </span>
          </div>

          <div className={'flex items-center gap-2'}>
            {values.FROM_DATE && values.TO_DATE && (
              <button
                type={'button'}
                onClick={onAutoGenerate}
                className={'secondary-button text-xs py-1 px-2.5 h-7 border-teal-600 text-teal-700 hover:bg-teal-50'}
                title={'Auto-generate months based on From Date and To Date'}
              >
                🔄 Auto-Generate Months
              </button>
            )}
            <button
              type={'button'}
              onClick={onAddRow}
              className={'primary-button text-xs py-1 px-2.5 h-7 flex items-center gap-1'}
            >
              <span>+ Add More</span>
            </button>
          </div>
        </div>

        <div className={'overflow-x-auto'}>
          <table className={'w-full text-left text-xs border-collapse'}>
            <thead>
              <tr className={'bg-[#0b7463] text-white text-[11px] font-semibold'}>
                <th className={'w-12 px-2 py-1.5 text-center border-r border-[#096353]'}>SL No.</th>
                <th className={'min-w-[130px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Month <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[110px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Year <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[130px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Quarter <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[130px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  From Date (dd-Mon-yyyy) <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[130px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  To Date (dd-Mon-yyyy) <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[130px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Period Name <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[120px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Period Status
                </th>
                <th className={'min-w-[100px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Active
                </th>
                <th className={'w-12 px-2 py-1.5 text-center'}>Action</th>
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-200 bg-white'}>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50'}>
                    <p className={'text-xs font-medium text-gray-600'}>No calendar month rows added yet.</p>
                    <p className={'text-[11px] text-gray-400 mt-0.5'}>
                      Select From Date (dd-Mon-yyyy) and To Date (dd-Mon-yyyy) to auto-generate 12 months, or click &quot;+ Add More&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const rowErrors = errors.subRows?.[row._ROW_ID] || {}
                  const periodOptions = MONTH_OPTIONS.map((m, mIdx) => `${MONTH_ABBR[mIdx]}-${row.CALENDAR_YEAR || values.CALENDAR_YEAR}`)

                  return (
                    <tr
                      key={row._ROW_ID}
                      className={`hover:bg-teal-50/20 transition-colors ${
                        index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                      }`}
                    >
                      {/* 1. SL No. */}
                      <td className={'px-2 py-1 text-center text-gray-500 font-mono text-xs border-r border-gray-100'}>
                        {index + 1}
                      </td>

                      {/* 2. Month (Drop Down: January to December) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <select
                          id={`CALENDAR_MONTH-${row._ROW_ID}`}
                          name={'CALENDAR_MONTH'}
                          className={tableInputClass(rowErrors.CALENDAR_MONTH)}
                          value={row.CALENDAR_MONTH || 'January'}
                          onChange={(e) => onRowChange(row._ROW_ID, 'CALENDAR_MONTH', e.target.value)}
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <FieldError id={`CALENDAR_MONTH-${row._ROW_ID}-error`} message={rowErrors.CALENDAR_MONTH} />
                      </td>

                      {/* 3. Year (Drop Down: derived from Account Year) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <select
                          id={`CALENDAR_YEAR-${row._ROW_ID}`}
                          name={'CALENDAR_YEAR'}
                          className={tableInputClass(rowErrors.CALENDAR_YEAR)}
                          value={row.CALENDAR_YEAR || availableYears[0] || ''}
                          onChange={(e) => onRowChange(row._ROW_ID, 'CALENDAR_YEAR', e.target.value)}
                        >
                          {availableYears.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                        <FieldError id={`CALENDAR_YEAR-${row._ROW_ID}-error`} message={rowErrors.CALENDAR_YEAR} />
                      </td>

                      {/* 4. Quarter (Drop Down: 1st, 2nd, 3rd, 4th Quarter) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <select
                          id={`CALENDAR_QUATER-${row._ROW_ID}`}
                          name={'CALENDAR_QUATER'}
                          className={tableInputClass(rowErrors.CALENDAR_QUATER)}
                          value={row.CALENDAR_QUATER || '1st Quarter'}
                          onChange={(e) => onRowChange(row._ROW_ID, 'CALENDAR_QUATER', e.target.value)}
                        >
                          {QUARTER_OPTIONS.map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                        <FieldError id={`CALENDAR_QUATER-${row._ROW_ID}-error`} message={rowErrors.CALENDAR_QUATER} />
                      </td>

                      {/* 5. Date (From) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`FROM_DATE-${row._ROW_ID}`}
                          name={'FROM_DATE'}
                          type={'date'}
                          className={tableInputClass(rowErrors.FROM_DATE)}
                          value={row.FROM_DATE || ''}
                          onChange={(e) => onRowChange(row._ROW_ID, 'FROM_DATE', e.target.value)}
                        />
                        <FieldError id={`FROM_DATE-${row._ROW_ID}-error`} message={rowErrors.FROM_DATE} />
                      </td>

                      {/* 6. Date (To) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`TO_DATE-${row._ROW_ID}`}
                          name={'TO_DATE'}
                          type={'date'}
                          className={tableInputClass(rowErrors.TO_DATE)}
                          value={row.TO_DATE || ''}
                          onChange={(e) => onRowChange(row._ROW_ID, 'TO_DATE', e.target.value)}
                        />
                        <FieldError id={`TO_DATE-${row._ROW_ID}-error`} message={rowErrors.TO_DATE} />
                      </td>

                      {/* 7. Period Name (Drop Down or Editable) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <select
                          id={`PERIOD_NAME-${row._ROW_ID}`}
                          name={'PERIOD_NAME'}
                          className={tableInputClass(rowErrors.PERIOD_NAME)}
                          value={row.PERIOD_NAME || ''}
                          onChange={(e) => onRowChange(row._ROW_ID, 'PERIOD_NAME', e.target.value)}
                        >
                          <option value={''}>--Select Period--</option>
                          {periodOptions.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                          {row.PERIOD_NAME && !periodOptions.includes(row.PERIOD_NAME) && (
                            <option value={row.PERIOD_NAME}>{row.PERIOD_NAME}</option>
                          )}
                        </select>
                        <FieldError id={`PERIOD_NAME-${row._ROW_ID}-error`} message={rowErrors.PERIOD_NAME} />
                      </td>

                      {/* 8. Period Status (Open / Close) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <select
                          id={`PERIOD_STATUS-${row._ROW_ID}`}
                          name={'PERIOD_STATUS'}
                          className={tableInputClass(null)}
                          value={row.PERIOD_STATUS || 'Open'}
                          onChange={(e) => onRowChange(row._ROW_ID, 'PERIOD_STATUS', e.target.value)}
                        >
                          {PERIOD_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 9. Active (Yes / No) */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <select
                          id={`STATUS-${row._ROW_ID}`}
                          name={'STATUS'}
                          className={tableInputClass(null)}
                          value={row.STATUS || '1'}
                          onChange={(e) => onRowChange(row._ROW_ID, 'STATUS', e.target.value)}
                        >
                          <option value={'1'}>Yes</option>
                          <option value={'0'}>No</option>
                        </select>
                      </td>

                      {/* 10. ❌ Remove Action */}
                      <td className={'px-2 py-1 text-center'}>
                        <button
                          type={'button'}
                          onClick={() => onRemoveRow(row._ROW_ID)}
                          className={'text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors'}
                          title={'Remove row'}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ACTION BUTTONS (Save As Draft, Submit)
          ========================================================================= */}
      <div className={'flex items-center gap-2 pt-2'}>
        <button
          type={'button'}
          onClick={onSaveDraft}
          className={'secondary-button'}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save As Draft'}
        </button>
        <button
          type={'submit'}
          className={'primary-button'}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Audit Log for Edit */}
      {auditLog && (
        <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>Audit Log :</h3>
            </div>
            <span
              data-column={'STATUS'}
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                String(values.STATUS ?? auditLog.STATUS ?? '1') === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(values.STATUS ?? auditLog.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
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

export default CalendarForm

