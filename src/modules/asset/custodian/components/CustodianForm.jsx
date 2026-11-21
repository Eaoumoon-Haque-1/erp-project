/**
 * @file Controlled Custodian entry form.
 * Matches standard compact entry layout with Sub Custodians and audit log block.
 * Group Name (bgId) and Business Unit (buId) are managed via session and hidden from UI.
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

function CustodianForm({
  values,
  errors = {},
  rows = [],
  auditLog = null,
  submitLabel = '',
  submitting = false,
  custodianNameRef,
  onChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: CUSTODIAN ENTRY FORM
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-3.5 max-w-xl'}>
          {/* 1. Custodian Name */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'CUSTODIAN_NAME'}
            >
              Custodian Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              ref={custodianNameRef}
              id={'CUSTODIAN_NAME'}
              name={'CUSTODIAN_NAME'}
              type={'text'}
              className={inputClass(errors.CUSTODIAN_NAME)}
              value={values.CUSTODIAN_NAME || ''}
              minLength={2}
              maxLength={100}
              placeholder={'Enter custodian name'}
              required
              aria-invalid={Boolean(errors.CUSTODIAN_NAME)}
              aria-describedby={errors.CUSTODIAN_NAME ? 'CUSTODIAN_NAME-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'CUSTODIAN_NAME-error'} message={errors.CUSTODIAN_NAME} />
          </div>

          {/* 2. is active ? */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'CUSTODIAN_STATUS'}
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

        {/* 3. Sub Custodian repeatable rows */}
        <div className={'mt-5 pt-4 border-t border-gray-100'}>
          <div className={'mb-2.5'}>
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Sub Custodian
            </h3>
          </div>
          <div className={'erp-table-wrap mb-3'}>
            <table className={'erp-table erp-custodian-table'} data-table={'ASSET_CUSTODIAN_DTL'}>
              <thead>
                <tr>
                  <th className={'erp-number-column'}>#</th>
                  <th>Sub Custodian Name</th>
                  <th className={'erp-status-column'}>Is Active?</th>
                  <th className={'erp-action-column'}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className={'erp-empty-cell text-center py-4 text-gray-400'} colSpan={4}>
                      No Sub Custodian has been added.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    const error = errors.subRows?.[row._ROW_ID]
                    return (
                      <tr key={row._ROW_ID}>
                        <td className={'erp-number-column text-center'}>{index + 1}</td>
                        <td>
                          <input
                            id={`SUB_CUSTODIAN_NAME-${row._ROW_ID}`}
                            name={'SUB_CUSTODIAN_NAME'}
                            type={'text'}
                            className={inputClass(error)}
                            value={row.SUB_CUSTODIAN_NAME}
                            minLength={2}
                            maxLength={100}
                            placeholder={'Enter sub custodian name'}
                            aria-label={`Sub Custodian Name ${index + 1}`}
                            aria-invalid={Boolean(error)}
                            aria-describedby={
                              error ? `SUB_CUSTODIAN_NAME-${row._ROW_ID}-error` : undefined
                            }
                            onChange={(event) =>
                              onRowChange(row._ROW_ID, 'SUB_CUSTODIAN_NAME', event.target.value)
                            }
                          />
                          <FieldError
                            id={`SUB_CUSTODIAN_NAME-${row._ROW_ID}-error`}
                            message={error}
                          />
                        </td>
                        <td className={'erp-status-column'}>
                          <label className={'erp-switch-field justify-center cursor-pointer gap-2'}>
                            <input
                              className={'erp-switch-control'}
                              type={'checkbox'}
                              role={'switch'}
                              name={'STATUS'}
                              checked={String(row.STATUS) === '1'}
                              aria-label={`Sub Custodian ${index + 1} is active`}
                              onChange={(event) =>
                                onRowChange(row._ROW_ID, 'STATUS', event.target.checked ? '1' : '0')
                              }
                            />
                            <span className={'text-xs font-medium text-gray-700 select-none'}>
                              {String(row.STATUS) === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </td>
                        <td className={'px-1.5 py-1 text-center'}>
                          <button
                            type={'button'}
                            className={'inline-flex items-center justify-center gap-1 h-6 px-2 rounded text-white font-medium text-xs transition-colors shadow-xs bg-rose-500 hover:bg-rose-600 cursor-pointer'}
                            aria-label={`Remove sub custodian ${index + 1}`}
                            title={'Remove'}
                            onClick={() => onRemoveRow(row)}
                          >
                            <span className={'text-sm leading-none font-bold'}>
                              ❌
                            </span>
                            <span>Remove</span>
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
              className={'inline-flex items-center gap-1 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium transition-colors shadow-xs cursor-pointer'}
              onClick={onAddRow}
            >
              <span className={'text-sm font-bold'}>+</span> Add More
            </button>
            <span className={'text-[11px] text-gray-400'}>
              Click &quot;❌ Remove&quot; to delete any row.
            </span>
          </div>
        </div>

        {/* 4. Action buttons (Reset & Save / Update) directly inside the form card on left side */}
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

export default CustodianForm
