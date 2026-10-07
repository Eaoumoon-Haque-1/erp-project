/**
 * @file Modal workflow for Sales Payment Process.
 * Sections: modal state/validation handlers, field content, and modal action composition.
 * Keep open/close behavior accessible and place future API mutations in the owning workflow.
 */
import { useRef, useState } from 'react'
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import Modal from '../../../../components/shared/Modal'
import {
  BILL_COLLECTION_TABLE,
  createInitialBillCollectionValues,
  paymentMethodOptions,
  validateBillCollection,
} from '../validation/billCollectionValidation'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error, extra = '') {
  return ['erp-form-control', extra, error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function Label({ htmlFor, children, required = false }) {
  return (
    <label className={'erp-field-label'} htmlFor={htmlFor}>
      {children}
      {required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
    </label>
  )
}

function BillCollectionModal({ open, payment, businessUnitName, onClose, onSave }) {
  const [values, setValues] = useState(() => createInitialBillCollectionValues(payment))
  const [errors, setErrors] = useState({})
  const paymentMethodRef = useRef(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateBillCollection(values)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => {
        document.querySelector('.erp-bill-collection-modal [aria-invalid="true"]')?.focus()
      })
      return
    }

    onSave(result.values)
  }

  return (
    <Modal
      title={'Bill Collection Information'}
      open={open}
      onClose={onClose}
      panelClassName={'erp-bill-collection-modal'}
    >
      <form data-table={BILL_COLLECTION_TABLE} onSubmit={handleSubmit} noValidate>
        <div className={'erp-bill-collection-grid'}>
          <div>
            <Label htmlFor={'BILL_COLLECTION_BU_ID'} required>Business Unit</Label>
            <input type={'hidden'} name={'BU_ID'} value={values.BU_ID} />
            <input
              id={'BILL_COLLECTION_BU_ID'}
              className={fieldClass(errors.BU_ID, 'erp-readonly')}
              type={'text'}
              value={businessUnitName}
              readOnly
              aria-invalid={Boolean(errors.BU_ID)}
              aria-describedby={errors.BU_ID ? 'BILL_COLLECTION_BU_ID-error' : undefined}
            />
            <FieldError id={'BILL_COLLECTION_BU_ID-error'} message={errors.BU_ID} />
          </div>

          <div>
            <Label htmlFor={'BILL_COLLECTION_AGREEMENT_ID'} required>Agreement No.</Label>
            <input type={'hidden'} name={'AGREEMENT_ID'} value={values.AGREEMENT_ID} />
            <input
              id={'BILL_COLLECTION_AGREEMENT_ID'}
              className={fieldClass(errors.AGREEMENT_ID, 'erp-readonly')}
              type={'text'}
              value={values.AGREEMENT_NO}
              readOnly
              aria-invalid={Boolean(errors.AGREEMENT_ID)}
              aria-describedby={errors.AGREEMENT_ID ? 'BILL_COLLECTION_AGREEMENT_ID-error' : undefined}
            />
            <FieldError id={'BILL_COLLECTION_AGREEMENT_ID-error'} message={errors.AGREEMENT_ID} />
          </div>

          <div>
            <Label htmlFor={'BILL_AMOUNT'} required>Billing Amount</Label>
            <input
              id={'BILL_AMOUNT'}
              name={'BILL_AMOUNT'}
              className={fieldClass(errors.BILL_AMOUNT, 'erp-readonly')}
              type={'number'}
              min={'0.01'}
              step={'0.01'}
              value={values.BILL_AMOUNT}
              readOnly
              aria-invalid={Boolean(errors.BILL_AMOUNT)}
              aria-describedby={errors.BILL_AMOUNT ? 'BILL_AMOUNT-error' : undefined}
            />
            <FieldError id={'BILL_AMOUNT-error'} message={errors.BILL_AMOUNT} />
          </div>

          <div>
            <Label htmlFor={'PAYMENT_METHOD'} required>Payment Method</Label>
            <select
              ref={paymentMethodRef}
              id={'PAYMENT_METHOD'}
              name={'PAYMENT_METHOD'}
              className={fieldClass(errors.PAYMENT_METHOD)}
              value={values.PAYMENT_METHOD}
              required
              aria-invalid={Boolean(errors.PAYMENT_METHOD)}
              aria-describedby={errors.PAYMENT_METHOD ? 'PAYMENT_METHOD-error' : undefined}
              onChange={handleChange}
            >
              <option value={''}>--Select Payment Method--</option>
              {paymentMethodOptions.map((method) => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
            <FieldError id={'PAYMENT_METHOD-error'} message={errors.PAYMENT_METHOD} />
          </div>

          <div>
            <Label htmlFor={'IS_BILL_COLLECTED'} required>Is Bill Collected?</Label>
            <select
              id={'IS_BILL_COLLECTED'}
              name={'IS_BILL_COLLECTED'}
              className={fieldClass(errors.IS_BILL_COLLECTED)}
              value={values.IS_BILL_COLLECTED}
              required
              onChange={handleChange}
            >
              <option value={'1'}>Yes</option>
              <option value={'0'}>No</option>
            </select>
          </div>

          <div>
            <Label htmlFor={'REMARKS'}>Remarks</Label>
            <AutoGrowTextarea
              id={'REMARKS'}
              name={'REMARKS'}
              maxLength={500}
              className={fieldClass(errors.REMARKS, 'erp-textarea')}
              placeholder={'Enter remarks'}
              value={values.REMARKS}
              aria-invalid={Boolean(errors.REMARKS)}
              aria-describedby={errors.REMARKS ? 'REMARKS-error' : undefined}
              onChange={handleChange}
            />
            <FieldError id={'REMARKS-error'} message={errors.REMARKS} />
          </div>
        </div>

        <div className={'erp-modal-actions gap-2'}>
          <button type={'button'} className={'secondary-button'} onClick={onClose}>Cancel</button>
          <button type={'submit'} className={'primary-button'}>Save</button>
        </div>
      </form>
    </Modal>
  )
}

export default BillCollectionModal
