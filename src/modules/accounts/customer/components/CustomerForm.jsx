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
import { getApiErrorMessage } from '../../../../api/errors'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { afmLookupApi } from '../../../../api/afmLookup'
import { afmLookupData } from '../../../../config/afmLookupData'
import { customerApi } from '../api/customerApi'
import CustomerAgreementModal from './CustomerAgreementModal'
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
  customerId = null,
  values,
  errors = {},
  isEdit = false,
  readOnly = false,
  auditLog = null,
  submitting = false,
  submitLabel = 'Save Customer',
  editLabel = 'Edit Customer',
  paymentTermsOptions = [],
  agreements = [],
  onEdit,
  onChange = () => {},
  onSubmit = () => {},
  onAgreementCreated,
  onCancel,
}) {
  const [internalTermsOptions, setInternalTermsOptions] = useState([])
  const [internalAgreements, setInternalAgreements] = useState([])
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false)
  const [isAgreementSubmitting, setIsAgreementSubmitting] = useState(false)

  const isFinanceApproved = String(values.FINANCE_STATUS || '').toLowerCase() === 'approved'
  const isSavedApprovedInDb = Boolean(
    isEdit &&
    values.ID &&
    String(auditLog?.FINANCE_STATUS || '').toLowerCase() === 'approved'
  )

  // 1) 5. Payment & Financial Information fields (Payment Terms, Currency, Limits, Days, Balance, Dates):
  // - In Create page: when FINANCE_STATUS == 'Approved' -> disabled/readonly instantly!
  //                   when FINANCE_STATUS == 'Draft' -> enabled/editable.
  // - In Edit page: when FINANCE_STATUS == 'Approved' (or saved in DB as Approved) -> disabled/readonly!
  //                 when FINANCE_STATUS == 'Draft' -> enabled/editable.
  // - In View page: disabled/readonly.
  const isFinancialTermsReadOnly = readOnly || isFinanceApproved || isSavedApprovedInDb

  // 2) Finance Status field:
  // - In Create page: ALWAYS enabled/editable (Except Finance Status).
  // - In Edit page: when FINANCE_STATUS == 'Approved' (or saved in DB as Approved) -> disabled/readonly (including Finance Status)!
  // - In View page: disabled/readonly.
  const isFinanceStatusReadOnly = readOnly || Boolean(isEdit && (isFinanceApproved || isSavedApprovedInDb))

  const handleNewAgreementSubmit = async (agreementData) => {
    const targetId = customerId || values.ID || values.id
    try {
      setIsAgreementSubmitting(true)
      const payload = {
        paymentTerms: agreementData.PAYMENT_TERMS ? String(agreementData.PAYMENT_TERMS).trim() : null,
        currencyCode: agreementData.CURRENCY_CODE ? String(agreementData.CURRENCY_CODE).trim() : 'BDT',
        creditLowerLimit:
          agreementData.CREDIT_LOWER_LIMIT !== '' && agreementData.CREDIT_LOWER_LIMIT != null
            ? Number(agreementData.CREDIT_LOWER_LIMIT)
            : 0,
        creditUpperLimit:
          agreementData.CREDIT_UPPER_LIMIT !== '' && agreementData.CREDIT_UPPER_LIMIT != null
            ? Number(agreementData.CREDIT_UPPER_LIMIT)
            : 0,
        creditDays:
          agreementData.CREDIT_DAYS !== '' && agreementData.CREDIT_DAYS != null
            ? parseInt(agreementData.CREDIT_DAYS, 10)
            : 0,
        openingBalance:
          agreementData.OPENING_BALANCE !== '' && agreementData.OPENING_BALANCE != null
            ? Number(agreementData.OPENING_BALANCE)
            : 0,
        balanceType: agreementData.BALANCE_TYPE ? String(agreementData.BALANCE_TYPE).trim() : 'Debit',
        agreementDateFrom: agreementData.AGREEMENT_DATE_FROM || null,
        agreementDateTo: agreementData.AGREEMENT_DATE_TO || null,
        financeStatus: 'Approved',
      }

      if (targetId) {
        // Customer already exists in database (Edit / View page)
        const updatedCustomer = await customerApi.createNewAgreement(targetId, payload)
        showSuccess('New Financial Agreement submitted and approved successfully!')
        setIsAgreementModalOpen(false)

        const freshAgreements = await customerApi.getFinancialAgreements(targetId).catch(() => [])
        setInternalAgreements(Array.isArray(freshAgreements) ? freshAgreements : [])

        if (typeof onChange === 'function') {
          onChange({
            PAYMENT_TERMS: agreementData.PAYMENT_TERMS,
            CURRENCY_CODE: agreementData.CURRENCY_CODE,
            CREDIT_LOWER_LIMIT: String(payload.creditLowerLimit),
            CREDIT_UPPER_LIMIT: String(payload.creditUpperLimit),
            CREDIT_DAYS: String(payload.creditDays),
            OPENING_BALANCE: String(payload.openingBalance),
            BALANCE_TYPE: agreementData.BALANCE_TYPE,
            AGREEMENT_DATE_FROM: agreementData.AGREEMENT_DATE_FROM,
            AGREEMENT_DATE_TO: agreementData.AGREEMENT_DATE_TO,
            FINANCE_STATUS: 'Approved',
          })
        }

        if (typeof onAgreementCreated === 'function') {
          onAgreementCreated(updatedCustomer)
        }
      } else {
        // Customer does not exist yet (Create page)
        if (typeof onChange === 'function') {
          onChange({
            PAYMENT_TERMS: agreementData.PAYMENT_TERMS,
            CURRENCY_CODE: agreementData.CURRENCY_CODE,
            CREDIT_LOWER_LIMIT: String(payload.creditLowerLimit),
            CREDIT_UPPER_LIMIT: String(payload.creditUpperLimit),
            CREDIT_DAYS: String(payload.creditDays),
            OPENING_BALANCE: String(payload.openingBalance),
            BALANCE_TYPE: agreementData.BALANCE_TYPE,
            AGREEMENT_DATE_FROM: agreementData.AGREEMENT_DATE_FROM,
            AGREEMENT_DATE_TO: agreementData.AGREEMENT_DATE_TO,
            FINANCE_STATUS: 'Approved',
          })
        }
        showSuccess('Financial Agreement details populated. Save customer to create record in database.')
        setIsAgreementModalOpen(false)
      }
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to create financial agreement.'))
    } finally {
      setIsAgreementSubmitting(false)
    }
  }

  // Load agreements if customer ID exists
  useEffect(() => {
    if (agreements && agreements.length > 0) {
      setInternalAgreements(agreements)
      return
    }
    if (!values.ID) {
      setInternalAgreements([])
      return
    }
    let active = true
    customerApi
      .getFinancialAgreements(values.ID)
      .then((res) => {
        if (!active) return
        setInternalAgreements(Array.isArray(res) ? res : [])
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [agreements, values.ID, values.FINANCE_STATUS])

  // Fallback to load lookup values using centralized afmLookupData.paymentTerms if paymentTermsOptions not supplied
  useEffect(() => {
    if (paymentTermsOptions && paymentTermsOptions.length > 0) return
    let active = true
    const typeCode = afmLookupData.paymentTerms
    if (!typeCode) return undefined
    const buId = values.BU_ID || undefined

    const fetchTerms = async () => {
      try {
        let res = await afmLookupApi
          .getValuesByTypeCode(typeCode, buId, 1)
          .catch(() => afmLookupApi.getValuesByCode(typeCode, buId, 1))

        if ((!res || res.length === 0) && buId) {
          res = await afmLookupApi
            .getValuesByTypeCode(typeCode, undefined, 1)
            .catch(() => afmLookupApi.getValuesByCode(typeCode, undefined, 1))
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
            <div className={'flex items-center justify-between pb-1 border-b border-gray-100'}>
              <div className={'flex items-center gap-2'}>
                <div className={'w-1.5 h-3.5 bg-teal-600 rounded-full'} />
                <h3 className={'text-xs font-bold text-gray-700 uppercase tracking-wide'}>
                  5. Payment & Financial Information
                </h3>
                {(isSavedApprovedInDb || (isEdit && isFinanceApproved)) && (
                  <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300'}>
                    <svg className={'w-3 h-3 text-emerald-600'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                      <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'} />
                    </svg>
                    Approved (Read Only)
                  </span>
                )}
              </div>

              <button
                type={'button'}
                onClick={() => setIsAgreementModalOpen(true)}
                className={'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-colors cursor-pointer'}
                title={'Open new financial agreement popup form'}
              >
                <svg className={'w-3.5 h-3.5'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                  <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M12 4v16m8-8H4'} />
                </svg>
                New Agreement
              </button>
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'}>
              {/* Payment Terms */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Payment Terms {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                {isFinancialTermsReadOnly ? (
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
                        className={inputClass(errors.PAYMENT_TERMS, false)}
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
                <FieldError id={'cust-pterms-err'} message={errors.PAYMENT_TERMS} />
              </div>

              {/* Currency */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Currency {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                {isFinancialTermsReadOnly ? (
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
                    className={inputClass(errors.CURRENCY_CODE, false)}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
                <FieldError id={'cust-curr-err'} message={errors.CURRENCY_CODE} />
              </div>

              {/* Credit Lower Limit */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Credit Lower Limit {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                <input
                  type={'number'}
                  step={'any'}
                  name={'CREDIT_LOWER_LIMIT'}
                  value={values.CREDIT_LOWER_LIMIT !== undefined ? values.CREDIT_LOWER_LIMIT : '0.00'}
                  onChange={handleChange}
                  readOnly={isFinancialTermsReadOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.CREDIT_LOWER_LIMIT, isFinancialTermsReadOnly)}
                />
                <FieldError id={'cust-clow-err'} message={errors.CREDIT_LOWER_LIMIT} />
              </div>

              {/* Credit Upper Limit */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Credit Upper Limit {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                <input
                  type={'number'}
                  step={'any'}
                  name={'CREDIT_UPPER_LIMIT'}
                  value={values.CREDIT_UPPER_LIMIT !== undefined ? values.CREDIT_UPPER_LIMIT : '0.00'}
                  onChange={handleChange}
                  readOnly={isFinancialTermsReadOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.CREDIT_UPPER_LIMIT, isFinancialTermsReadOnly)}
                />
                <FieldError id={'cust-cupp-err'} message={errors.CREDIT_UPPER_LIMIT} />
              </div>

              {/* Credit Days */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Credit Days {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                <input
                  type={'number'}
                  name={'CREDIT_DAYS'}
                  value={values.CREDIT_DAYS !== undefined ? values.CREDIT_DAYS : '0'}
                  onChange={handleChange}
                  readOnly={isFinancialTermsReadOnly}
                  placeholder={'0'}
                  className={inputClass(errors.CREDIT_DAYS, isFinancialTermsReadOnly)}
                />
                <FieldError id={'cust-cdays-err'} message={errors.CREDIT_DAYS} />
              </div>

              {/* Opening Balance */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Opening Balance {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                <input
                  type={'number'}
                  step={'0.01'}
                  name={'OPENING_BALANCE'}
                  value={values.OPENING_BALANCE !== undefined ? values.OPENING_BALANCE : '0.00'}
                  onChange={handleChange}
                  readOnly={isFinancialTermsReadOnly}
                  placeholder={'0.00'}
                  className={inputClass(errors.OPENING_BALANCE, isFinancialTermsReadOnly)}
                />
                <FieldError id={'cust-obal-err'} message={errors.OPENING_BALANCE} />
              </div>

              {/* Balance Type */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Balance Type {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                {isFinancialTermsReadOnly ? (
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
                    className={inputClass(errors.BALANCE_TYPE, false)}
                  >
                    <option value={''}>-- Select Type --</option>
                    {BALANCE_TYPE_OPTIONS.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                )}
                <FieldError id={'cust-btype-err'} message={errors.BALANCE_TYPE} />
              </div>

              {/* Agreement Date (From) */}
              <div>
                <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                  Agreement Date (From) {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                {isFinancialTermsReadOnly ? (
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
                  Agreement Date (To) {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                {isFinancialTermsReadOnly ? (
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
                  Finance Status {values.FINANCE_STATUS === 'Approved' && <span className={'text-rose-500'}>*</span>}
                </label>
                {isFinanceStatusReadOnly ? (
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

              {/* Informational banner when creating with Approved status */}
              {!isEdit && !readOnly && values.FINANCE_STATUS === 'Approved' && (
                <div className={'md:col-span-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2'}>
                  <svg className={'w-4 h-4 text-emerald-600 shrink-0'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                    <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} />
                  </svg>
                  <span>
                    <strong>Finance Status is Approved:</strong> Saving will automatically create an active agreement record in table <code>AFM_CUST_FIN_AGREEMENT</code> (STATUS = 1).
                  </span>
                </div>
              )}

              {/* Financial Agreements History (Table: AFM_CUST_FIN_AGREEMENT) */}
              {(isEdit || readOnly || internalAgreements.length > 0) && (
                <div className={'md:col-span-2 pt-3 border-t border-gray-200 mt-2 space-y-2'}>
                  <div className={'flex items-center justify-between'}>
                    <div className={'flex items-center gap-2'}>
                      <span className={'text-xs font-semibold text-gray-800'}>
                        Financial Agreement Records
                      </span>
                      {values.FINANCE_STATUS === 'Approved' ? (
                        <span className={'px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300'}>
                          Approved
                        </span>
                      ) : (
                        <span className={'px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-300'}>
                          Draft
                        </span>
                      )}
                    </div>
                    <span className={'text-[11px] text-gray-500'}>
                      {internalAgreements.filter((a) => Number(a.status) === 1).length} Active Agreement
                    </span>
                  </div>

                  {internalAgreements.length > 0 ? (
                    <div className={'overflow-x-auto border border-gray-200 rounded-md bg-white'}>
                      <table className={'w-full text-xs text-left divide-y divide-gray-200'}>
                        <thead className={'bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider'}>
                          <tr>
                            <th className={'px-3 py-2'}>Agr #</th>
                            <th className={'px-3 py-2'}>Period (From - To)</th>
                            <th className={'px-3 py-2'}>Credit Limits</th>
                            <th className={'px-3 py-2'}>Payment Terms</th>
                            <th className={'px-3 py-2'}>Days</th>
                            <th className={'px-3 py-2'}>Currency</th>
                            <th className={'px-3 py-2'}>Finance Status</th>
                            <th className={'px-3 py-2 text-center'}>Agreement Status</th>
                          </tr>
                        </thead>
                        <tbody className={'divide-y divide-gray-100 text-[11px]'}>
                          {internalAgreements.map((agr) => {
                            const isActive = Number(agr.status) === 1
                            return (
                              <tr
                                key={agr.id}
                                className={isActive ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'bg-white hover:bg-gray-50 text-gray-600'}
                              >
                                <td className={'px-3 py-2 font-mono font-medium text-gray-800'}>
                                  #{agr.id}
                                </td>
                                <td className={'px-3 py-2'}>
                                  {agr.agreementDateFrom || '-'} &rarr; {agr.agreementDateTo || '-'}
                                </td>
                                <td className={'px-3 py-2 font-mono'}>
                                  {agr.creditLowerLimit != null ? Number(agr.creditLowerLimit).toFixed(2) : '0.00'} -{' '}
                                  {agr.creditUpperLimit != null ? Number(agr.creditUpperLimit).toFixed(2) : '0.00'}
                                </td>
                                <td className={'px-3 py-2'}>{agr.paymentTerms || '-'}</td>
                                <td className={'px-3 py-2'}>{agr.creditDays ?? '-'}</td>
                                <td className={'px-3 py-2'}>{agr.currencyCode || 'BDT'}</td>
                                <td className={'px-3 py-2'}>
                                  <span className={'px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800'}>
                                    {agr.financeStatus || 'Approved'}
                                  </span>
                                </td>
                                <td className={'px-3 py-2 text-center'}>
                                  {isActive ? (
                                    <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white'}>
                                      Active (1)
                                    </span>
                                  ) : (
                                    <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-700'}>
                                      Inactive (0)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={'p-3 bg-gray-50 border border-dashed border-gray-300 rounded text-center text-xs text-gray-500'}>
                      No financial agreement records yet. When Finance Status is set to <strong>Approved</strong>, an agreement record is automatically created with STATUS = 1.
                    </div>
                  )}
                </div>
              )}
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

      {/* New Financial Agreement Modal */}
      <CustomerAgreementModal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        initialData={values}
        paymentTermsOptions={
          paymentTermsOptions && paymentTermsOptions.length > 0
            ? paymentTermsOptions
            : internalTermsOptions
        }
        onSubmit={handleNewAgreementSubmit}
        submitting={isAgreementSubmitting}
      />
    </div>
  )
}

export default CustomerForm

