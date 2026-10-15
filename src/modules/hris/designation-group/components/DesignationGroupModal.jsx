/**
 * @file Modal workflow for Designation Group.
 * Sections: modal state/validation handlers, field content, and modal action composition.
 * Keep open/close behavior accessible and place future API mutations in the owning workflow.
 */
import { useEffect, useRef, useState } from 'react'
import ActionForm from '../../../../components/shared/ActionForm'
import Modal from '../../../../components/shared/Modal'
import {
  DESIGNATION_GROUP_TABLE,
  createInitialDesignationGroupValues,
  validateDesignationGroup,
} from '../validation/designationGroupValidation'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return [
    'erp-form-control',
    error ? 'erp-form-control-invalid' : '',
  ].filter(Boolean).join(' ')
}

function DesignationGroupModal({
  open,
  onClose,
  onSubmit,
  businessGroup,
  designation,
  businessUnits,
  mode = 'create',
  record,
  submitting = false,
}) {
  const [values, setValues] = useState(() =>
    record || createInitialDesignationGroupValues(businessGroup.ID, designation.ID),
  )
  const [errors, setErrors] = useState({})
  const businessUnitRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const frameId = requestAnimationFrame(() => businessUnitRef.current?.focus())
    return () => cancelAnimationFrame(frameId)
  }, [open])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDesignationGroup(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.BU_ID) businessUnitRef.current?.focus()
      return
    }

    await onSubmit(result.values)
  }

  const availableBusinessUnits = businessUnits.filter(
    (unit) => String(unit.BG_ID) === String(values.BG_ID),
  )
  const readOnly = mode === 'view'
  const title = mode === 'view'
    ? 'View Designation Group'
    : mode === 'edit'
      ? 'Edit Designation Group'
      : 'Assign Designation Group'

  return (
    <Modal title={title} open={open} onClose={onClose}>
      <ActionForm action={mode === 'edit' ? 'update' : 'create'} entityName={'Designation Group'} data-table={DESIGNATION_GROUP_TABLE} onSubmit={handleSubmit} noValidate>
        <div className={'erp-modal-form'}>
          <div>
            <label className={'erp-field-label'} htmlFor={'DESIG_GROUP_BG_ID-display'}>
              Group Name
              <span className={'erp-required'} aria-hidden={'true'}>*</span>
            </label>
            <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
            <input
              id={'DESIG_GROUP_BG_ID-display'}
              className={'erp-form-control erp-readonly'}
              type={'text'}
              value={businessGroup.GROUP_NAME}
              readOnly
              aria-describedby={errors.BG_ID ? 'DESIG_GROUP_BG_ID-error' : undefined}
            />
            <FieldError id={'DESIG_GROUP_BG_ID-error'} message={errors.BG_ID} />
          </div>

          <div>
            <label className={'erp-field-label'} htmlFor={'DESIG_ID-display'}>
              Designation Name
              <span className={'erp-required'} aria-hidden={'true'}>*</span>
            </label>
            <input type={'hidden'} name={'DESIG_ID'} value={values.DESIG_ID} />
            <input
              id={'DESIG_ID-display'}
              className={'erp-form-control erp-readonly'}
              type={'text'}
              value={designation.DESIGNATION_NAME}
              readOnly
              aria-describedby={errors.DESIG_ID ? 'DESIG_ID-error' : undefined}
            />
            <FieldError id={'DESIG_ID-error'} message={errors.DESIG_ID} />
          </div>

          <div>
            <label className={'erp-field-label'} htmlFor={'DESIG_GROUP_BU_ID'}>
              Business Unit
              <span className={'erp-required'} aria-hidden={'true'}>*</span>
            </label>
            <select
              ref={businessUnitRef}
              id={'DESIG_GROUP_BU_ID'}
              name={'BU_ID'}
              className={fieldClass(errors.BU_ID)}
              value={values.BU_ID}
              required
              disabled={readOnly}
              aria-invalid={Boolean(errors.BU_ID)}
              aria-describedby={errors.BU_ID ? 'DESIG_GROUP_BU_ID-error' : undefined}
              onChange={handleChange}
            >
              <option value={''}>--Select Business Unit--</option>
              {availableBusinessUnits.map((unit) => (
                <option key={unit.ID} value={unit.ID}>{unit.BUSINESS_UNIT}</option>
              ))}
            </select>
            <FieldError id={'DESIG_GROUP_BU_ID-error'} message={errors.BU_ID} />
          </div>

          <label className={'erp-switch-field'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              name={'STATUS'}
              checked={values.STATUS === '1'}
              disabled={readOnly}
              onChange={handleChange}
            />
            <span>Is Active</span>
          </label>
        </div>

        {!readOnly && (
          <div className={'erp-modal-actions'}>
            <button type={'submit'} className={'primary-button erp-modal-submit'} disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Submit'}
            </button>
          </div>
        )}
      </ActionForm>
    </Modal>
  )
}

export default DesignationGroupModal
