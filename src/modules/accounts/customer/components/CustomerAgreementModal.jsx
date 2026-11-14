/**
 * @file Modal dialog for creating a New Financial Agreement (AFM_CUST_FIN_AGREEMENT).
 * Renders Section 5 (Payment & Financial Information) fields as mandatory.
 * Finance Status defaults to 'Approved' and is read-only.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { confirmAction, showError } from '../../../../components/shared/actionAlerts'
import {
  BALANCE_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  validateFinancialAgreement,
} from '../validation/customerValidation'

function FieldError({ message }) {
  if (!message) return null
  return <p className={'text-xs text-rose-600 mt-1 font-medium'}>{message}</p>
}

function inputClass(error, readOnly = false) {
  return [
    'w-full h-9 px-3 py-1.5 border rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
    readOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white',
    error ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300',
  ].join(' ')
}

function CustomerAgreementModal({
  isOpen,
  onClose,
  initialData = {},
  paymentTermsOptions = [],
  onSubmit,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    PAYMENT_TERMS: '',
    CURRENCY_CODE: 'BDT',
    CREDIT_LOWER_LIMIT: '0.00',
    CREDIT_UPPER_LIMIT: '0.00',
    CREDIT_DAYS: '0',
    OPENING_BALANCE: '0.00',
    BALANCE_TYPE: 'Debit',
    AGREEMENT_DATE_FROM: '',
    AGREEMENT_DATE_TO: '',
    FINANCE_STATUS: 'Approved',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        PAYMENT_TERMS: initialData.PAYMENT_TERMS || '',
        CURRENCY_CODE: initialData.CURRENCY_CODE || 'BDT',
        CREDIT_LOWER_LIMIT: initialData.CREDIT_LOWER_LIMIT != null ? String(initialData.CREDIT_LOWER_LIMIT) : '0.00',
        CREDIT_UPPER_LIMIT: initialData.CREDIT_UPPER_LIMIT != null ? String(initialData.CREDIT_UPPER_LIMIT) : '0.00',
        CREDIT_DAYS: initialData.CREDIT_DAYS != null ? String(initialData.CREDIT_DAYS) : '0',
        OPENING_BALANCE: initialData.OPENING_BALANCE != null ? String(initialData.OPENING_BALANCE) : '0.00',
        BALANCE_TYPE: initialData.BALANCE_TYPE || 'Debit',
        AGREEMENT_DATE_FROM: initialData.AGREEMENT_DATE_FROM || '',
        AGREEMENT_DATE_TO: initialData.AGREEMENT_DATE_TO || '',
        FINANCE_STATUS: 'Approved',
      })
      setErrors({})
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'AGREEMENT_DATE_FROM' || name === 'AGREEMENT_DATE_TO') {
        if (next.AGREEMENT_DATE_FROM && next.AGREEMENT_DATE_TO && next.AGREEMENT_DATE_TO < next.AGREEMENT_DATE_FROM) {
          setErrors((errs) => ({
            ...errs,
            AGREEMENT_DATE_TO: 'Agreement Date (To) must be on or after Agreement Date (From)',
          }))
        } else {
          setErrors((errs) => {
            if (!errs.AGREEMENT_DATE_TO) return errs
            const copy = { ...errs }
            delete copy.AGREEMENT_DATE_TO
            return copy
          })
        }
      }
      return next
    })

    if (errors[name] && name !== 'AGREEMENT_DATE_TO') {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault()
      if (typeof e.stopPropagation === 'function') e.stopPropagation()
    }
    const validationErrors = validateFinancialAgreement(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showError('Please complete all mandatory fields in Payment & Financial Information.')
      return
    }

    const confirmed = await confirmAction({
      title: 'Submit Financial Agreement?',
      text: 'This Data can not Editable next time Do you want to Submit it?',
      action: 'create',
      confirmButtonText: 'Yes, Submit',
    })

    if (!confirmed) return

    await onSubmit(formData)
  }

  const isDateToBeforeFrom = Boolean(
    formData.AGREEMENT_DATE_FROM &&
    formData.AGREEMENT_DATE_TO &&
    formData.AGREEMENT_DATE_TO < formData.AGREEMENT_DATE_FROM
  )
  const agreementDateToError = isDateToBeforeFrom
    ? 'Agreement Date (To) must be on or after Agreement Date (From)'
    : errors.AGREEMENT_DATE_TO

  const modalContent = (
    <div className={'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs'}>
      <div className={'bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150'}>
        {/* Header */}
        <div className={'flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-teal-700 to-teal-800 text-white'}>
          <div className={'flex items-center gap-2'}>
            <svg className={'w-5 h-5 text-teal-200'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
              <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'} />
            </svg>
            <h3 className={'text-sm font-semibold'}>
              New Financial Agreement
            </h3>
          </div>
          <button
            type={'button'}
            onClick={onClose}
            disabled={submitting}
            className={'text-teal-100 hover:text-white p-1 rounded transition-colors'}
          >
            <svg className={'w-5 h-5'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
              <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M6 18L18 6M6 6l12 12'} />
            </svg>
          </button>
        </div>

        {/* Notice */}
        <div className={'px-5 py-3 bg-amber-100 border-b-2 border-amber-300 text-amber-950 text-xs flex items-center gap-2.5 shadow-2xs'}>
          <svg className={'w-5 h-5 text-amber-700 shrink-0'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
            <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2.5} d={'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'} />
          </svg>
          <span className={'font-bold tracking-wide'}>
            Every field is mandatory. Submitting will activate this agreement and inactivate previously approved agreements.
          </span>
        </div>

        {/* Form Body - non-nested container */}
        <div className={'p-5 space-y-4 max-h-[75vh] overflow-y-auto'}>
          <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            {/* Agreement Date (From) */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Agreement Date (From) <span className={'text-rose-500'}>*</span>
              </label>
              <input
                type={'date'}
                name={'AGREEMENT_DATE_FROM'}
                value={formData.AGREEMENT_DATE_FROM}
                onChange={handleChange}
                className={inputClass(errors.AGREEMENT_DATE_FROM)}
              />
              <FieldError message={errors.AGREEMENT_DATE_FROM} />
            </div>

            {/* Agreement Date (To) */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Agreement Date (To) <span className={'text-rose-500'}>*</span>
              </label>
              <input
                type={'date'}
                name={'AGREEMENT_DATE_TO'}
                value={formData.AGREEMENT_DATE_TO}
                min={formData.AGREEMENT_DATE_FROM || undefined}
                onChange={handleChange}
                className={inputClass(agreementDateToError)}
              />
              <FieldError message={agreementDateToError} />
            </div>

            {/* Payment Terms */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Payment Terms <span className={'text-rose-500'}>*</span>
              </label>
              {paymentTermsOptions.length > 0 ? (
                <select
                  name={'PAYMENT_TERMS'}
                  value={formData.PAYMENT_TERMS}
                  onChange={handleChange}
                  className={inputClass(errors.PAYMENT_TERMS)}
                >
                  <option value={''}>-- Select Payment Terms --</option>
                  {paymentTermsOptions.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                      {opt.label || opt.value || opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={'text'}
                  name={'PAYMENT_TERMS'}
                  value={formData.PAYMENT_TERMS}
                  onChange={handleChange}
                  placeholder={'e.g. Net 30, Cash on Delivery'}
                  className={inputClass(errors.PAYMENT_TERMS)}
                />
              )}
              <FieldError message={errors.PAYMENT_TERMS} />
            </div>

            {/* Currency Code */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Currency <span className={'text-rose-500'}>*</span>
              </label>
              <select
                name={'CURRENCY_CODE'}
                value={formData.CURRENCY_CODE}
                onChange={handleChange}
                className={inputClass(errors.CURRENCY_CODE)}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError message={errors.CURRENCY_CODE} />
            </div>

            {/* Credit Lower Limit */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Credit Lower Limit <span className={'text-rose-500'}>*</span>
              </label>
              <input
                type={'number'}
                step={'0.01'}
                min={'0'}
                name={'CREDIT_LOWER_LIMIT'}
                value={formData.CREDIT_LOWER_LIMIT}
                onChange={handleChange}
                placeholder={'0.00'}
                className={inputClass(errors.CREDIT_LOWER_LIMIT)}
              />
              <FieldError message={errors.CREDIT_LOWER_LIMIT} />
            </div>

            {/* Credit Upper Limit */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Credit Upper Limit <span className={'text-rose-500'}>*</span>
              </label>
              <input
                type={'number'}
                step={'0.01'}
                min={'0'}
                name={'CREDIT_UPPER_LIMIT'}
                value={formData.CREDIT_UPPER_LIMIT}
                onChange={handleChange}
                placeholder={'0.00'}
                className={inputClass(errors.CREDIT_UPPER_LIMIT)}
              />
              <FieldError message={errors.CREDIT_UPPER_LIMIT} />
            </div>

            {/* Credit Days */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Credit Days <span className={'text-rose-500'}>*</span>
              </label>
              <input
                type={'number'}
                min={'0'}
                name={'CREDIT_DAYS'}
                value={formData.CREDIT_DAYS}
                onChange={handleChange}
                placeholder={'0'}
                className={inputClass(errors.CREDIT_DAYS)}
              />
              <FieldError message={errors.CREDIT_DAYS} />
            </div>

            {/* Opening Balance */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Opening Balance <span className={'text-rose-500'}>*</span>
              </label>
              <input
                type={'number'}
                step={'0.01'}
                name={'OPENING_BALANCE'}
                value={formData.OPENING_BALANCE}
                onChange={handleChange}
                placeholder={'0.00'}
                className={inputClass(errors.OPENING_BALANCE)}
              />
              <FieldError message={errors.OPENING_BALANCE} />
            </div>

            {/* Balance Type */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Balance Type <span className={'text-rose-500'}>*</span>
              </label>
              <select
                name={'BALANCE_TYPE'}
                value={formData.BALANCE_TYPE}
                onChange={handleChange}
                className={inputClass(errors.BALANCE_TYPE)}
              >
                {BALANCE_TYPE_OPTIONS.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
              <FieldError message={errors.BALANCE_TYPE} />
            </div>

            {/* Finance Status - Readonly and Approved */}
            <div>
              <label className={'block text-xs font-medium text-gray-700 mb-1'}>
                Finance Status <span className={'text-rose-500'}>*</span>
              </label>
              <input
                type={'text'}
                name={'FINANCE_STATUS'}
                value={'Approved'}
                readOnly
                className={inputClass(null, true)}
              />
              <p className={'text-[11px] text-gray-400 mt-1'}>
                New agreement will be recorded with Approved status
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={'flex items-center justify-end gap-2 pt-4 border-t border-gray-100'}>
            <button
              type={'button'}
              onClick={onClose}
              disabled={submitting}
              className={'px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50'}
            >
              Cancel
            </button>
            <button
              type={'button'}
              onClick={handleSubmit}
              disabled={submitting}
              className={'inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-xs transition-colors disabled:opacity-50'}
            >
              {submitting ? 'Submitting...' : 'Submit Agreement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}

export default CustomerAgreementModal

