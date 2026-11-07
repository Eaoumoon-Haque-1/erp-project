/**
 * @file Controlled Supplier Master Form.
 * Implements proposed UI layout with 6 clear sections:
 * 1. General Information
 * 2. Contact Information
 * 3. Address Information
 * 4. Tax & Legal Information
 * 5. Banking & Payment Information
 * 6. Additional Information
 * Plus Audit Log block on Edit and View screens.
 */
import {
  BALANCE_TYPE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  STATUS_OPTIONS,
  SUPPLIER_TYPE_OPTIONS,
} from '../validation/supplierValidation'

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
    'w-full h-9 px-3 py-1.5 border rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
    readOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white',
    error ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300',
    extraClasses,
  ]
    .filter(Boolean)
    .join(' ')
}

function textareaClass(error, readOnly = false, extraClasses = '') {
  return [
    'w-full px-3 py-2 border rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-y',
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

function SupplierForm({
  values,
  errors = {},
  isEdit = false,
  readOnly = false,
  auditLog = null,
  submitting = false,
  submitLabel = 'Save Supplier',
  editLabel = 'Edit Supplier',
  onEdit,
  onChange = () => {},
  onSubmit = () => {},
  onCancel,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  return (
    <div className={'space-y-6 max-w-4xl mx-auto'}>
      {/* Main Form Container */}
      <div className={'bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden'}>
        {/* Header Ribbon */}
        <div className={'px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2'}>
          <div>
            <div className={'flex items-center gap-2.5'}>
              <h2 className={'text-base font-bold text-gray-800'}>Supplier Information</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                  readOnly
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : isEdit
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {readOnly ? 'View Supplier' : isEdit ? 'Edit Supplier' : 'New Supplier'}
              </span>
            </div>
          </div>
          {values.SUPPLIER_CODE && (
            <span className={'text-xs font-mono font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded'}>
              {values.SUPPLIER_CODE}
            </span>
          )}
        </div>

        <div className={'p-6 space-y-6'}>
          {/* ======================================================== */}
          {/* 1. General Information                                   */}
          {/* ======================================================== */}
          <div>
            <h3 className={'text-xs font-bold text-gray-900 tracking-tight uppercase mb-3 flex items-center gap-2'}>
              <span className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              1. General Information
            </h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              {/* Supplier Code */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'SUPPLIER_CODE'}>
                  Supplier Code<span className={'text-rose-500 ml-0.5'}>*</span>
                </label>
                <input
                  id={'SUPPLIER_CODE'}
                  name={'SUPPLIER_CODE'}
                  type={'text'}
                  value={values.SUPPLIER_CODE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Auto Generated'}
                  className={inputClass(errors.SUPPLIER_CODE, readOnly)}
                />
                <FieldError id={'SUPPLIER_CODE-err'} message={errors.SUPPLIER_CODE} />
              </div>

              {/* Supplier Type */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'SUPPLIER_TYPE'}>
                  Supplier Type<span className={'text-rose-500 ml-0.5'}>*</span>
                </label>
                <select
                  id={'SUPPLIER_TYPE'}
                  name={'SUPPLIER_TYPE'}
                  value={values.SUPPLIER_TYPE || ''}
                  disabled={readOnly}
                  onChange={handleChange}
                  className={inputClass(errors.SUPPLIER_TYPE, readOnly)}
                >
                  <option value={''}>Select type</option>
                  {SUPPLIER_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <FieldError id={'SUPPLIER_TYPE-err'} message={errors.SUPPLIER_TYPE} />
              </div>

              {/* Supplier Name */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'SUPPLIER_NAME'}>
                  Supplier Name<span className={'text-rose-500 ml-0.5'}>*</span>
                </label>
                <input
                  id={'SUPPLIER_NAME'}
                  name={'SUPPLIER_NAME'}
                  type={'text'}
                  value={values.SUPPLIER_NAME || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Enter supplier name'}
                  className={inputClass(errors.SUPPLIER_NAME, readOnly)}
                />
                <FieldError id={'SUPPLIER_NAME-err'} message={errors.SUPPLIER_NAME} />
              </div>

              {/* Business Type */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BUSINESS_TYPE'}>
                  Business Type
                </label>
                <select
                  id={'BUSINESS_TYPE'}
                  name={'BUSINESS_TYPE'}
                  value={values.BUSINESS_TYPE || ''}
                  disabled={readOnly}
                  onChange={handleChange}
                  className={inputClass(errors.BUSINESS_TYPE, readOnly)}
                >
                  <option value={''}>Select business type</option>
                  {BUSINESS_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <FieldError id={'BUSINESS_TYPE-err'} message={errors.BUSINESS_TYPE} />
              </div>

              {/* Status */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'STATUS'}>
                  Status
                </label>
                <select
                  id={'STATUS'}
                  name={'STATUS'}
                  value={values.STATUS ?? '1'}
                  disabled={readOnly}
                  onChange={handleChange}
                  className={inputClass(false, readOnly)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. Contact Information                                   */}
          {/* ======================================================== */}
          <div className={'pt-4 border-t border-gray-100'}>
            <h3 className={'text-xs font-bold text-gray-900 tracking-tight uppercase mb-3 flex items-center gap-2'}>
              <span className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              2. Contact Information
            </h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              {/* Contact Person */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'CONTACT_PERSON'}>
                  Contact Person
                </label>
                <input
                  id={'CONTACT_PERSON'}
                  name={'CONTACT_PERSON'}
                  type={'text'}
                  value={values.CONTACT_PERSON || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Contact person'}
                  className={inputClass(errors.CONTACT_PERSON, readOnly)}
                />
              </div>

              {/* Designation */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'DESIGNATION'}>
                  Designation
                </label>
                <input
                  id={'DESIGNATION'}
                  name={'DESIGNATION'}
                  type={'text'}
                  value={values.DESIGNATION || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Designation'}
                  className={inputClass(errors.DESIGNATION, readOnly)}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'PHONE'}>
                  Phone<span className={'text-rose-500 ml-0.5'}>*</span>
                </label>
                <input
                  id={'PHONE'}
                  name={'PHONE'}
                  type={'text'}
                  value={values.PHONE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'+8801XXXXXXXXX'}
                  className={inputClass(errors.PHONE, readOnly)}
                />
                <FieldError id={'PHONE-err'} message={errors.PHONE} />
              </div>

              {/* Alternate Phone */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'ALTERNATE_PHONE'}>
                  Alternate Phone
                </label>
                <input
                  id={'ALTERNATE_PHONE'}
                  name={'ALTERNATE_PHONE'}
                  type={'text'}
                  value={values.ALTERNATE_PHONE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Alternative phone'}
                  className={inputClass(errors.ALTERNATE_PHONE, readOnly)}
                />
              </div>

              {/* Email */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'EMAIL'}>
                  Email
                </label>
                <input
                  id={'EMAIL'}
                  name={'EMAIL'}
                  type={'email'}
                  value={values.EMAIL || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'supplier@example.com'}
                  className={inputClass(errors.EMAIL, readOnly)}
                />
                <FieldError id={'EMAIL-err'} message={errors.EMAIL} />
              </div>

              {/* Website */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'WEBSITE'}>
                  Website
                </label>
                <input
                  id={'WEBSITE'}
                  name={'WEBSITE'}
                  type={'text'}
                  value={values.WEBSITE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'https://www.example.com'}
                  className={inputClass(errors.WEBSITE, readOnly)}
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. Address Information                                   */}
          {/* ======================================================== */}
          <div className={'pt-4 border-t border-gray-100'}>
            <h3 className={'text-xs font-bold text-gray-900 tracking-tight uppercase mb-3 flex items-center gap-2'}>
              <span className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              3. Address Information
            </h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              {/* Country */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'COUNTRY_ID'}>
                  Country<span className={'text-rose-500 ml-0.5'}>*</span>
                </label>
                <select
                  id={'COUNTRY_ID'}
                  name={'COUNTRY_ID'}
                  value={values.COUNTRY_ID || '1'}
                  disabled={readOnly}
                  onChange={handleChange}
                  className={inputClass(errors.COUNTRY_ID, readOnly)}
                >
                  <option value={''}>Select country</option>
                  {COUNTRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FieldError id={'COUNTRY_ID-err'} message={errors.COUNTRY_ID} />
              </div>

              {/* Division / State */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'DIVISION'}>
                  Division / State
                </label>
                <input
                  id={'DIVISION'}
                  name={'DIVISION'}
                  type={'text'}
                  value={values.DIVISION || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Division'}
                  className={inputClass(errors.DIVISION, readOnly)}
                />
              </div>

              {/* District / City */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'DISTRICT'}>
                  District / City
                </label>
                <input
                  id={'DISTRICT'}
                  name={'DISTRICT'}
                  type={'text'}
                  value={values.DISTRICT || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'District'}
                  className={inputClass(errors.DISTRICT, readOnly)}
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'POSTAL_CODE'}>
                  Postal Code
                </label>
                <input
                  id={'POSTAL_CODE'}
                  name={'POSTAL_CODE'}
                  type={'text'}
                  value={values.POSTAL_CODE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Postal code'}
                  className={inputClass(errors.POSTAL_CODE, readOnly)}
                />
              </div>

              {/* Full Address */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'ADDRESS'}>
                  Full Address<span className={'text-rose-500 ml-0.5'}>*</span>
                </label>
                <textarea
                  id={'ADDRESS'}
                  name={'ADDRESS'}
                  rows={3}
                  value={values.ADDRESS || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Enter complete address'}
                  className={textareaClass(errors.ADDRESS, readOnly)}
                />
                <FieldError id={'ADDRESS-err'} message={errors.ADDRESS} />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. Tax & Legal Information                               */}
          {/* ======================================================== */}
          <div className={'pt-4 border-t border-gray-100'}>
            <h3 className={'text-xs font-bold text-gray-900 tracking-tight uppercase mb-3 flex items-center gap-2'}>
              <span className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              4. Tax & Legal Information
            </h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              {/* VAT / BIN Number */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'TAX_REGISTRATION_NO'}>
                  VAT / BIN Number
                </label>
                <input
                  id={'TAX_REGISTRATION_NO'}
                  name={'TAX_REGISTRATION_NO'}
                  type={'text'}
                  value={values.TAX_REGISTRATION_NO || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'BIN number'}
                  className={inputClass(errors.TAX_REGISTRATION_NO, readOnly)}
                />
              </div>

              {/* TIN Number */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'TIN_NUMBER'}>
                  TIN Number
                </label>
                <input
                  id={'TIN_NUMBER'}
                  name={'TIN_NUMBER'}
                  type={'text'}
                  value={values.TIN_NUMBER || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'TIN number'}
                  className={inputClass(errors.TIN_NUMBER, readOnly)}
                />
              </div>

              {/* Trade License Number */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'TRADE_LICENSE_NO'}>
                  Trade License Number
                </label>
                <input
                  id={'TRADE_LICENSE_NO'}
                  name={'TRADE_LICENSE_NO'}
                  type={'text'}
                  value={values.TRADE_LICENSE_NO || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Trade license number'}
                  className={inputClass(errors.TRADE_LICENSE_NO, readOnly)}
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. Banking & Payment Information                         */}
          {/* ======================================================== */}
          <div className={'pt-4 border-t border-gray-100'}>
            <h3 className={'text-xs font-bold text-gray-900 tracking-tight uppercase mb-3 flex items-center gap-2'}>
              <span className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              5. Banking & Payment Information
            </h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              {/* Bank Name */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BANK_NAME'}>
                  Bank Name
                </label>
                <input
                  id={'BANK_NAME'}
                  name={'BANK_NAME'}
                  type={'text'}
                  value={values.BANK_NAME || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Bank name'}
                  className={inputClass(errors.BANK_NAME, readOnly)}
                />
              </div>

              {/* Branch Name */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BANK_BRANCH'}>
                  Branch Name
                </label>
                <input
                  id={'BANK_BRANCH'}
                  name={'BANK_BRANCH'}
                  type={'text'}
                  value={values.BANK_BRANCH || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Branch name'}
                  className={inputClass(errors.BANK_BRANCH, readOnly)}
                />
              </div>

              {/* Account Name */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BANK_ACCOUNT_NAME'}>
                  Account Name
                </label>
                <input
                  id={'BANK_ACCOUNT_NAME'}
                  name={'BANK_ACCOUNT_NAME'}
                  type={'text'}
                  value={values.BANK_ACCOUNT_NAME || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Account holder name'}
                  className={inputClass(errors.BANK_ACCOUNT_NAME, readOnly)}
                />
              </div>

              {/* Account Number */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BANK_ACCOUNT_NO'}>
                  Account Number
                </label>
                <input
                  id={'BANK_ACCOUNT_NO'}
                  name={'BANK_ACCOUNT_NO'}
                  type={'text'}
                  value={values.BANK_ACCOUNT_NO || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Bank account number'}
                  className={inputClass(errors.BANK_ACCOUNT_NO, readOnly)}
                />
              </div>

              {/* Routing Number */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'ROUTING_NUMBER'}>
                  Routing Number
                </label>
                <input
                  id={'ROUTING_NUMBER'}
                  name={'ROUTING_NUMBER'}
                  type={'text'}
                  value={values.ROUTING_NUMBER || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Routing number'}
                  className={inputClass(errors.ROUTING_NUMBER, readOnly)}
                />
              </div>

              {/* Payment Terms */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'PAYMENT_TERMS'}>
                  Payment Terms
                </label>
                <select
                  id={'PAYMENT_TERMS'}
                  name={'PAYMENT_TERMS'}
                  value={values.PAYMENT_TERMS || ''}
                  disabled={readOnly}
                  onChange={handleChange}
                  className={inputClass(errors.PAYMENT_TERMS, readOnly)}
                >
                  <option value={''}>Select terms</option>
                  {PAYMENT_TERMS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'CURRENCY_CODE'}>
                  Currency
                </label>
                <select
                  id={'CURRENCY_CODE'}
                  name={'CURRENCY_CODE'}
                  value={values.CURRENCY_CODE || 'BDT'}
                  disabled={readOnly}
                  onChange={handleChange}
                  className={inputClass(errors.CURRENCY_CODE, readOnly)}
                >
                  {CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credit Limit */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'CREDIT_LIMIT'}>
                  Credit Limit
                </label>
                <input
                  id={'CREDIT_LIMIT'}
                  name={'CREDIT_LIMIT'}
                  type={'number'}
                  step={'0.01'}
                  value={values.CREDIT_LIMIT ?? '0.00'}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.CREDIT_LIMIT, readOnly)}
                />
                <FieldError id={'CREDIT_LIMIT-err'} message={errors.CREDIT_LIMIT} />
              </div>

              {/* Credit Days */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'CREDIT_DAYS'}>
                  Credit Days
                </label>
                <input
                  id={'CREDIT_DAYS'}
                  name={'CREDIT_DAYS'}
                  type={'number'}
                  step={'1'}
                  value={values.CREDIT_DAYS ?? '0'}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'0'}
                  className={inputClass(errors.CREDIT_DAYS, readOnly)}
                />
                <FieldError id={'CREDIT_DAYS-err'} message={errors.CREDIT_DAYS} />
              </div>

              {/* Opening Balance */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'OPENING_BALANCE'}>
                  Opening Balance
                </label>
                <input
                  id={'OPENING_BALANCE'}
                  name={'OPENING_BALANCE'}
                  type={'number'}
                  step={'0.01'}
                  value={values.OPENING_BALANCE ?? '0.00'}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.OPENING_BALANCE, readOnly)}
                />
                <FieldError id={'OPENING_BALANCE-err'} message={errors.OPENING_BALANCE} />
              </div>

              {/* Balance Type */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'BALANCE_TYPE'}>
                  Balance Type
                </label>
                <select
                  id={'BALANCE_TYPE'}
                  name={'BALANCE_TYPE'}
                  value={values.BALANCE_TYPE || ''}
                  disabled={readOnly}
                  onChange={handleChange}
                  className={inputClass(errors.BALANCE_TYPE, readOnly)}
                >
                  <option value={''}>Select type</option>
                  {BALANCE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 6. Additional Information                                */}
          {/* ======================================================== */}
          <div className={'pt-4 border-t border-gray-100'}>
            <h3 className={'text-xs font-bold text-gray-900 tracking-tight uppercase mb-3 flex items-center gap-2'}>
              <span className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              Additional Information
            </h3>
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={'REMARKS'}>
                Remarks
              </label>
              <textarea
                id={'REMARKS'}
                name={'REMARKS'}
                rows={3}
                value={values.REMARKS || ''}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder={'Additional notes..'}
                className={textareaClass(errors.REMARKS, readOnly)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {readOnly && (
            <div className={'pt-4 border-t border-gray-100 flex items-center justify-start gap-2'}>
              {onCancel && (
                <button
                  type={'button'}
                  onClick={onCancel}
                  className={
                    'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                  }
                >
                  Back to List
                </button>
              )}
              {onEdit && (
                <button
                  type={'button'}
                  onClick={onEdit}
                  className={
                    'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none transition-colors'
                  }
                >
                  {editLabel || 'Edit Supplier'}
                </button>
              )}
            </div>
          )}

          {!readOnly && (
            <div className={'pt-4 border-t border-gray-100 flex items-center justify-end gap-3'}>
              {onCancel && (
                <button
                  type={'button'}
                  onClick={onCancel}
                  disabled={submitting}
                  className={
                    'px-4 py-2 text-xs font-semibold rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors'
                  }
                >
                  Cancel
                </button>
              )}
              <button
                type={'button'}
                disabled={submitting}
                onClick={onSubmit}
                className={
                  'inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-md bg-gray-900 hover:bg-black text-white shadow-sm focus:outline-none disabled:opacity-50 transition-colors'
                }
              >
                <svg className={'w-3.5 h-3.5 fill-current'} viewBox={'0 0 20 20'}>
                  <path d={'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'} />
                </svg>
                {submitting ? 'Saving...' : submitLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Block on Edit and View */}
      {auditLog && (
        <div className={'bg-white p-4 rounded-xl border border-gray-200 shadow-xs'}>
          <div className={'flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>Audit Log :</h3>
            </div>
            <span
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                String(values.STATUS ?? auditLog.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(values.STATUS ?? auditLog.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'space-y-3 text-xs'}>
            {/* Created Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_USER_NAME || auditLog.CREATED_USER_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_EMP_NAME || auditLog.CREATED_EMP_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created At:
                </span>
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(auditLog.CREATED_DATETIME)}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_APP || '-'}
                </span>
              </div>
            </div>

            {/* Updated Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_USER_NAME || auditLog.UPDATED_USER_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_EMP_NAME || auditLog.UPDATED_EMP_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated At:
                </span>
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(auditLog.UPDATED_DATETIME)}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
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

export default SupplierForm

