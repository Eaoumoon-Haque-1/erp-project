/**
 * @file Controlled Bank and Bank Accounts master-detail entry form.
 * Compact, Chart of Accounts-aligned field sizing and typography.
 */
import DateInput from '../../../../components/shared/DateInput'
import { isRequired } from '../../../../config/devFlags'
import { ACCOUNT_TYPE_OPTIONS } from '../validation/bankValidation'

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

function BankForm({
  values,
  errors = {},
  rows = [],
  groupOptions = [],
  groupsLoading = false,
  businessUnitOptions = [],
  unitsLoading = false,
  businessUnitLocked = false,
  bankNameRef,
  onChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: BANK INFORMATION (MASTER DATA)
          ========================================================================= */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
            <h2 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Bank Information
            </h2>
          </div>
          <span className={'text-[11px] text-gray-500'}>
            Fields marked with <span className={'text-rose-500 font-bold'}>*</span> are required
          </span>
        </div>

        <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5'}>
          {/* 1. Group Name */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BANK_BG_ID'}>
              Group Name{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <select
              id={'BANK_BG_ID'}
              name={'BG_ID'}
              className={inputClass(errors.BG_ID, businessUnitLocked)}
              value={values.BG_ID || ''}
              required
              disabled={groupsLoading || businessUnitLocked}
              aria-invalid={Boolean(errors.BG_ID)}
              aria-describedby={errors.BG_ID ? 'BANK_BG_ID-error' : undefined}
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
            <FieldError id={'BANK_BG_ID-error'} message={errors.BG_ID} />
          </div>

          {/* 2. Business Unit */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BANK_BU_ID'}>
              Business Unit{isRequired() && <span className={'text-rose-500 ml-0.5'}>*</span>}
            </label>
            <select
              id={'BANK_BU_ID'}
              name={'BU_ID'}
              className={inputClass(errors.BU_ID, businessUnitLocked || !values.BG_ID)}
              value={values.BU_ID || ''}
              required
              disabled={unitsLoading || businessUnitLocked || !values.BG_ID}
              aria-invalid={Boolean(errors.BU_ID)}
              aria-describedby={errors.BU_ID ? 'BANK_BU_ID-error' : undefined}
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
            <FieldError id={'BANK_BU_ID-error'} message={errors.BU_ID} />
          </div>

          {/* 3. Bank Name */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BANK_NAME'}>
              Bank Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              ref={bankNameRef}
              id={'BANK_NAME'}
              name={'BANK_NAME'}
              type={'text'}
              className={inputClass(errors.BANK_NAME)}
              value={values.BANK_NAME || ''}
              minLength={2}
              maxLength={150}
              placeholder={'e.g. Eastern Bank PLC'}
              required
              aria-invalid={Boolean(errors.BANK_NAME)}
              aria-describedby={errors.BANK_NAME ? 'BANK_NAME-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'BANK_NAME-error'} message={errors.BANK_NAME} />
          </div>

          {/* 4. Short Name */}
          <div>
            <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'SHORT_NAME'}>
              Short Name
            </label>
            <input
              id={'SHORT_NAME'}
              name={'SHORT_NAME'}
              type={'text'}
              className={inputClass(errors.SHORT_NAME)}
              value={values.SHORT_NAME || ''}
              maxLength={50}
              placeholder={'e.g. EBL, SCB, DBBL'}
              aria-invalid={Boolean(errors.SHORT_NAME)}
              aria-describedby={errors.SHORT_NAME ? 'SHORT_NAME-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'SHORT_NAME-error'} message={errors.SHORT_NAME} />
          </div>

          {/* 5. is active ? */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'BANK_STATUS'}
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
          SECTION 2: BRANCH & ACCOUNT DETAILS (REPEATABLE TABLE)
          ========================================================================= */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#0b7562] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Branch &amp; Account Details
            </h3>
            <span className={'ml-2 px-1.5 py-0.2 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded'}>
              {rows.length} {rows.length === 1 ? 'Account' : 'Accounts'}
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
          <table className={'w-full text-xs text-left border-collapse'} data-table={'AFM_BANK_DTLS'}>
            <thead className={'bg-[#0b7562] text-white font-semibold'}>
              <tr>
                <th className={'w-10 px-2 py-1.5 text-center border-r border-[#096353]'}>#</th>
                <th className={'min-w-[140px] px-2.5 py-1.5 border-r border-[#096353]'}>Branch Name</th>
                <th className={'min-w-[160px] px-2.5 py-1.5 border-r border-[#096353]'}>Address</th>
                <th className={'min-w-[150px] px-2.5 py-1.5 border-r border-[#096353]'}>Account Type</th>
                <th className={'min-w-[150px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Account Name <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[150px] px-2.5 py-1.5 border-r border-[#096353]'}>
                  Account Number <span className={'text-amber-300 font-bold'}>*</span>
                </th>
                <th className={'min-w-[130px] px-2.5 py-1.5 border-r border-[#096353]'}>Opening Date</th>
                <th className={'min-w-[110px] px-2.5 py-1.5 border-r border-[#096353]'}>Opening Balance</th>
                <th className={'min-w-[140px] px-2 py-1.5 text-center border-r border-[#096353]'}>Status</th>
                <th className={'w-12 px-2 py-1.5 text-center'}>Action</th>
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-200 bg-white'}>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50'}>
                    <p className={'text-xs font-medium text-gray-600'}>No Bank Account or Branch added yet.</p>
                    <p className={'text-[11px] text-gray-400 mt-0.5'}>Click &quot;+ Add More&quot; above to add branch and account details.</p>
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

                      {/* Branch Name */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`BRANCH_NAME-${row._ROW_ID}`}
                          name={'BRANCH_NAME'}
                          type={'text'}
                          className={tableInputClass(rowErrors.BRANCH_NAME)}
                          value={row.BRANCH_NAME || ''}
                          maxLength={150}
                          placeholder={'Branch name'}
                          aria-label={`Branch Name ${index + 1}`}
                          onChange={(e) => onRowChange(row._ROW_ID, 'BRANCH_NAME', e.target.value)}
                        />
                        <FieldError id={`BRANCH_NAME-${row._ROW_ID}-error`} message={rowErrors.BRANCH_NAME} />
                      </td>

                      {/* Address */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`ADDRESS-${row._ROW_ID}`}
                          name={'ADDRESS'}
                          type={'text'}
                          className={tableInputClass(rowErrors.ADDRESS)}
                          value={row.ADDRESS || ''}
                          maxLength={500}
                          placeholder={'Branch address'}
                          aria-label={`Address ${index + 1}`}
                          onChange={(e) => onRowChange(row._ROW_ID, 'ADDRESS', e.target.value)}
                        />
                        <FieldError id={`ADDRESS-${row._ROW_ID}-error`} message={rowErrors.ADDRESS} />
                      </td>

                      {/* Account Type */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <select
                          id={`ACCOUNT_TYPE-${row._ROW_ID}`}
                          name={'ACCOUNT_TYPE'}
                          className={tableInputClass(rowErrors.ACCOUNT_TYPE)}
                          value={row.ACCOUNT_TYPE || 'Current Account'}
                          aria-label={`Account Type ${index + 1}`}
                          onChange={(e) => onRowChange(row._ROW_ID, 'ACCOUNT_TYPE', e.target.value)}
                        >
                          {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <FieldError id={`ACCOUNT_TYPE-${row._ROW_ID}-error`} message={rowErrors.ACCOUNT_TYPE} />
                      </td>

                      {/* Account Name */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`ACCOUNT_NAME-${row._ROW_ID}`}
                          name={'ACCOUNT_NAME'}
                          type={'text'}
                          className={tableInputClass(rowErrors.ACCOUNT_NAME)}
                          value={row.ACCOUNT_NAME || ''}
                          maxLength={150}
                          placeholder={'Account name / title'}
                          aria-label={`Account Name ${index + 1}`}
                          aria-invalid={Boolean(rowErrors.ACCOUNT_NAME)}
                          aria-describedby={rowErrors.ACCOUNT_NAME ? `ACCOUNT_NAME-${row._ROW_ID}-error` : undefined}
                          onChange={(e) => onRowChange(row._ROW_ID, 'ACCOUNT_NAME', e.target.value)}
                        />
                        <FieldError id={`ACCOUNT_NAME-${row._ROW_ID}-error`} message={rowErrors.ACCOUNT_NAME} />
                      </td>

                      {/* Account Number */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`ACCOUNT_NUMBER-${row._ROW_ID}`}
                          name={'ACCOUNT_NUMBER'}
                          type={'text'}
                          className={tableInputClass(rowErrors.ACCOUNT_NUMBER, 'font-mono')}
                          value={row.ACCOUNT_NUMBER || ''}
                          maxLength={50}
                          placeholder={'Account number'}
                          aria-label={`Account Number ${index + 1}`}
                          aria-invalid={Boolean(rowErrors.ACCOUNT_NUMBER)}
                          aria-describedby={rowErrors.ACCOUNT_NUMBER ? `ACCOUNT_NUMBER-${row._ROW_ID}-error` : undefined}
                          onChange={(e) => onRowChange(row._ROW_ID, 'ACCOUNT_NUMBER', e.target.value)}
                        />
                        <FieldError id={`ACCOUNT_NUMBER-${row._ROW_ID}-error`} message={rowErrors.ACCOUNT_NUMBER} />
                      </td>

                      {/* Opening Date */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <DateInput
                          id={`OPENING_DATE-${row._ROW_ID}`}
                          name={`OPENING_DATE-${row._ROW_ID}`}
                          value={row.OPENING_DATE || ''}
                          className={tableInputClass(rowErrors.OPENING_DATE)}
                          placeholder={'DD/MM/YYYY'}
                          aria-label={`Opening Date ${index + 1}`}
                          onChange={(event) =>
                            onRowChange(row._ROW_ID, 'OPENING_DATE', event.target.value)
                          }
                        />
                        <FieldError id={`OPENING_DATE-${row._ROW_ID}-error`} message={rowErrors.OPENING_DATE} />
                      </td>

                      {/* Opening Balance */}
                      <td className={'px-1.5 py-1 border-r border-gray-100'}>
                        <input
                          id={`OPENING_BALANCE-${row._ROW_ID}`}
                          name={'OPENING_BALANCE'}
                          type={'number'}
                          step={'0.01'}
                          min={'0'}
                          className={tableInputClass(rowErrors.OPENING_BALANCE, 'text-right font-mono')}
                          value={row.OPENING_BALANCE || ''}
                          placeholder={'0.00'}
                          aria-label={`Opening Balance ${index + 1}`}
                          aria-invalid={Boolean(rowErrors.OPENING_BALANCE)}
                          onChange={(e) => onRowChange(row._ROW_ID, 'OPENING_BALANCE', e.target.value)}
                        />
                        <FieldError id={`OPENING_BALANCE-${row._ROW_ID}-error`} message={rowErrors.OPENING_BALANCE} />
                      </td>

                      {/* Status */}
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
                              aria-label={`Branch row ${index + 1} status`}
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
                          className={'w-6 h-6 inline-flex items-center justify-center rounded bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm cursor-pointer transition-colors shadow-xs'}
                          aria-label={`Remove account row ${index + 1}`}
                          title={'Remove'}
                          onClick={() => onRemoveRow(row)}
                        >
                          ×
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
            Click &quot;×&quot; to delete any row.
          </span>
        </div>
      </div>
    </div>
  )
}

export default BankForm
