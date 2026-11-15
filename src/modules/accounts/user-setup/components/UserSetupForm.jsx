/**
 * @file Controlled User Setup (AFM_USER_SETUP) entry form.
 * Form design:
 * - User Name (Drop Down with write option / searchable)
 * - Voucher Date (Drop Down / Multi-Select)
 * - Voucher Type (Multi Select Drop Down)
 * - Default Voucher Type (Drop Down)
 * - Location (Multi Select Drop Down)
 * - Default Location (Drop Down)
 * - Bank Account (Multi Select Drop Down)
 * - Default Bank Account (Drop Down)
 * - Cost Center (Multi Select Drop Down)
 * - Default Cost Center (Drop Down)
 * - Status (Active / Inactive)
 * - Submit Button
 * - Audit Log Block (view & edit pages)
 */
import { useMemo } from 'react'
import MultiSelectField from '../../../../components/shared/MultiSelectField'
import SearchableSelect from '../../../../components/shared/SearchableSelect'
import {
  USER_SETUP_STATUS_OPTIONS,
  VOUCHER_DATE_OPTIONS,
} from '../validation/userSetupValidation'

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

function UserSetupForm({
  values,
  errors = {},
  userOptions = [],
  voucherTypeOptions = [],
  locationOptions = [],
  bankAccountOptions = [],
  costCenterOptions = [],
  chartOfAccountOptions = [],
  usersLoading = false,
  lookupsLoading = false,
  locationsLoading = false,
  bankAccountsLoading = false,
  costCentersLoading = false,
  coaLoading = false,
  isEdit = false,
  readOnly = false,
  auditLog = null,
  submitLabel = 'Submit',
  submitting = false,
  onChange,
  onMultiSelectChange,
  onSubmit,
  onReset,
  onEdit,
  onCancel,
  onCreateNew,
}) {
  // Filtered options for default fields based on selected multi-selects
  const defaultVoucherTypeOptions = useMemo(() => {
    if (!values.VOUCHER_TYPE || values.VOUCHER_TYPE.length === 0) {
      return voucherTypeOptions
    }
    const selectedSet = new Set(values.VOUCHER_TYPE.map(String))
    const filtered = voucherTypeOptions.filter((opt) => selectedSet.has(String(opt.value)))
    return filtered.length > 0 ? filtered : voucherTypeOptions
  }, [values.VOUCHER_TYPE, voucherTypeOptions])

  const defaultLocationOptions = useMemo(() => {
    if (!values.LOCATION || values.LOCATION.length === 0) {
      return locationOptions
    }
    const selectedSet = new Set(values.LOCATION.map(String))
    const filtered = locationOptions.filter((opt) => selectedSet.has(String(opt.value)))
    return filtered.length > 0 ? filtered : locationOptions
  }, [values.LOCATION, locationOptions])

  const defaultBankAccountOptions = useMemo(() => {
    if (!values.BANK_ACCOUNT || values.BANK_ACCOUNT.length === 0) {
      return bankAccountOptions
    }
    const selectedSet = new Set(values.BANK_ACCOUNT.map(String))
    const filtered = bankAccountOptions.filter((opt) => selectedSet.has(String(opt.value)))
    return filtered.length > 0 ? filtered : bankAccountOptions
  }, [values.BANK_ACCOUNT, bankAccountOptions])

  const defaultCostCenterOptions = useMemo(() => {
    if (!values.COST_CENTER || values.COST_CENTER.length === 0) {
      return costCenterOptions
    }
    const selectedSet = new Set(values.COST_CENTER.map(String))
    const filtered = costCenterOptions.filter((opt) => selectedSet.has(String(opt.value)))
    return filtered.length > 0 ? filtered : costCenterOptions
  }, [values.COST_CENTER, costCenterOptions])

  const handleUserChange = (selectedVal) => {
    if (onChange) {
      onChange({ target: { name: 'USER_ID', value: selectedVal } })
    }
  }

  const handleSimpleChange = (name, value) => {
    if (onChange) {
      onChange({ target: { name, value } })
    }
  }

  const allowedAccountsList = values.ALLOWED_ACCOUNTS || []
  const displayAllowedAccounts =
    allowedAccountsList.length > 0
      ? allowedAccountsList
      : !readOnly
      ? [{ _rowKey: 'initial_row', ID: '', ACCOUNT_HEAD_ID: '', STATUS: '1' }]
      : []

  const handleAddAccountRow = () => {
    const base =
      allowedAccountsList.length > 0
        ? allowedAccountsList
        : [{ _rowKey: 'initial_row', ID: '', ACCOUNT_HEAD_ID: '', STATUS: '1' }]
    const updated = [
      ...base,
      {
        _rowKey: `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ID: '',
        ACCOUNT_HEAD_ID: '',
        STATUS: '1',
      },
    ]
    if (onChange) {
      onChange({ target: { name: 'ALLOWED_ACCOUNTS', value: updated } })
    }
  }

  const handleAccountRowChange = (index, field, val) => {
    const base =
      allowedAccountsList.length > 0
        ? [...allowedAccountsList]
        : [{ _rowKey: 'initial_row', ID: '', ACCOUNT_HEAD_ID: '', STATUS: '1' }]
    const row = { ...(base[index] || {}), [field]: val }
    if (field === 'ACCOUNT_HEAD_ID') {
      const selected = chartOfAccountOptions.find((o) => String(o.value) === String(val))
      if (selected) {
        row.ACCOUNT_CODE = selected.code || ''
        row.ACCOUNT_HEAD_NAME = selected.name || ''
        row.ACCOUNT_DISPLAY_LABEL = selected.label || ''
      }
    }
    base[index] = row
    if (onChange) {
      onChange({ target: { name: 'ALLOWED_ACCOUNTS', value: base } })
    }
  }

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-4 max-w-2xl'}>
          {/* 1. User Name (Drop Down with write option / searchable) */}
          <div>
            <label
              className={'erp-field-label'}
              htmlFor={'USER_ID'}
            >
              User Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            {readOnly ? (
              <input
                id={'USER_ID'}
                type={'text'}
                readOnly
                disabled
                className={inputClass(false, true)}
                value={values.USER_DISPLAY_LABEL || values.USER_NAME || '-'}
              />
            ) : (
              <SearchableSelect
                id={'USER_ID'}
                name={'USER_ID'}
                disabled={isEdit || usersLoading || readOnly}
                readOnly={isEdit || readOnly}
                placeholder={
                  usersLoading
                    ? 'Loading Users...'
                    : '--Select or Type User Name : Employee Code : Employee Name--'
                }
                options={userOptions}
                value={values.USER_ID || ''}
                error={Boolean(errors.USER_ID)}
                onChange={handleUserChange}
              />
            )}
            <FieldError id={'USER_ID-error'} message={errors.USER_ID} />
          </div>

          {/* 2. Voucher Date (Multi-Select / Drop Down) */}
          <div>
            <MultiSelectField
              id={'VOUCHER_DATE'}
              name={'VOUCHER_DATE'}
              label={'Voucher Date'}
              placeholder={'--Select Voucher Date Entry Rules--'}
              options={VOUCHER_DATE_OPTIONS}
              value={values.VOUCHER_DATE || []}
              disabled={readOnly}
              onChange={onMultiSelectChange}
            />
            <FieldError id={'VOUCHER_DATE-error'} message={errors.VOUCHER_DATE} />
          </div>

          {/* 3. Voucher Type & Default Voucher Type */}
          <div className={'grid grid-cols-1 md:grid-cols-2 gap-3'}>
            <div>
              <MultiSelectField
                id={'VOUCHER_TYPE'}
                name={'VOUCHER_TYPE'}
                label={'Voucher Type'}
                placeholder={
                  lookupsLoading ? 'Loading Voucher Types...' : '--Select Voucher Types--'
                }
                options={voucherTypeOptions}
                value={values.VOUCHER_TYPE || []}
                disabled={readOnly || lookupsLoading}
                onChange={onMultiSelectChange}
              />
              <FieldError id={'VOUCHER_TYPE-error'} message={errors.VOUCHER_TYPE} />
            </div>

            <div>
              <label
                className={'erp-field-label'}
                htmlFor={'VOUCHER_TYPE_DEFAULT'}
              >
                Default Voucher Type
              </label>
              <select
                id={'VOUCHER_TYPE_DEFAULT'}
                name={'VOUCHER_TYPE_DEFAULT'}
                className={inputClass(errors.VOUCHER_TYPE_DEFAULT, readOnly || lookupsLoading)}
                value={values.VOUCHER_TYPE_DEFAULT || ''}
                disabled={readOnly || lookupsLoading}
                onChange={(e) => handleSimpleChange('VOUCHER_TYPE_DEFAULT', e.target.value)}
              >
                <option value={''}>--Select Default Voucher Type--</option>
                {defaultVoucherTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError
                id={'VOUCHER_TYPE_DEFAULT-error'}
                message={errors.VOUCHER_TYPE_DEFAULT}
              />
            </div>
          </div>

          {/* 4. Location & Default Location */}
          <div className={'grid grid-cols-1 md:grid-cols-2 gap-3'}>
            <div>
              <MultiSelectField
                id={'LOCATION'}
                name={'LOCATION'}
                label={'Location'}
                placeholder={
                  locationsLoading ? 'Loading Locations...' : '--Select Locations--'
                }
                options={locationOptions}
                value={values.LOCATION || []}
                disabled={readOnly || locationsLoading}
                onChange={onMultiSelectChange}
              />
              <FieldError id={'LOCATION-error'} message={errors.LOCATION} />
            </div>

            <div>
              <label
                className={'erp-field-label'}
                htmlFor={'LOCATION_DEFAULT'}
              >
                Default Location
              </label>
              <select
                id={'LOCATION_DEFAULT'}
                name={'LOCATION_DEFAULT'}
                className={inputClass(errors.LOCATION_DEFAULT, readOnly || locationsLoading)}
                value={values.LOCATION_DEFAULT || ''}
                disabled={readOnly || locationsLoading}
                onChange={(e) => handleSimpleChange('LOCATION_DEFAULT', e.target.value)}
              >
                <option value={''}>--Select Default Location--</option>
                {defaultLocationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError id={'LOCATION_DEFAULT-error'} message={errors.LOCATION_DEFAULT} />
            </div>
          </div>

          {/* 5. Bank Account & Default Bank Account */}
          <div className={'grid grid-cols-1 md:grid-cols-2 gap-3'}>
            <div>
              <MultiSelectField
                id={'BANK_ACCOUNT'}
                name={'BANK_ACCOUNT'}
                label={'Bank Account'}
                placeholder={
                  bankAccountsLoading ? 'Loading Accounts...' : '--Select Bank Accounts--'
                }
                options={bankAccountOptions}
                value={values.BANK_ACCOUNT || []}
                disabled={readOnly || bankAccountsLoading}
                onChange={onMultiSelectChange}
              />
              <FieldError id={'BANK_ACCOUNT-error'} message={errors.BANK_ACCOUNT} />
            </div>

            <div>
              <label
                className={'erp-field-label'}
                htmlFor={'BANK_ACCOUNT_DEFAULT'}
              >
                Default Bank Account
              </label>
              <select
                id={'BANK_ACCOUNT_DEFAULT'}
                name={'BANK_ACCOUNT_DEFAULT'}
                className={inputClass(errors.BANK_ACCOUNT_DEFAULT, readOnly || bankAccountsLoading)}
                value={values.BANK_ACCOUNT_DEFAULT || ''}
                disabled={readOnly || bankAccountsLoading}
                onChange={(e) => handleSimpleChange('BANK_ACCOUNT_DEFAULT', e.target.value)}
              >
                <option value={''}>--Select Default Bank Account--</option>
                {values.BANK_ACCOUNT_DEFAULT &&
                  !defaultBankAccountOptions.some((o) => String(o.value) === String(values.BANK_ACCOUNT_DEFAULT)) && (
                    <option value={values.BANK_ACCOUNT_DEFAULT}>
                      {values.BANK_ACCOUNT_DEFAULT_NAME || values.BANK_ACCOUNT_DEFAULT}
                    </option>
                  )}
                {defaultBankAccountOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError
                id={'BANK_ACCOUNT_DEFAULT-error'}
                message={errors.BANK_ACCOUNT_DEFAULT}
              />
            </div>
          </div>

          {/* 6. Cost Center & Default Cost Center */}
          <div className={'grid grid-cols-1 md:grid-cols-2 gap-3'}>
            <div>
              <MultiSelectField
                id={'COST_CENTER'}
                name={'COST_CENTER'}
                label={'Cost Center'}
                placeholder={
                  costCentersLoading ? 'Loading Departments...' : '--Select Cost Centers--'
                }
                options={costCenterOptions}
                value={values.COST_CENTER || []}
                disabled={readOnly || costCentersLoading}
                onChange={onMultiSelectChange}
              />
              <FieldError id={'COST_CENTER-error'} message={errors.COST_CENTER} />
            </div>

            <div>
              <label
                className={'erp-field-label'}
                htmlFor={'COST_CENTER_DEFAULT'}
              >
                Default Cost Center
              </label>
              <select
                id={'COST_CENTER_DEFAULT'}
                name={'COST_CENTER_DEFAULT'}
                className={inputClass(errors.COST_CENTER_DEFAULT, readOnly || costCentersLoading)}
                value={values.COST_CENTER_DEFAULT || ''}
                disabled={readOnly || costCentersLoading}
                onChange={(e) => handleSimpleChange('COST_CENTER_DEFAULT', e.target.value)}
              >
                <option value={''}>--Select Default Cost Center--</option>
                {defaultCostCenterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError
                id={'COST_CENTER_DEFAULT-error'}
                message={errors.COST_CENTER_DEFAULT}
              />
            </div>
          </div>

          {/* 7. Is All Accounts Head Allowed & 8. Status */}
          <div className={'grid grid-cols-1 md:grid-cols-2 gap-3'}>
            <div>
              <label
                className={'erp-field-label'}
                htmlFor={'IS_ALL_ACC_HEAD_ALLOWED'}
              >
                Is All Accounts Head Allowed ?
              </label>
              {readOnly ? (
                <input
                  id={'IS_ALL_ACC_HEAD_ALLOWED'}
                  name={'IS_ALL_ACC_HEAD_ALLOWED'}
                  type={'text'}
                  readOnly
                  className={inputClass(false, true)}
                  value={String(values.IS_ALL_ACC_HEAD_ALLOWED) === '1' ? 'Allowed' : 'Not Allowed'}
                />
              ) : (
                <div className={'flex items-center h-8'}>
                  <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2 flex items-center'}>
                    <input
                      id={'IS_ALL_ACC_HEAD_ALLOWED'}
                      className={'erp-switch-control cursor-pointer'}
                      type={'checkbox'}
                      role={'switch'}
                      name={'IS_ALL_ACC_HEAD_ALLOWED'}
                      checked={String(values.IS_ALL_ACC_HEAD_ALLOWED ?? '1') === '1'}
                      onChange={(e) => {
                        const val = e.target.checked ? '1' : '0'
                        handleSimpleChange('IS_ALL_ACC_HEAD_ALLOWED', val)
                      }}
                    />
                    <span className={'text-xs font-medium text-gray-700 select-none'}>
                      {String(values.IS_ALL_ACC_HEAD_ALLOWED ?? '1') === '1' ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </label>
                </div>
              )}
              <FieldError
                id={'IS_ALL_ACC_HEAD_ALLOWED-error'}
                message={errors.IS_ALL_ACC_HEAD_ALLOWED}
              />
            </div>

            <div>
              <label
                className={'erp-field-label'}
                htmlFor={'STATUS'}
              >
                Status
              </label>
              {readOnly ? (
                <input
                  id={'STATUS'}
                  name={'STATUS'}
                  type={'text'}
                  readOnly
                  className={inputClass(false, true)}
                  value={String(values.STATUS) === '1' ? 'Active' : 'Inactive'}
                />
              ) : (
                <div className={'flex items-center h-8'}>
                  <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2 flex items-center'}>
                    <input
                      id={'STATUS'}
                      className={'erp-switch-control cursor-pointer'}
                      type={'checkbox'}
                      role={'switch'}
                      name={'STATUS'}
                      checked={String(values.STATUS ?? '1') === '1'}
                      onChange={(e) => {
                        const val = e.target.checked ? '1' : '0'
                        handleSimpleChange('STATUS', val)
                      }}
                    />
                    <span className={'text-xs font-medium text-gray-700 select-none'}>
                      {String(values.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              )}
              <FieldError id={'STATUS-error'} message={errors.STATUS} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. User Allowed Accounts Head block (shown when IS_ALL_ACC_HEAD_ALLOWED is Not Allowed '0') */}
      {String(values.IS_ALL_ACC_HEAD_ALLOWED ?? '0') === '0' && (
        <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-xs sm:text-sm font-semibold text-gray-800 tracking-tight'}>
                User Allowed Accounts Head
              </h3>
            </div>
          </div>

          <div className={'overflow-x-auto'}>
            <table className={'w-full text-xs text-left border-collapse max-w-3xl'}>
              <thead>
                <tr className={'bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold'}>
                  <th className={'py-2 px-3 w-10 text-center'}>#</th>
                  <th className={'py-2 px-3 min-w-[280px]'}>
                    Accounts Name<span className={'text-rose-500 ml-0.5'}>*</span>
                  </th>
                  <th className={'py-2 px-3 w-36 text-center'}>Is Active ?</th>
                </tr>
              </thead>
              <tbody className={'divide-y divide-gray-100'}>
                {displayAllowedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={'py-3 text-center text-gray-400 italic'}>
                      No accounts mapped yet.
                    </td>
                  </tr>
                ) : (
                  displayAllowedAccounts.map((row, index) => {
                    const otherSelectedIds = new Set(
                      displayAllowedAccounts
                        .filter((_, i) => i !== index)
                        .map((r) => (r.ACCOUNT_HEAD_ID != null ? String(r.ACCOUNT_HEAD_ID).trim() : ''))
                        .filter(Boolean),
                    )
                    let rowAccountOptions = chartOfAccountOptions.filter(
                      (opt) => !otherSelectedIds.has(String(opt.value).trim()),
                    )
                    if (
                      row.ACCOUNT_HEAD_ID &&
                      !rowAccountOptions.some((opt) => String(opt.value) === String(row.ACCOUNT_HEAD_ID))
                    ) {
                      rowAccountOptions = [
                        {
                          value: String(row.ACCOUNT_HEAD_ID),
                          label: row.ACCOUNT_DISPLAY_LABEL || row.ACCOUNT_HEAD_NAME || String(row.ACCOUNT_HEAD_ID),
                          code: row.ACCOUNT_CODE,
                          name: row.ACCOUNT_HEAD_NAME,
                        },
                        ...rowAccountOptions,
                      ]
                    }

                    return (
                      <tr key={row._rowKey || row.ID || index} className={'hover:bg-gray-50/50'}>
                        <td className={'py-2 px-3 text-center text-gray-500 font-medium'}>
                          {index + 1}
                        </td>
                        <td className={'py-2 px-3'}>
                          {readOnly ? (
                            <input
                              type={'text'}
                              readOnly
                              className={inputClass(false, true)}
                              value={row.ACCOUNT_DISPLAY_LABEL || row.ACCOUNT_HEAD_NAME || ''}
                            />
                          ) : (
                            <SearchableSelect
                              id={`account-head-${index}`}
                              placeholder={coaLoading ? 'Loading accounts...' : '--Select/Write Account Head--'}
                              options={rowAccountOptions}
                              value={row.ACCOUNT_HEAD_ID != null ? String(row.ACCOUNT_HEAD_ID) : ''}
                              fallbackDisplay={row.ACCOUNT_DISPLAY_LABEL || row.ACCOUNT_HEAD_NAME || ''}
                              onChange={(selectedVal) => handleAccountRowChange(index, 'ACCOUNT_HEAD_ID', selectedVal)}
                              disabled={readOnly || coaLoading}
                            />
                          )}
                        </td>
                        <td className={'py-2 px-3 text-center'}>
                          <div className={'flex items-center justify-center'}>
                            <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2 flex items-center justify-center'}>
                              <input
                                type={'checkbox'}
                                className={'erp-switch-control cursor-pointer'}
                                role={'switch'}
                                checked={String(row.STATUS ?? '1') === '1'}
                                disabled={readOnly}
                                onChange={(e) => {
                                  const val = e.target.checked ? '1' : '0'
                                  handleAccountRowChange(index, 'STATUS', val)
                                }}
                              />
                              <span className={'text-xs font-medium text-gray-700 select-none'}>
                                {String(row.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {!readOnly && (
            <div className={'mt-3 pt-2 border-t border-gray-100 max-w-3xl flex justify-start'}>
              <button
                type={'button'}
                onClick={handleAddAccountRow}
                className={'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors shadow-2xs'}
              >
                <svg className={'w-3.5 h-3.5'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                  <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M12 4v16m8-8H4'} />
                </svg>
                Add More
              </button>
            </div>
          )}

          {errors.ALLOWED_ACCOUNTS && (
            <div className={'mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-rose-600 text-xs font-medium max-w-3xl'}>
              {errors.ALLOWED_ACCOUNTS}
            </div>
          )}
        </div>
      )}

      {/* 3. Actions / Buttons */}
      {!readOnly && (
        <div className={'bg-white p-3 rounded border border-gray-200 shadow-xs flex items-center gap-2'}>
          {isEdit && (
            <>
              {onReset && (
                <button
                  type={'button'}
                  disabled={submitting}
                  onClick={onReset}
                  className={
                    'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                  }
                >
                  Reset
                </button>
              )}
              <button
                type={'button'}
                disabled={submitting}
                onClick={onSubmit}
                className={
                  'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none disabled:opacity-50 transition-colors'
                }
              >
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </>
          )}

          {!isEdit && (
            <>
              {onReset && (
                <button
                  type={'button'}
                  disabled={submitting}
                  onClick={onReset}
                  className={
                    'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                  }
                >
                  Reset
                </button>
              )}
              <button
                type={'button'}
                disabled={submitting}
                onClick={onSubmit}
                className={
                  'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none disabled:opacity-50 transition-colors'
                }
              >
                {submitting ? 'Submitting...' : submitLabel || 'Save'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Audit Log on View & Edit (exact style from BankChequeMapForm) */}
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

export default UserSetupForm

