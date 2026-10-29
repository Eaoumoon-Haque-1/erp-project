/**
 * @file Controlled AFM Lookup Type and Lookup Values master-detail entry form.
 * Matches Bank and Bank Details entry form architecture, compact field sizing, and ERP design system.
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

function tableInputClass(error, extraClasses = '') {
  return [
    'w-full h-7 px-2 py-0.5 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white transition-colors',
    error ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300',
    extraClasses,
  ]
    .filter(Boolean)
    .join(' ')
}

function tableTextareaClass(error, extraClasses = '') {
  return [
    'w-full min-h-[28px] px-2 py-1 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white transition-colors resize-y',
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

function AfmLookupForm({
  values,
  errors = {},
  rows = [],
  groupOptions = [],
  groupsLoading = false,
  businessUnitOptions = [],
  unitsLoading = false,
  businessUnitLocked = false,
  auditLog = null,
  submitLabel = '',
  submitting = false,
  typeNameRef,
  onChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: LOOKUP TYPE (MASTER DATA)
          ========================================================================= */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5'}>
          {/* 1. Group Name */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'LOOKUP_BG_ID'}>
              Group Name{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <select
              id={'LOOKUP_BG_ID'}
              name={'BG_ID'}
              className={inputClass(errors.BG_ID, businessUnitLocked)}
              value={values.BG_ID || ''}
              required
              disabled={groupsLoading || businessUnitLocked}
              aria-invalid={Boolean(errors.BG_ID)}
              aria-describedby={errors.BG_ID ? 'LOOKUP_BG_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {groupsLoading ? 'Loading Groups...' : '--Select Group--'}
              </option>
              {groupOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <FieldError id={'LOOKUP_BG_ID-error'} message={errors.BG_ID} />
          </div>

          {/* 2. Business Unit */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'LOOKUP_BU_ID'}>
              Business Unit{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <select
              id={'LOOKUP_BU_ID'}
              name={'BU_ID'}
              className={inputClass(errors.BU_ID, businessUnitLocked || !values.BG_ID)}
              value={values.BU_ID || ''}
              required
              disabled={unitsLoading || businessUnitLocked || !values.BG_ID}
              aria-invalid={Boolean(errors.BU_ID)}
              aria-describedby={errors.BU_ID ? 'LOOKUP_BU_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>
                {!values.BG_ID
                  ? '--Select Group First--'
                  : unitsLoading
                  ? 'Loading Business Units...'
                  : '--Select Business Unit--'}
              </option>
              {businessUnitOptions.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            <FieldError id={'LOOKUP_BU_ID-error'} message={errors.BU_ID} />
          </div>

          {/* 3. Lookup Type (TYPE_NAME) */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'TYPE_NAME'}>
              Lookup Type<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              ref={typeNameRef}
              id={'TYPE_NAME'}
              name={'TYPE_NAME'}
              type={'text'}
              className={inputClass(errors.TYPE_NAME)}
              value={values.TYPE_NAME || ''}
              minLength={2}
              maxLength={150}
              placeholder={'e.g. Voucher Type, Tax Category'}
              required
              aria-invalid={Boolean(errors.TYPE_NAME)}
              aria-describedby={errors.TYPE_NAME ? 'TYPE_NAME-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'TYPE_NAME-error'} message={errors.TYPE_NAME} />
          </div>

          {/* 4. Lookup Code (TYPE_CODE) */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'TYPE_CODE'}>
              Lookup Code
            </label>
            <input
              id={'TYPE_CODE'}
              name={'TYPE_CODE'}
              type={'text'}
              className={inputClass(errors.TYPE_CODE, false, 'uppercase')}
              value={values.TYPE_CODE || ''}
              maxLength={50}
              placeholder={'e.g. ACC_VOUCHER_TYPE'}
              aria-invalid={Boolean(errors.TYPE_CODE)}
              aria-describedby={errors.TYPE_CODE ? 'TYPE_CODE-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'TYPE_CODE-error'} message={errors.TYPE_CODE} />
          </div>

          {/* 5. Is Active? */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              Is Active?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'LOOKUP_STATUS'}
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
      </div>

      {/* =========================================================================
          SECTION 2: LOOKUP VALUES (REPEATABLE TABLE)
          ========================================================================= */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#0b7562] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Lookup Values
            </h3>
            <span className={'ml-2 px-1.5 py-0.2 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded'}>
              {rows.length} {rows.length === 1 ? 'Value' : 'Values'}
            </span>
          </div>
          <button
            type={'button'}
            className={'inline-flex items-center gap-1 h-7 px-2.5 bg-[#0b7562] hover:bg-[#096353] text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-xs'}
            onClick={onAddRow}
          >
            <span className={'text-sm font-bold leading-none'}>+</span> Add More
          </button>
        </div>

        <div className={'erp-table-wrap overflow-x-auto rounded border border-gray-200'}>
          <table className={'w-full text-xs text-left border-collapse'} data-table={'AFM_LOOKUP_VALUE'}>
            <thead className={'bg-[#0b7562] text-white font-semibold'}>
              <tr>
                <th className={'w-12 px-2 py-1.5 text-center border-r border-[#096353]'}>#</th>
                <th className={'min-w-[180px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Lookup Value <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[140px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Lookup Value Code
                </th>
                <th className={'min-w-[180px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Note
                </th>
                <th className={'min-w-[100px] w-28 px-2.5 py-1.5 border-r border-[#096353]'}>
                  Sort Order
                </th>
                <th className={'min-w-[120px] w-32 px-2 py-1.5 text-center border-r border-[#096353]'}>
                  Is Active?
                </th>
                <th className={'w-28 px-2 py-1.5 text-center'}>Action</th>
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-200 bg-white'}>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50'}>
                    <p className={'text-xs font-medium text-gray-600'}>No Lookup Value added yet.</p>
                    <p className={'text-[11px] text-gray-400 mt-0.5'}>Click &quot;+ Add More&quot; above to add lookup values.</p>
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const rowErrors = errors.subRows?.[row._ROW_ID] || {}
                  return (
                    <tr
                      key={row._ROW_ID}
                      className={`hover:bg-teal-50/20 transition-colors ${
                        index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                      }`}
                    >
                      {/* # (Row Number) */}
                      <td className={'px-2 py-1 text-center text-gray-500 font-mono text-xs border-r border-gray-100'}>
                        {index + 1}
                      </td>

                      {/* Lookup Value */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`VALUE-${row._ROW_ID}`}
                          name={'VALUE'}
                          type={'text'}
                          className={tableInputClass(rowErrors.VALUE)}
                          value={row.VALUE || ''}
                          maxLength={150}
                          placeholder={'e.g. Debit Voucher'}
                          aria-label={`Lookup Value ${index + 1}`}
                          aria-invalid={Boolean(rowErrors.VALUE)}
                          aria-describedby={rowErrors.VALUE ? `VALUE-${row._ROW_ID}-error` : undefined}
                          onChange={(e) => onRowChange(row._ROW_ID, 'VALUE', e.target.value)}
                        />
                        <FieldError id={`VALUE-${row._ROW_ID}-error`} message={rowErrors.VALUE} />
                      </td>

                      {/* Lookup Value Code */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`VALUE_CODE-${row._ROW_ID}`}
                          name={'VALUE_CODE'}
                          type={'text'}
                          className={tableInputClass(rowErrors.VALUE_CODE, 'uppercase')}
                          value={row.VALUE_CODE || ''}
                          maxLength={50}
                          placeholder={'e.g. DV'}
                          aria-label={`Lookup Value Code ${index + 1}`}
                          aria-invalid={Boolean(rowErrors.VALUE_CODE)}
                          aria-describedby={rowErrors.VALUE_CODE ? `VALUE_CODE-${row._ROW_ID}-error` : undefined}
                          onChange={(e) => onRowChange(row._ROW_ID, 'VALUE_CODE', e.target.value)}
                        />
                        <FieldError id={`VALUE_CODE-${row._ROW_ID}-error`} message={rowErrors.VALUE_CODE} />
                      </td>

                      {/* Note */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <textarea
                          id={`NOTE-${row._ROW_ID}`}
                          name={'NOTE'}
                          rows={1}
                          className={tableTextareaClass(rowErrors.NOTE)}
                          value={row.NOTE || ''}
                          maxLength={200}
                          placeholder={'Enter note'}
                          aria-label={`Note ${index + 1}`}
                          aria-invalid={Boolean(rowErrors.NOTE)}
                          aria-describedby={rowErrors.NOTE ? `NOTE-${row._ROW_ID}-error` : undefined}
                          onChange={(e) => onRowChange(row._ROW_ID, 'NOTE', e.target.value)}
                        />
                        <FieldError id={`NOTE-${row._ROW_ID}-error`} message={rowErrors.NOTE} />
                      </td>

                      {/* Sort Order */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`SORT_ORDER-${row._ROW_ID}`}
                          name={'SORT_ORDER'}
                          type={'number'}
                          step={'1'}
                          min={'0'}
                          className={tableInputClass(rowErrors.SORT_ORDER, 'text-center font-mono')}
                          value={row.SORT_ORDER || ''}
                          placeholder={'1'}
                          aria-label={`Sort Order ${index + 1}`}
                          aria-invalid={Boolean(rowErrors.SORT_ORDER)}
                          aria-describedby={rowErrors.SORT_ORDER ? `SORT_ORDER-${row._ROW_ID}-error` : undefined}
                          onChange={(e) => onRowChange(row._ROW_ID, 'SORT_ORDER', e.target.value)}
                        />
                        <FieldError id={`SORT_ORDER-${row._ROW_ID}-error`} message={rowErrors.SORT_ORDER} />
                      </td>

                      {/* Is Active? */}
                      <td className={'px-1.5 py-1 text-center border-r border-gray-100'}>
                        <div className={'flex items-center justify-center'}>
                          <label className={'erp-switch-field justify-center cursor-pointer !h-auto !w-auto !text-xs gap-2'}>
                            <input
                              id={`STATUS-${row._ROW_ID}`}
                              name={`STATUS-${row._ROW_ID}`}
                              className={'erp-switch-control'}
                              type={'checkbox'}
                              role={'switch'}
                              checked={row.STATUS === '1'}
                              aria-label={`Lookup value row ${index + 1} status`}
                              onChange={(e) =>
                                onRowChange(row._ROW_ID, 'STATUS', e.target.checked ? '1' : '0')
                              }
                            />
                            <span className={'text-xs font-medium text-gray-700 select-none'}>
                              {row.STATUS === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* Action: Remove */}
                      <td className={'px-1.5 py-1 text-center'}>
                        <button
                          type={'button'}
                          aria-disabled={Boolean(row.ID && row.IN_USE)}
                          className={[
                            'inline-flex items-center justify-center gap-1 h-6 px-2 rounded text-white font-medium text-xs transition-colors shadow-xs',
                            row.ID && row.IN_USE
                              ? 'bg-gray-400 cursor-not-allowed opacity-75'
                              : 'bg-rose-500 hover:bg-rose-600 cursor-pointer',
                          ].join(' ')}
                          aria-label={`Remove lookup value row ${index + 1}`}
                          title={
                            row.ID && row.IN_USE
                              ? 'Cannot delete: this Lookup Value is already used as a foreign key in another table'
                              : 'Remove'
                          }
                          onClick={() => onRemoveRow(row)}
                        >
                          <span className={'text-sm leading-none font-bold'}>
                            {row.ID && row.IN_USE ? '🔒' : '❌'}
                          </span>
                          <span>{row.ID && row.IN_USE ? 'In Use' : 'Remove'}</span>
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
            onClick={onAddRow}
          >
            <span className={'text-sm font-bold'}>+</span> Add More
          </button>
          <span className={'text-[11px] text-gray-400'}>
            Click &quot;❌ Remove&quot; to delete any row.
          </span>
        </div>
      </div>

      {submitLabel && (
        <div className={'erp-form-actions'}>
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

export default AfmLookupForm
