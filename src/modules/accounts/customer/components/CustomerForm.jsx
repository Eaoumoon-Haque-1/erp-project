/**
 * @file Controlled Customer Master Form.
 * Implements layout with 6 clear sections:
 * 1. General Information
 * 2. Contact Information
 * 3. Address Information (Billing & Shipping)
 * 4. Tax & Legal Information
 * 5. Payment & Financial Information
 * 6. Additional Information
 * Plus Audit Log block on Edit and View screens.
 */
import { useEffect, useState } from 'react'
import { afmLookupApi } from '../../../../api/afmLookup'
import {
  BALANCE_TYPE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  CUSTOMER_CATEGORY_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  FINANCE_STATUS_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  STATUS_OPTIONS,
} from '../validation/customerValidation'

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

function CustomerForm({
  values,
  errors = {},
  isEdit = false,
  readOnly = false,
  auditLog = null,
  submitting = false,
  submitLabel = 'Save Customer',
  editLabel = 'Edit Customer',
  paymentTermsOptions = [],
  onEdit,
  onChange = () => {},
  onSubmit = () => {},
  onCancel,
}) {
  const [internalTermsOptions, setInternalTermsOptions] = useState([])

  // Fallback to load PTR001 lookup values if paymentTermsOptions not supplied
  useEffect(() => {
    if (paymentTermsOptions && paymentTermsOptions.length > 0) return
    let active = true
    const buId = values.BU_ID || undefined

    const fetchTerms = async () => {
      try {
        let res = await afmLookupApi
          .getValuesByTypeCode('PTR001', buId, 1)
          .catch(() => afmLookupApi.getValuesByCode('PTR001', buId, 1))
          .catch(() => afmLookupApi.getValuesByCode('Payment Terms', buId, 1))

        if ((!res || res.length === 0) && buId) {
          res = await afmLookupApi
            .getValuesByTypeCode('PTR001', undefined, 1)
            .catch(() => afmLookupApi.getValuesByCode('PTR001', undefined, 1))
            .catch(() => afmLookupApi.getValuesByCode('Payment Terms', undefined, 1))
        }

        if (!active) return
        const opts = (res || [])
          .filter((item) => item.status === undefined || item.status === null || Number(item.status) === 1)
          .map((item) => ({
            value: item.value || item.valueCode || String(item.id),
            label: item.value || item.valueCode || String(item.id),
            code: item.valueCode,
          }))
        setInternalTermsOptions(opts)
      } catch {
        // fallback
      }
    }

    fetchTerms()
    return () => {
      active = false
    }
  }, [paymentTermsOptions, values.BU_ID])
  const [sameAsBilling, setSameAsBilling] = useState(() => {
    return Boolean(
      values.ADDRESS &&
      values.SHIPPING_ADDRESS &&
      values.ADDRESS.trim() === values.SHIPPING_ADDRESS.trim()
    )
  })

  // Synchronize sameAsBilling if record loads in edit/view mode
  useEffect(() => {
    if (
      values.ADDRESS &&
      values.SHIPPING_ADDRESS &&
      values.ADDRESS.trim() === values.SHIPPING_ADDRESS.trim()
    ) {
      setSameAsBilling(true)
    }
  }, [values.ADDRESS, values.SHIPPING_ADDRESS])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'ADDRESS') {
      if (sameAsBilling) {
        onChange({ ADDRESS: value, SHIPPING_ADDRESS: value })
      } else {
        onChange('ADDRESS', value)
      }
      return
    }
    if (name === 'SHIPPING_ADDRESS') {
      if (sameAsBilling && value !== values.ADDRESS) {
        setSameAsBilling(false)
      }
      onChange('SHIPPING_ADDRESS', value)
      return
    }
    onChange(name, value)
  }

  const handleToggleSameAsBilling = (e) => {
    const checked = e.target.checked
    setSameAsBilling(checked)
    if (checked) {
      onChange('SHIPPING_ADDRESS', values.ADDRESS || '')
    }
  }

  const isDateToBeforeFrom = Boolean(
    values.AGREEMENT_DATE_FROM &&
    values.AGREEMENT_DATE_TO &&
    values.AGREEMENT_DATE_TO < values.AGREEMENT_DATE_FROM
  )
  const agreementDateToError = isDateToBeforeFrom
    ? 'Agreement Date (To) must be on or after Agreement Date (From)'
    : errors.AGREEMENT_DATE_TO

  return (
    <div
      className={'space-y-6 max-w-4xl mx-auto'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          if (!readOnly && !submitting) {
            onSubmit()
          }
        }
      }}
    >
      {/* Main Form Container */}
      <div className={'bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden'}>
        {/* Header Ribbon */}
        <div className={'px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2'}>
          <div>
            <div className={'flex items-center gap-2.5'}>
              <h2 className={'text-base font-bold text-gray-800'}>Customer Information</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                  readOnly
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : isEdit
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {readOnly ? 'View Details' : isEdit ? 'Edit Customer' : 'New Customer'}
              </span>
            </div>
          </div>
          <div className={'text-right font-mono text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 font-semibold'}>
            {values.CUSTOMER_CODE || 'CUS-AUTO'}
          </div>
        </div>

        <div className={'p-6 space-y-6'}>
          {/* ============================================================ */}
          {/* SECTION 1: GENERAL INFORMATION                               */}
          {/* ============================================================ */}
          <div className={'space-y-3'}>
            <div className={'flex items-center gap-2 pb-1 border-b border-gray-100'}>
              <div className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              <h3 className={'text-xs font-bold text-gray-700 uppercase tracking-wide'}>
                1. General Information
              </h3>
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'}>
              {/* Customer Code */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Customer Code <span className={'text-rose-500'}>*</span>
                </label>
                <input
                  type={'text'}
                  name={'CUSTOMER_CODE'}
                  value={values.CUSTOMER_CODE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'e.g. CUS-001'}
                  className={inputClass(errors.CUSTOMER_CODE, readOnly, 'font-mono text-teal-800 font-medium')}
                />
                <FieldError id={'CUSTOMER_CODE-error'} message={errors.CUSTOMER_CODE} />
              </div>

              {/* Customer Type */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Customer Type <span className={'text-rose-500'}>*</span>
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.CUSTOMER_TYPE || '-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    name={'CUSTOMER_TYPE'}
                    value={values.CUSTOMER_TYPE || ''}
                    onChange={handleChange}
                    className={inputClass(errors.CUSTOMER_TYPE, false)}
                  >
                    <option value={''}>-- Select Customer Type --</option>
                    {CUSTOMER_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
                <FieldError id={'cust-type-err'} message={errors.CUSTOMER_TYPE} />
              </div>

              {/* Customer Name */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Customer Name <span className={'text-rose-500'}>*</span>
                </label>
                <input
                  type={'text'}
                  name={'CUSTOMER_NAME'}
                  value={values.CUSTOMER_NAME || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Enter customer or company name'}
                  className={inputClass(errors.CUSTOMER_NAME, readOnly, 'font-medium')}
                />
                <FieldError id={'cust-name-err'} message={errors.CUSTOMER_NAME} />
              </div>

              {/* Business Type */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Business Type
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.BUSINESS_TYPE || '-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    name={'BUSINESS_TYPE'}
                    value={values.BUSINESS_TYPE || ''}
                    onChange={handleChange}
                    className={inputClass(errors.BUSINESS_TYPE, false)}
                  >
                    <option value={''}>-- Select Business Type --</option>
                    {BUSINESS_TYPE_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
                <FieldError id={'cust-btype-err'} message={errors.BUSINESS_TYPE} />
              </div>

              {/* Customer Category */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Customer Category
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={
                      CUSTOMER_CATEGORY_OPTIONS.find((c) => String(c.value) === String(values.CUSTOMER_CATEGORY_ID))?.label ||
                      values.CUSTOMER_CATEGORY_ID ||
                      '-'
                    }
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    name={'CUSTOMER_CATEGORY_ID'}
                    value={values.CUSTOMER_CATEGORY_ID || ''}
                    onChange={handleChange}
                    className={inputClass(null, false)}
                  >
                    <option value={''}>-- Select Customer Category --</option>
                    {CUSTOMER_CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: CONTACT INFORMATION                               */}
          {/* ============================================================ */}
          <div className={'space-y-3 pt-2'}>
            <div className={'flex items-center gap-2 pb-1 border-b border-gray-100'}>
              <div className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              <h3 className={'text-xs font-bold text-gray-700 uppercase tracking-wide'}>
                2. Contact Information
              </h3>
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'}>
              {/* Contact Person */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Contact Person
                </label>
                <input
                  type={'text'}
                  name={'CONTACT_PERSON'}
                  value={values.CONTACT_PERSON || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Enter contact person name'}
                  className={inputClass(null, readOnly)}
                />
              </div>

              {/* Designation */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Designation
                </label>
                <input
                  type={'text'}
                  name={'DESIGNATION'}
                  value={values.DESIGNATION || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'e.g. Purchase Manager, Owner'}
                  className={inputClass(null, readOnly)}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Phone
                </label>
                <input
                  type={'text'}
                  name={'PHONE'}
                  value={values.PHONE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'+8801XXXXXXXXX'}
                  className={inputClass(errors.PHONE, readOnly)}
                />
                <FieldError id={'cust-phone-err'} message={errors.PHONE} />
              </div>

              {/* WhatsApp No */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  WhatsApp No
                </label>
                <input
                  type={'text'}
                  name={'ALTERNATE_PHONE'}
                  value={values.ALTERNATE_PHONE || values.WHATSAPP_NO || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Enter WhatsApp number'}
                  className={inputClass(null, readOnly)}
                />
              </div>

              {/* Email */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Email
                </label>
                <input
                  type={'email'}
                  name={'EMAIL'}
                  value={values.EMAIL || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'customer@example.com'}
                  className={inputClass(errors.EMAIL, readOnly)}
                />
                <FieldError id={'cust-email-err'} message={errors.EMAIL} />
              </div>

              {/* Website */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Website
                </label>
                <input
                  type={'text'}
                  name={'WEBSITE'}
                  value={values.WEBSITE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'https://www.example.com'}
                  className={inputClass(null, readOnly)}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: ADDRESS INFORMATION                               */}
          {/* ============================================================ */}
          <div className={'space-y-3 pt-2'}>
            <div className={'flex items-center gap-2 pb-1 border-b border-gray-100'}>
              <div className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              <h3 className={'text-xs font-bold text-gray-700 uppercase tracking-wide'}>
                3. Address Information
              </h3>
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'}>
              {/* Country */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Country
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={
                      COUNTRY_OPTIONS.find((c) => String(c.value) === String(values.COUNTRY_ID))?.label ||
                      values.COUNTRY_ID ||
                      '-'
                    }
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    name={'COUNTRY_ID'}
                    value={values.COUNTRY_ID || ''}
                    onChange={handleChange}
                    className={inputClass(errors.COUNTRY_ID, false)}
                  >
                    <option value="">Select country</option>
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
                <FieldError id={'cust-country-err'} message={errors.COUNTRY_ID} />
              </div>

              {/* Division / State */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Division / State
                </label>
                <input
                  type={'text'}
                  name={'DIVISION'}
                  value={values.DIVISION || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'e.g. Dhaka, Chittagong'}
                  className={inputClass(null, readOnly)}
                />
              </div>

              {/* District / City */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  District / City
                </label>
                <input
                  type={'text'}
                  name={'DISTRICT'}
                  value={values.DISTRICT || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'e.g. Dhaka, Gazipur, Narayanganj'}
                  className={inputClass(null, readOnly)}
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Postal Code
                </label>
                <input
                  type={'text'}
                  name={'POSTAL_CODE'}
                  value={values.POSTAL_CODE || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'e.g. 1205'}
                  className={inputClass(null, readOnly)}
                />
              </div>

              {/* Billing / Full Address */}
              <div className={'md:col-span-2'}>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Billing / Full Address
                </label>
                <textarea
                  name={'ADDRESS'}
                  rows={2}
                  value={values.ADDRESS || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Enter complete billing address'}
                  className={textareaClass(errors.ADDRESS, readOnly)}
                />
                <FieldError id={'cust-addr-err'} message={errors.ADDRESS} />
              </div>

              {/* Shipping Address */}
              <div className={'md:col-span-2'}>
                <div className={'flex items-center justify-between mb-1'}>
                  <label className={'block text-xs font-medium text-gray-700'}>
                    Shipping Address
                  </label>
                  <label
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium select-none ${
                      readOnly
                        ? 'cursor-not-allowed text-gray-500'
                        : 'cursor-pointer text-teal-700 hover:text-teal-800'
                    }`}
                  >
                    <input
                      type={'checkbox'}
                      checked={Boolean(sameAsBilling)}
                      disabled={readOnly}
                      onChange={handleToggleSameAsBilling}
                      className={
                        'w-3.5 h-3.5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed'
                      }
                    />
                    <span>Same as Billing Address</span>
                  </label>
                </div>
                <textarea
                  name={'SHIPPING_ADDRESS'}
                  rows={2}
                  value={values.SHIPPING_ADDRESS || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'Enter delivery / warehouse address (leave blank if same as billing)'}
                  className={textareaClass(null, readOnly)}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: TAX & LEGAL INFORMATION                           */}
          {/* ============================================================ */}
          <div className={'space-y-3 pt-2'}>
            <div className={'flex items-center gap-2 pb-1 border-b border-gray-100'}>
              <div className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              <h3 className={'text-xs font-bold text-gray-700 uppercase tracking-wide'}>
                4. Tax & Legal Information
              </h3>
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'}>
              {/* VAT / BIN Number */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  VAT / BIN Number
                </label>
                <input
                  type={'text'}
                  name={'TAX_REGISTRATION_NO'}
                  value={values.TAX_REGISTRATION_NO || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'BIN number'}
                  className={inputClass(null, readOnly)}
                />
              </div>

              {/* TIN Number */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  TIN Number
                </label>
                <input
                  type={'text'}
                  name={'TIN_NUMBER'}
                  value={values.TIN_NUMBER || ''}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'TIN number'}
                  className={inputClass(null, readOnly)}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 5: PAYMENT & FINANCIAL INFORMATION                   */}
          {/* ============================================================ */}
          <div className={'space-y-3 pt-2'}>
            <div className={'flex items-center gap-2 pb-1 border-b border-gray-100'}>
              <div className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              <h3 className={'text-xs font-bold text-gray-700 uppercase tracking-wide'}>
                5. Payment & Financial Information
              </h3>
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'}>
              {/* Payment Terms */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Payment Terms
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.PAYMENT_TERMS || '-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  (() => {
                    const availableTerms =
                      paymentTermsOptions && paymentTermsOptions.length > 0
                        ? paymentTermsOptions
                        : internalTermsOptions && internalTermsOptions.length > 0
                        ? internalTermsOptions
                        : PAYMENT_TERMS_OPTIONS.map((t) => ({ value: t, label: t }))

                    const termsList = [...availableTerms]
                    if (
                      values.PAYMENT_TERMS &&
                      !termsList.some(
                        (opt) => (typeof opt === 'object' ? opt.value : opt) === values.PAYMENT_TERMS,
                      )
                    ) {
                      termsList.unshift({
                        value: values.PAYMENT_TERMS,
                        label: values.PAYMENT_TERMS,
                      })
                    }

                    return (
                      <select
                        name={'PAYMENT_TERMS'}
                        value={values.PAYMENT_TERMS || ''}
                        onChange={handleChange}
                        className={inputClass(null, false)}
                      >
                        <option value={''}>-- Select Payment Terms --</option>
                        {termsList.map((opt) => {
                          const val = typeof opt === 'object' && opt !== null ? opt.value ?? opt.label : opt
                          const label = typeof opt === 'object' && opt !== null ? opt.label ?? opt.value : opt
                          return (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          )
                        })}
                      </select>
                    )
                  })()
                )}
              </div>

              {/* Currency */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Currency
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.CURRENCY_CODE || 'BDT'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    name={'CURRENCY_CODE'}
                    value={values.CURRENCY_CODE || 'BDT'}
                    onChange={handleChange}
                    className={inputClass(null, false)}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Credit Lower Limit */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Credit Lower Limit
                </label>
                <input
                  type={'number'}
                  step={'any'}
                  name={'CREDIT_LOWER_LIMIT'}
                  value={values.CREDIT_LOWER_LIMIT !== undefined ? values.CREDIT_LOWER_LIMIT : '0.00'}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.CREDIT_LOWER_LIMIT, readOnly)}
                />
                <FieldError id={'cust-clow-err'} message={errors.CREDIT_LOWER_LIMIT} />
              </div>

              {/* Credit Upper Limit */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Credit Upper Limit
                </label>
                <input
                  type={'number'}
                  step={'any'}
                  name={'CREDIT_UPPER_LIMIT'}
                  value={values.CREDIT_UPPER_LIMIT !== undefined ? values.CREDIT_UPPER_LIMIT : '0.00'}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.CREDIT_UPPER_LIMIT, readOnly)}
                />
                <FieldError id={'cust-cupp-err'} message={errors.CREDIT_UPPER_LIMIT} />
              </div>

              {/* Credit Days */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Credit Days
                </label>
                <input
                  type={'number'}
                  name={'CREDIT_DAYS'}
                  value={values.CREDIT_DAYS !== undefined ? values.CREDIT_DAYS : '0'}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'0'}
                  className={inputClass(errors.CREDIT_DAYS, readOnly)}
                />
                <FieldError id={'cust-cdays-err'} message={errors.CREDIT_DAYS} />
              </div>

              {/* Opening Balance */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Opening Balance
                </label>
                <input
                  type={'number'}
                  step={'0.01'}
                  name={'OPENING_BALANCE'}
                  value={values.OPENING_BALANCE !== undefined ? values.OPENING_BALANCE : '0.00'}
                  onChange={handleChange}
                  readOnly={readOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.OPENING_BALANCE, readOnly)}
                />
                <FieldError id={'cust-obal-err'} message={errors.OPENING_BALANCE} />
              </div>

              {/* Balance Type */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Balance Type
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.BALANCE_TYPE || '-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    name={'BALANCE_TYPE'}
                    value={values.BALANCE_TYPE || ''}
                    onChange={handleChange}
                    className={inputClass(null, false)}
                  >
                    <option value={''}>-- Select Type --</option>
                    {BALANCE_TYPE_OPTIONS.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Agreement Date (From) */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Agreement Date (From)
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.AGREEMENT_DATE_FROM || '-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <input
                    type={'date'}
                    name={'AGREEMENT_DATE_FROM'}
                    value={values.AGREEMENT_DATE_FROM || ''}
                    onChange={handleChange}
                    className={inputClass(errors.AGREEMENT_DATE_FROM, false)}
                  />
                )}
                <FieldError id={'cust-agfrom-err'} message={errors.AGREEMENT_DATE_FROM} />
              </div>

              {/* Agreement Date (To) */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Agreement Date (To)
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.AGREEMENT_DATE_TO || '-'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <input
                    type={'date'}
                    name={'AGREEMENT_DATE_TO'}
                    value={values.AGREEMENT_DATE_TO || ''}
                    min={values.AGREEMENT_DATE_FROM || undefined}
                    onChange={handleChange}
                    className={inputClass(agreementDateToError, false)}
                  />
                )}
                <FieldError id={'cust-agto-err'} message={agreementDateToError} />
              </div>

              {/* Finance Status (Dropdown, Data = Draft, Approved, default Draft) */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Finance Status
                </label>
                {readOnly ? (
                  <input
                    type={'text'}
                    value={values.FINANCE_STATUS || 'Draft'}
                    readOnly
                    className={inputClass(null, true)}
                  />
                ) : (
                  <select
                    name={'FINANCE_STATUS'}
                    value={values.FINANCE_STATUS || 'Draft'}
                    onChange={handleChange}
                    className={inputClass(null, false)}
                  >
                    {FINANCE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 6: ADDITIONAL INFORMATION                            */}
          {/* ============================================================ */}
          <div className={'space-y-3 pt-2'}>
            <div className={'flex items-center gap-2 pb-1 border-b border-gray-100'}>
              <div className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
              <h3 className={'text-xs font-bold text-gray-700 uppercase tracking-wide'}>
                6. Additional Information
              </h3>
            </div>

            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Remarks
              </label>
              <textarea
                name={'REMARKS'}
                rows={3}
                value={values.REMARKS || ''}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder={'Additional customer notes or terms...'}
                className={textareaClass(null, readOnly)}
              />
            </div>

            {/* Is Active */}
            <div>
              <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
                Is Active
              </label>
              {readOnly ? (
                <input
                  type={'text'}
                  value={String(values.STATUS) === '1' ? 'Active' : 'Inactive'}
                  readOnly
                  className={inputClass(null, true)}
                />
              ) : (
                <div className={'flex items-center h-8'}>
                  <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2 flex items-center'}>
                    <input
                      id={'cust-status-switch'}
                      className={'erp-switch-control'}
                      type={'checkbox'}
                      role={'switch'}
                      name={'STATUS'}
                      checked={String(values.STATUS ?? '1') === '1'}
                      onChange={(e) => {
                        const val = e.target.checked ? '1' : '0'
                        onChange('STATUS', val)
                      }}
                    />
                    <span className={'text-xs font-medium text-gray-700 select-none'}>
                      {String(values.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={'flex items-center justify-end gap-3 pt-4 border-t border-gray-100'}>
            {onCancel && (
              <button
                type={'button'}
                onClick={onCancel}
                className={
                  'px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors'
                }
              >
                {readOnly ? 'Back to List' : 'Cancel'}
              </button>
            )}

            {readOnly ? (
              onEdit && (
                <button
                  type={'button'}
                  onClick={onEdit}
                  className={
                    'px-5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-xs transition-colors'
                  }
                >
                  {editLabel}
                </button>
              )
            ) : (
              <button
                type={'button'}
                disabled={submitting}
                onClick={onSubmit}
                className={
                  'px-5 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-xs disabled:opacity-50 transition-colors'
                }
              >
                {submitting ? 'Saving...' : submitLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* AUDIT LOG BLOCK (VIEW AND EDIT MODES)                        */}
      {/* ============================================================ */}
      {auditLog && (
        <div className={'bg-white rounded-xl border border-gray-200 shadow-xs p-6'}>
          <div className={'flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-gray-200'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-2 h-2 rounded-full bg-teal-600'} />
              <h3 className={'text-xs font-bold text-gray-800 uppercase tracking-wider'}>
                Audit Trail & History
              </h3>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                String(auditLog.STATUS) === '1'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              Status: {String(auditLog.STATUS) === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'grid grid-cols-2 sm:grid-cols-4 gap-3'}>
            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Created By User
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {auditLog.CREATED_USER_NAME || auditLog.CREATED_USER_ID || '-'}
              </span>
            </div>

            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Created Employee
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {auditLog.CREATED_EMP_NAME || auditLog.CREATED_EMP_ID || '-'}
              </span>
            </div>

            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Created Date & Time
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {formatAuditDateTime(auditLog.CREATED_DATETIME)}
              </span>
            </div>

            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Created App
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {auditLog.CREATED_APP || '-'}
              </span>
            </div>

            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Updated By User
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {auditLog.UPDATED_USER_NAME || auditLog.UPDATED_USER_ID || '-'}
              </span>
            </div>

            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Updated Employee
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {auditLog.UPDATED_EMP_NAME || auditLog.UPDATED_EMP_ID || '-'}
              </span>
            </div>

            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Updated Date & Time
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {formatAuditDateTime(auditLog.UPDATED_DATETIME)}
              </span>
            </div>

            <div className={'p-2.5 bg-gray-50 rounded-lg border border-gray-100'}>
              <span className={'block text-[10px] font-medium text-gray-500 uppercase'}>
                Updated App
              </span>
              <span className={'block text-xs font-semibold text-gray-800 mt-0.5 truncate'}>
                {auditLog.UPDATED_APP || '-'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerForm

