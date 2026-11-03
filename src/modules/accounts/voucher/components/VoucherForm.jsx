/**
 * @file Controlled Account Voucher Form (Master-Detail).
 * Form design follows exact specifications:
 * - Master fields in 3-column grid (Group Name & Business Unit removed from display, populated from session)
 * - Detail table: SL No, Accounts Name (Searchable with write option), A/C Source, A/C Source Name, Cost Center, DR Amount, CR Amount, Action
 * - Running DR / CR totals with balanced badge indicator
 * - Narration textarea (Maximum 200 characters) with character counter
 * - Attachments table: SL No, File Name, Action, + Add More
 * - Action buttons: Submit, Cancel
 */
import { useId } from 'react'
import DateInput from '../../../../components/shared/DateInput'
import SearchableSelect from '../../../../components/shared/SearchableSelect'
import {
  AC_SOURCE_OPTIONS,
  POSTED_OPTIONS,
  RECONCILED_OPTIONS,
  VOUCHER_STATUS_OPTIONS,
} from '../validation/voucherValidation'

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

function tableInputClass(error, readOnly = false, extraClasses = '') {
  return [
    'w-full h-7 px-2 py-0.5 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
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

function VoucherForm({
  values,
  errors = {},
  detailErrors = [],
  details = [],
  attachments = [],
  auditLog = null,
  submitting = false,
  submitLabel = 'Submit',
  readOnly = false,
  voucherTypeOptions = [],
  paymentTypeOptions = [],
  throughOptions = [],
  locationOptions = [],
  periodOptions = [],
  bankAccountOptions = [],
  chequeOptions = [],
  coaOptions = [],
  costCenterOptions = [],
  onChange = () => {},
  onDetailChange = () => {},
  onAddDetail = () => {},
  onRemoveDetail = () => {},
  onAttachmentChange = () => {},
  onAddAttachment = () => {},
  onRemoveAttachment = () => {},
  onSubmit = () => {},
  onCancel,
}) {
  const formId = useId()

  // Calculate totals
  const totalDr = details.reduce((sum, d) => sum + (parseFloat(d.drAmount) || 0), 0)
  const totalCr = details.reduce((sum, d) => sum + (parseFloat(d.crAmount) || 0), 0)
  const isBalanced = Math.abs(totalDr - totalCr) < 0.001

  const handleFileUpload = (index, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      onAttachmentChange(index, {
        attachmentFileName: file.name,
        attachmentFile: reader.result,
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={'space-y-5'}>
      {/* ============================================================ */}
      {/* SECTION 1: MASTER DATA (3 COLUMNS)                           */}
      {/* ============================================================ */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm p-4'}>
        <div className={'grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3'}>
          {/* ---------------- COLUMN 1 ---------------- */}
          <div className={'space-y-3'}>
            {/* Voucher Date */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Voucher Date<span className={'text-rose-500 ml-0.5'}>*</span>
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={values.VOUCHER_DATE || '-'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <DateInput
                  id={'VOUCHER_DATE'}
                  name={'VOUCHER_DATE'}
                  value={values.VOUCHER_DATE || ''}
                  onChange={(e) => {
                    const val = e?.target?.value !== undefined ? e.target.value : e
                    onChange('VOUCHER_DATE', val)
                  }}
                  className={inputClass(errors.VOUCHER_DATE, false)}
                />
              )}
              <FieldError id={`${formId}-vdate-err`} message={errors.VOUCHER_DATE} />
            </div>

            {/* Voucher Type */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Voucher Type<span className={'text-rose-500 ml-0.5'}>*</span>
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={
                    values.VOUCHER_TYPE ||
                    voucherTypeOptions.find((o) => String(o.value) === String(values.VOUCHER_TYPE_ID))?.label ||
                    values.VOUCHER_TYPE_ID ||
                    '-'
                  }
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <select
                  value={values.VOUCHER_TYPE_ID || ''}
                  onChange={(e) => {
                    const opt = voucherTypeOptions.find((o) => String(o.value) === e.target.value)
                    onChange('VOUCHER_TYPE_ID', e.target.value)
                    onChange('VOUCHER_TYPE', opt ? opt.label : '')
                    onChange('PAYMENT_TYPE_ID', '')
                    onChange('PAYMENT_TYPE', '')
                    onChange('PAYMENT_THROUGH_ID', '')
                    onChange('PAYMENT_THROUGH', '')
                  }}
                  className={inputClass(errors.VOUCHER_TYPE_ID, false)}
                >
                  <option value={''}>-- Select Voucher Type --</option>
                  {voucherTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              <FieldError id={`${formId}-vtype-err`} message={errors.VOUCHER_TYPE_ID} />
            </div>

            {/* Voucher No. */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Voucher No.<span className={'text-rose-500 ml-0.5'}>*</span>
              </label>
              <input
                type={'text'}
                value={values.VOUCHER_NO || (readOnly ? '-' : '')}
                onChange={(e) => onChange('VOUCHER_NO', e.target.value)}
                placeholder={'e.g. V-2026-0001'}
                readOnly={readOnly}
                className={inputClass(errors.VOUCHER_NO, readOnly)}
              />
              <FieldError id={`${formId}-vno-err`} message={errors.VOUCHER_NO} />
            </div>

            {/* Location */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Location
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={
                    locationOptions.find((o) => String(o.value) === String(values.LOCATION_ID))?.label ||
                    values.LOCATION_ID ||
                    '-'
                  }
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <select
                  value={values.LOCATION_ID || ''}
                  onChange={(e) => onChange('LOCATION_ID', e.target.value)}
                  className={inputClass(errors.LOCATION_ID, false)}
                >
                  <option value={''}>-- Select Location --</option>
                  {locationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Payment Type: depends on Voucher Type */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Payment Type
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={
                    values.PAYMENT_TYPE ||
                    paymentTypeOptions.find((o) => String(o.value) === String(values.PAYMENT_TYPE_ID))?.label ||
                    values.PAYMENT_TYPE_ID ||
                    '-'
                  }
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <select
                  value={values.PAYMENT_TYPE_ID || ''}
                  onChange={(e) => {
                    const opt = paymentTypeOptions.find((o) => String(o.value) === e.target.value)
                    onChange('PAYMENT_TYPE_ID', e.target.value)
                    onChange('PAYMENT_TYPE', opt ? opt.label : '')
                    onChange('PAYMENT_THROUGH_ID', '')
                    onChange('PAYMENT_THROUGH', '')
                  }}
                  disabled={!values.VOUCHER_TYPE_ID}
                  className={inputClass(errors.PAYMENT_TYPE_ID, !values.VOUCHER_TYPE_ID)}
                >
                  <option value={''}>
                    {!values.VOUCHER_TYPE_ID
                      ? '-- Select Voucher Type First --'
                      : paymentTypeOptions.length === 0
                      ? '-- No Payment Types Available --'
                      : '-- Select Payment Type --'}
                  </option>
                  {paymentTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Paid To (Cheque Name) */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Paid To (Cheque Name)
              </label>
              <input
                type={'text'}
                value={values.PAYMENT_TO || (readOnly ? '-' : '')}
                onChange={(e) => onChange('PAYMENT_TO', e.target.value)}
                placeholder={'Enter payee name'}
                readOnly={readOnly}
                className={inputClass(errors.PAYMENT_TO, readOnly)}
              />
            </div>

            {/* Through: depends on Payment Type */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Through
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={
                    values.PAYMENT_THROUGH ||
                    throughOptions.find((o) => String(o.value) === String(values.PAYMENT_THROUGH_ID))?.label ||
                    values.PAYMENT_THROUGH_ID ||
                    '-'
                  }
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <select
                  value={values.PAYMENT_THROUGH_ID || ''}
                  onChange={(e) => {
                    const opt = throughOptions.find((o) => String(o.value) === e.target.value)
                    onChange('PAYMENT_THROUGH_ID', e.target.value)
                    onChange('PAYMENT_THROUGH', opt ? opt.label : '')
                  }}
                  disabled={!values.PAYMENT_TYPE_ID}
                  className={inputClass(errors.PAYMENT_THROUGH_ID, !values.PAYMENT_TYPE_ID)}
                >
                  <option value={''}>
                    {!values.PAYMENT_TYPE_ID
                      ? '-- Select Payment Type First --'
                      : throughOptions.length === 0
                      ? '-- No Payment Through Available --'
                      : '-- Select Through --'}
                  </option>
                  {throughOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ---------------- COLUMN 2 ---------------- */}
          <div className={'space-y-3'}>
            {/* Period Name: Searchable with write option, required */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Period Name<span className={'text-rose-500 ml-0.5'}>*</span>
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={values.PERIOD_NAME || '-'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <SearchableSelect
                  id={'PERIOD_NAME'}
                  name={'PERIOD_NAME'}
                  value={values.PERIOD_NAME || ''}
                  options={periodOptions}
                  placeholder={
                    periodOptions.length === 0
                      ? '-- No Open Periods Available --'
                      : '-- Select or Write Period Name --'
                  }
                  disabled={periodOptions.length === 0}
                  error={Boolean(errors.PERIOD_NAME)}
                  onChange={(val) => onChange('PERIOD_NAME', val)}
                  inputClassName={'h-8 text-xs'}
                />
              )}
              <FieldError id={`${formId}-pname-err`} message={errors.PERIOD_NAME} />
            </div>

            {/* Voucher Amount */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Voucher Amount
              </label>
              <input
                type={'text'}
                value={values.VOUCHER_AMOUNT || '0.00'}
                onChange={(e) => onChange('VOUCHER_AMOUNT', e.target.value)}
                readOnly={readOnly}
                placeholder={'0.00'}
                className={inputClass(errors.VOUCHER_AMOUNT, readOnly)}
              />
            </div>

            {/* Voucher Source */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Voucher Source
              </label>
              <input
                type={'text'}
                value={values.VOUCHER_SOURCE || 'MANUAL'}
                onChange={(e) => onChange('VOUCHER_SOURCE', e.target.value)}
                placeholder={'e.g. MANUAL'}
                readOnly={readOnly}
                className={inputClass(errors.VOUCHER_SOURCE, readOnly)}
              />
            </div>

            {/* Voucher Source Link */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Voucher Source Link
              </label>
              {readOnly ? (
                values.VOUCHER_SOURCE_LINK ? (
                  <div className={'flex items-center space-x-2'}>
                    <input
                      type={'text'}
                      value={values.VOUCHER_SOURCE_LINK}
                      readOnly
                      className={inputClass(null, true)}
                    />
                    {String(values.VOUCHER_SOURCE_LINK).startsWith('http') && (
                      <a
                        href={values.VOUCHER_SOURCE_LINK}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        className={'px-2 py-1 text-xs text-teal-600 hover:text-teal-800 underline shrink-0'}
                      >
                        Open
                      </a>
                    )}
                  </div>
                ) : (
                  <input
                    type={'text'}
                    value={'-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                )
              ) : (
                <input
                  type={'text'}
                  value={values.VOUCHER_SOURCE_LINK || ''}
                  onChange={(e) => onChange('VOUCHER_SOURCE_LINK', e.target.value)}
                  placeholder={'External link or document reference'}
                  className={inputClass(errors.VOUCHER_SOURCE_LINK, false)}
                />
              )}
            </div>

            {/* Voucher Status */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Voucher Status
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={values.VOUCHER_STATUS || 'DRAFT'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <select
                  value={values.VOUCHER_STATUS || 'DRAFT'}
                  onChange={(e) => onChange('VOUCHER_STATUS', e.target.value)}
                  className={inputClass(errors.VOUCHER_STATUS, false)}
                >
                  {VOUCHER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Approval Code */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Approval Code
              </label>
              <input
                type={'text'}
                value={values.APPROVAL_CODE || (readOnly ? '-' : '')}
                onChange={(e) => onChange('APPROVAL_CODE', e.target.value)}
                placeholder={'e.g. APPR-1029'}
                readOnly={readOnly}
                className={inputClass(errors.APPROVAL_CODE, readOnly)}
              />
            </div>
          </div>

          {/* ---------------- COLUMN 3 ---------------- */}
          <div className={'space-y-3'}>
            {/* Bank Account: Searchable with write option */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Bank Account
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={
                    bankAccountOptions.find((o) => String(o.value) === String(values.BANK_ACCOUNT))?.label ||
                    values.BANK_ACCOUNT ||
                    '-'
                  }
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <SearchableSelect
                  id={'BANK_ACCOUNT'}
                  name={'BANK_ACCOUNT'}
                  value={values.BANK_ACCOUNT || ''}
                  options={bankAccountOptions}
                  placeholder={'-- Select or Write Bank Account --'}
                  error={Boolean(errors.BANK_ACCOUNT)}
                  onChange={(val) => {
                    onChange('BANK_ACCOUNT', val)
                    onChange('CHEQUE_NO', '')
                  }}
                  inputClassName={'h-8 text-xs'}
                />
              )}
              <FieldError id={`${formId}-bacc-err`} message={errors.BANK_ACCOUNT} />
            </div>

            {/* Cheque No.: Searchable with write option */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Cheque No.
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={values.CHEQUE_NO || '-'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <SearchableSelect
                  id={'CHEQUE_NO'}
                  name={'CHEQUE_NO'}
                  value={values.CHEQUE_NO || ''}
                  options={chequeOptions}
                  placeholder={
                    !values.BANK_ACCOUNT
                      ? '-- Select Bank Account First --'
                      : chequeOptions.length === 0
                      ? '-- No Cheques Available --'
                      : '-- Select or Write Cheque No. --'
                  }
                  disabled={!values.BANK_ACCOUNT}
                  error={Boolean(errors.CHEQUE_NO)}
                  onChange={(val) => onChange('CHEQUE_NO', val)}
                  inputClassName={'h-8 text-xs'}
                />
              )}
              <FieldError id={`${formId}-cno-err`} message={errors.CHEQUE_NO} />
            </div>

            {/* Cheque Date */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Cheque Date
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={values.CHEQUE_DATE || '-'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <DateInput
                  id={'CHEQUE_DATE'}
                  name={'CHEQUE_DATE'}
                  value={values.CHEQUE_DATE || ''}
                  onChange={(e) => {
                    const val = e?.target?.value !== undefined ? e.target.value : e
                    onChange('CHEQUE_DATE', val)
                  }}
                  className={inputClass(errors.CHEQUE_DATE, false)}
                />
              )}
              <FieldError id={`${formId}-cdate-err`} message={errors.CHEQUE_DATE} />
            </div>

            {/* Cheque Amount */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Cheque Amount
              </label>
              <input
                type={'number'}
                step={'0.01'}
                value={values.CHEQUE_AMOUNT || (readOnly ? '-' : '')}
                onChange={(e) => onChange('CHEQUE_AMOUNT', e.target.value)}
                placeholder={'0.00'}
                readOnly={readOnly}
                className={inputClass(errors.CHEQUE_AMOUNT, readOnly)}
              />
            </div>

            {/* Is Posted? */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Is Posted?
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={String(values.IS_POSTED) === '1' ? 'Yes' : 'No'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <select
                  value={String(values.IS_POSTED ?? '0')}
                  onChange={(e) => onChange('IS_POSTED', e.target.value)}
                  className={inputClass(errors.IS_POSTED, false)}
                >
                  {POSTED_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Is Reconciled? */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Is Reconciled?
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={String(values.IS_RECONCILED) === '1' ? 'Yes' : 'No'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <select
                  value={String(values.IS_RECONCILED ?? '0')}
                  onChange={(e) => onChange('IS_RECONCILED', e.target.value)}
                  className={inputClass(errors.IS_RECONCILED, false)}
                >
                  {RECONCILED_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: DETAIL TABLE (Repeatable Rows)                    */}
      {/* ============================================================ */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'}>
        <div className={'px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center'}>
          <div className={'flex items-center space-x-3'}>
            <h3 className={'text-xs font-bold text-gray-700 tracking-wide uppercase'}>
              Voucher Details
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                isBalanced && totalDr > 0
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isBalanced && totalDr > 0
                ? 'Balanced (DR = CR)'
                : `Unbalanced (Diff: ${Math.abs(totalDr - totalCr).toFixed(2)})`}
            </span>
          </div>

          {!readOnly && (
            <button
              type={'button'}
              onClick={onAddDetail}
              className={
                'inline-flex items-center px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded shadow-sm transition-colors'
              }
            >
              + Add More
            </button>
          )}
        </div>

        {errors.DETAILS && (
          <div className={'px-4 py-2 bg-rose-50 border-b border-rose-200'}>
            <p className={'text-xs text-rose-700 font-medium'}>{errors.DETAILS}</p>
          </div>
        )}

        <div className={'overflow-x-auto'}>
          <table className={'w-full text-xs text-left border-collapse'}>
            <thead>
              <tr className={'bg-gray-100 text-gray-700 font-semibold border-b border-gray-200'}>
                <th className={'px-2 py-2 text-center w-12'}>SL No.</th>
                <th className={'px-2 py-2 min-w-[240px]'}>
                  Accounts Name<span className={'text-rose-500 ml-0.5'}>*</span>
                </th>
                <th className={'px-2 py-2 min-w-[130px]'}>A/C Source</th>
                <th className={'px-2 py-2 min-w-[140px]'}>A/C Source Name</th>
                <th className={'px-2 py-2 min-w-[160px]'}>Cost Center</th>
                <th className={'px-2 py-2 min-w-[110px] text-right'}>DR Amount</th>
                <th className={'px-2 py-2 min-w-[110px] text-right'}>CR Amount</th>
                {!readOnly && <th className={'px-2 py-2 text-center w-16'}>Action</th>}
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-200'}>
              {details.length === 0 ? (
                <tr>
                  <td
                    colSpan={readOnly ? 7 : 8}
                    className={'px-4 py-6 text-center text-xs text-gray-500 italic'}
                  >
                    No detail lines added. Click &quot;+ Add More&quot; to add rows.
                  </td>
                </tr>
              ) : (
                details.map((row, index) => {
                  const rowErr = detailErrors[index] || {}
                  return (
                    <tr key={index} className={'hover:bg-gray-50 transition-colors'}>
                      {/* SL No. */}
                      <td className={'px-2 py-1.5 text-center font-medium text-gray-600'}>
                        {index + 1}
                      </td>

                      {/* Accounts Name (COA): Searchable with write option */}
                      <td className={'px-2 py-1.5'}>
                        {readOnly ? (
                          <div className={'py-1 px-2 bg-gray-50 rounded text-xs text-gray-800 break-words'}>
                            {coaOptions.find((o) => String(o.value) === String(row.coaId))?.label ||
                              (row.accountCode && row.accountHeadName
                                ? `${row.accountCode} - ${row.accountHeadName}`
                                : row.accountHeadName || row.accountCode || row.coaId || '-')}
                          </div>
                        ) : (
                          <>
                            <SearchableSelect
                              id={`coa-${index}`}
                              name={`details[${index}].coaId`}
                              value={row.coaId || ''}
                              options={coaOptions}
                              placeholder={'-- Select or Write Account --'}
                              error={Boolean(rowErr.coaId)}
                              onChange={(val, opt) => {
                                onDetailChange(index, 'coaId', val)
                                if (opt?.name) {
                                  onDetailChange(index, 'accountHeadName', opt.name)
                                }
                                if (opt?.code) {
                                  onDetailChange(index, 'accountCode', opt.code)
                                }
                                if (opt?.source && opt.source !== 'None' && !row.coaSourceType) {
                                  onDetailChange(index, 'coaSourceType', opt.source)
                                }
                              }}
                              inputClassName={'h-7 py-0.5 text-xs'}
                            />
                            {rowErr.coaId && (
                              <p className={'text-[10px] text-rose-600 mt-0.5'}>{rowErr.coaId}</p>
                            )}
                          </>
                        )}
                      </td>

                      {/* A/C Source */}
                      <td className={'px-2 py-1.5'}>
                        {readOnly ? (
                          <div className={'py-1 px-2 bg-gray-50 rounded text-xs text-gray-800'}>
                            {row.coaSourceType || row.coaSourceName || '-'}
                          </div>
                        ) : (
                          <select
                            value={row.coaSourceType || row.coaSourceName || ''}
                            onChange={(e) => {
                              onDetailChange(index, 'coaSourceType', e.target.value)
                              if (!row.coaSourceName) {
                                onDetailChange(index, 'coaSourceName', e.target.value)
                              }
                            }}
                            className={tableInputClass(false, false)}
                          >
                            <option value={''}>-- Source --</option>
                            {AC_SOURCE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* A/C Source Name */}
                      <td className={'px-2 py-1.5'}>
                        {readOnly ? (
                          <div className={'py-1 px-2 bg-gray-50 rounded text-xs text-gray-800'}>
                            {row.coaSourceName && row.coaSourceName !== row.coaSourceType
                              ? row.coaSourceName
                              : (row.coaSourceId != null && String(row.coaSourceId) !== ''
                                  ? String(row.coaSourceId)
                                  : (row.coaSourceName || '-'))}
                          </div>
                        ) : (
                          <input
                            type={'text'}
                            value={
                              row.coaSourceName && row.coaSourceName !== row.coaSourceType
                                ? row.coaSourceName
                                : (row.coaSourceId || '')
                            }
                            onChange={(e) => {
                              onDetailChange(index, 'coaSourceName', e.target.value)
                              if (/^\d+$/.test(e.target.value.trim())) {
                                onDetailChange(index, 'coaSourceId', e.target.value.trim())
                              }
                            }}
                            placeholder={'Source Ref / Name'}
                            className={tableInputClass(false, false)}
                          />
                        )}
                      </td>

                      {/* Cost Center */}
                      <td className={'px-2 py-1.5'}>
                        {readOnly ? (
                          <div className={'py-1 px-2 bg-gray-50 rounded text-xs text-gray-800'}>
                            {costCenterOptions.find((o) => String(o.value) === String(row.costCenterId))?.label ||
                              row.costCenterName ||
                              row.costCenterId ||
                              '-'}
                          </div>
                        ) : (
                          <select
                            value={row.costCenterId || ''}
                            onChange={(e) => onDetailChange(index, 'costCenterId', e.target.value)}
                            className={tableInputClass(false, false)}
                          >
                            <option value={''}>-- Select Cost Center --</option>
                            {costCenterOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* DR Amount */}
                      <td className={'px-2 py-1.5 text-right'}>
                        {readOnly ? (
                          <div className={'py-1 px-2 bg-gray-50 rounded text-xs text-gray-800 text-right font-medium'}>
                            {row.drAmount !== '' && row.drAmount != null
                              ? parseFloat(row.drAmount).toFixed(2)
                              : '0.00'}
                          </div>
                        ) : (
                          <>
                            <input
                              type={'number'}
                              step={'0.01'}
                              value={row.drAmount !== '' ? row.drAmount : ''}
                              onChange={(e) => onDetailChange(index, 'drAmount', e.target.value)}
                              placeholder={'0.00'}
                              className={tableInputClass(rowErr.amount, false, 'text-right')}
                            />
                            {rowErr.amount && (
                              <p className={'text-[10px] text-rose-600 mt-0.5 text-right'}>
                                {rowErr.amount}
                              </p>
                            )}
                          </>
                        )}
                      </td>

                      {/* CR Amount */}
                      <td className={'px-2 py-1.5 text-right'}>
                        {readOnly ? (
                          <div className={'py-1 px-2 bg-gray-50 rounded text-xs text-gray-800 text-right font-medium'}>
                            {row.crAmount !== '' && row.crAmount != null
                              ? parseFloat(row.crAmount).toFixed(2)
                              : '0.00'}
                          </div>
                        ) : (
                          <input
                            type={'number'}
                            step={'0.01'}
                            value={row.crAmount !== '' ? row.crAmount : ''}
                            onChange={(e) => onDetailChange(index, 'crAmount', e.target.value)}
                            placeholder={'0.00'}
                            className={tableInputClass(rowErr.amount, false, 'text-right')}
                          />
                        )}
                      </td>

                      {/* Action */}
                      {!readOnly && (
                        <td className={'px-2 py-1.5 text-center'}>
                          <button
                            type={'button'}
                            onClick={() => onRemoveDetail(index)}
                            className={
                              'p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors'
                            }
                            title={'Remove row'}
                          >
                            ❌
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>

            {/* Table Footer: Totals */}
            <tfoot>
              <tr className={'bg-gray-100 font-bold text-gray-800 border-t-2 border-gray-300'}>
                <td colSpan={5} className={'px-3 py-2 text-right'}>
                  Total:
                </td>
                <td className={'px-2 py-2 text-right text-teal-800'}>
                  {totalDr.toFixed(2)}
                </td>
                <td className={'px-2 py-2 text-right text-teal-800'}>
                  {totalCr.toFixed(2)}
                </td>
                {!readOnly && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: NARRATION (Max 200 characters)                     */}
      {/* ============================================================ */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm p-4'}>
        <div className={'flex justify-between items-center mb-1'}>
          <label className={'block text-xs font-semibold text-gray-700'}>
            Narration
          </label>
          <span
            className={`text-[11px] ${
              (values.NARRATION?.length || 0) > 200
                ? 'text-rose-600 font-bold'
                : 'text-gray-400'
            }`}
          >
            {values.NARRATION?.length || 0} / 200 characters
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={200}
          value={values.NARRATION || ''}
          onChange={(e) => onChange('NARRATION', e.target.value)}
          placeholder={'Enter voucher narration / remarks (maximum 200 characters)...'}
          readOnly={readOnly}
          className={[
            'w-full px-2.5 py-1.5 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
            readOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white',
            errors.NARRATION ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300',
          ].join(' ')}
        />
        <FieldError id={`${formId}-narration-err`} message={errors.NARRATION} />
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: ATTACHMENTS TABLE                                */}
      {/* ============================================================ */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'}>
        <div className={'px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center'}>
          <h3 className={'text-xs font-bold text-gray-700 tracking-wide uppercase'}>
            Attachments
          </h3>
          {!readOnly && (
            <button
              type={'button'}
              onClick={onAddAttachment}
              className={
                'inline-flex items-center px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded shadow-sm transition-colors'
              }
            >
              + Add More
            </button>
          )}
        </div>

        <div className={'overflow-x-auto'}>
          <table className={'w-full text-xs text-left border-collapse'}>
            <thead>
              <tr className={'bg-gray-100 text-gray-700 font-semibold border-b border-gray-200'}>
                <th className={'px-3 py-2 text-center w-12'}>SL No.</th>
                <th className={'px-3 py-2'}>File Name / Attachment</th>
                {!readOnly && <th className={'px-3 py-2 text-center w-20'}>Action</th>}
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-200'}>
              {attachments.length === 0 ? (
                <tr>
                  <td
                    colSpan={readOnly ? 2 : 3}
                    className={'px-4 py-4 text-center text-xs text-gray-400 italic'}
                  >
                    No attachments added.
                  </td>
                </tr>
              ) : (
                attachments.map((row, index) => (
                  <tr key={index} className={'hover:bg-gray-50'}>
                    <td className={'px-3 py-2 text-center font-medium text-gray-600'}>
                      {index + 1}
                    </td>
                    <td className={'px-3 py-2'}>
                      {readOnly ? (
                        row.attachmentFile ? (
                          <a
                            href={row.attachmentFile}
                            download={row.attachmentFileName || `attachment-${index + 1}`}
                            className={'text-teal-600 hover:underline font-medium'}
                          >
                            📎 {row.attachmentFileName || 'Download file'}
                          </a>
                        ) : (
                          <span>{row.attachmentFileName || '-'}</span>
                        )
                      ) : (
                        <div className={'flex items-center space-x-2'}>
                          <input
                            type={'file'}
                            id={`file-input-${index}`}
                            onChange={(e) => handleFileUpload(index, e)}
                            className={'hidden'}
                          />
                          <label
                            htmlFor={`file-input-${index}`}
                            className={
                              'cursor-pointer px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded shadow-sm'
                            }
                          >
                            Browse File
                          </label>
                          <input
                            type={'text'}
                            value={row.attachmentFileName || ''}
                            onChange={(e) =>
                              onAttachmentChange(index, { attachmentFileName: e.target.value })
                            }
                            placeholder={'File Name / Description'}
                            className={tableInputClass(false, false, 'flex-1')}
                          />
                        </div>
                      )}
                    </td>
                    {!readOnly && (
                      <td className={'px-3 py-2 text-center'}>
                        <button
                          type={'button'}
                          onClick={() => onRemoveAttachment(index)}
                          className={
                            'p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors'
                          }
                          title={'Remove attachment'}
                        >
                          ❌
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 5: AUDIT LOG (If Viewing / Editing)                  */}
      {/* ============================================================ */}
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
                String(values?.STATUS ?? auditLog?.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(values?.STATUS ?? auditLog?.STATUS ?? '1') === '1'
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

      {/* ============================================================ */}
      {/* SECTION 6: ACTIONS                                          */}
      {/* ============================================================ */}
      <div className={'flex items-center justify-end space-x-3 pt-2'}>
        {onCancel && (
          <button
            type={'button'}
            onClick={onCancel}
            disabled={submitting}
            className={
              'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-sm transition-colors'
            }
          >
            {readOnly ? 'Back to List' : 'Cancel'}
          </button>
        )}

        {!readOnly && (
          <button
            type={'submit'}
            onClick={onSubmit}
            disabled={submitting}
            className={
              'inline-flex items-center px-5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-sm disabled:opacity-50 transition-colors'
            }
          >
            {submitting ? 'Saving...' : submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default VoucherForm
