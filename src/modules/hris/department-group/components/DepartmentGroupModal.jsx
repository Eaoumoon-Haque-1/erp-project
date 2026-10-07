/**
 * @file Modal workflow for Department Group.
 * Sections: modal state/validation handlers, field content, and modal action composition.
 * Keep open/close behavior accessible and place future API mutations in the owning workflow.
 */
import { useEffect, useRef, useState } from 'react'
import Modal from '../../../../components/shared/Modal'
import {
  DEPARTMENT_GROUP_TABLE,
  createInitialDepartmentGroupValues,
  validateDepartmentGroup,
} from '../validation/departmentGroupValidation'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error, extra = '') {
  return [
    'erp-form-control',
    extra,
    error ? 'erp-form-control-invalid' : '',
  ].filter(Boolean).join(' ')
}

function DepartmentGroupModal({
  open,
  onClose,
  onSubmit,
  businessGroup,
  department,
  businessUnits,
}) {
  const initialValues = createInitialDepartmentGroupValues(
    businessGroup.ID,
    department.ID,
  )
  const [values, setValues] = useState(initialValues)
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

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateDepartmentGroup(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.BU_ID) businessUnitRef.current?.focus()
      return
    }

    onSubmit(result.values)
  }

  const availableBusinessUnits = businessUnits.filter(
    (unit) => String(unit.BG_ID) === String(values.BG_ID),
  )

  return (
    <Modal title={'Assign Department Group'} open={open} onClose={onClose}>
      <form data-table={DEPARTMENT_GROUP_TABLE} onSubmit={handleSubmit} noValidate>
        <div className={'erp-modal-form'}>
          <div>
            <label className={'erp-field-label'} htmlFor={'DEPT_GROUP_BG_ID-display'}>
              Group Name
              <span className={'erp-required'} aria-hidden={'true'}>*</span>
            </label>
            <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
            <input
              id={'DEPT_GROUP_BG_ID-display'}
              className={'erp-form-control erp-readonly'}
              type={'text'}
              value={businessGroup.GROUP_NAME}
              readOnly
              aria-describedby={errors.BG_ID ? 'DEPT_GROUP_BG_ID-error' : undefined}
            />
            <FieldError id={'DEPT_GROUP_BG_ID-error'} message={errors.BG_ID} />
          </div>

          <div>
            <label className={'erp-field-label'} htmlFor={'DEPT_ID-display'}>
              Department Name
              <span className={'erp-required'} aria-hidden={'true'}>*</span>
            </label>
            <input type={'hidden'} name={'DEPT_ID'} value={values.DEPT_ID} />
            <input
              id={'DEPT_ID-display'}
              className={'erp-form-control erp-readonly'}
              type={'text'}
              value={department.DEPARTMENT_NAME}
              readOnly
              aria-describedby={errors.DEPT_ID ? 'DEPT_ID-error' : undefined}
            />
            <FieldError id={'DEPT_ID-error'} message={errors.DEPT_ID} />
          </div>

          <div>
            <label className={'erp-field-label'} htmlFor={'DEPT_GROUP_BU_ID'}>
              Business Unit
              <span className={'erp-required'} aria-hidden={'true'}>*</span>
            </label>
            <select
              ref={businessUnitRef}
              id={'DEPT_GROUP_BU_ID'}
              name={'BU_ID'}
              className={fieldClass(errors.BU_ID)}
              value={values.BU_ID}
              required
              aria-invalid={Boolean(errors.BU_ID)}
              aria-describedby={errors.BU_ID ? 'DEPT_GROUP_BU_ID-error' : undefined}
              onChange={handleChange}
            >
              <option value={''}>--Select Business Unit--</option>
              {availableBusinessUnits.map((unit) => (
                <option key={unit.ID} value={unit.ID}>{unit.BUSINESS_UNIT}</option>
              ))}
            </select>
            <FieldError id={'DEPT_GROUP_BU_ID-error'} message={errors.BU_ID} />
          </div>

          <label className={'erp-switch-field'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              name={'STATUS'}
              checked={values.STATUS === '1'}
              onChange={handleChange}
            />
            <span>Is Active</span>
          </label>
        </div>

        <div className={'erp-modal-actions'}>
          <button type={'submit'} className={'primary-button erp-modal-submit'}>
            Submit
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default DepartmentGroupModal
