/**
 * @file Modal workflow for User Create Self Service.
 * Sections: modal state/validation handlers, field content, and modal action composition.
 * Keep open/close behavior accessible and place future API mutations in the owning workflow.
 */
import { useEffect, useRef, useState } from 'react'
import { applyApiFormErrors } from '../../../../api/errors'
import ActionForm from '../../../../components/shared/ActionForm'
import Modal from '../../../../components/shared/Modal'
import UserCreationFromEmployeeForm from '../../../hris/user-creation-from-employee/components/UserCreationFromEmployeeForm'
import {
  USER_CREATION_FROM_EMPLOYEE_TABLE,
  initialUserCreationFromEmployeeValues,
  validateUserCreationFromEmployee,
} from '../../../hris/user-creation-from-employee/validation/userCreationFromEmployeeValidation'

function createValues(employee) {
  return {
    ...initialUserCreationFromEmployeeValues,
    EMPLOYEE_ID: employee?.EMPLOYEE_ID || '',
    EMPLOYEE_NAME: employee?.EMPLOYEE_NAME || '',
    BUSINESS_UNIT_NAME: employee?.BUSINESS_UNIT_NAME || '',
    USER_NAME: employee?.USER_NAME || employee?.SUGGESTED_USERNAME || '',
    USER_ROLE: employee?.USER_ROLE || '',
    USER_TYPE: employee?.USER_TYPE || '',
    VALID_FROM_DATE: employee?.VALID_FROM_DATE || '',
    VALID_TO_DATE: employee?.VALID_TO_DATE || '',
    IS_ANDROID_ID_FIXED: employee?.IS_ANDROID_ID_FIXED || '0',
    ANDROID_ID: employee?.ANDROID_ID || '',
    IS_ACTIVE: employee?.IS_ACTIVE ?? '1',
  }
}

function UserCreateSelfServiceModal({ open, employee, roleOptions, userTypeOptions, readOnly = false, onClose, onSave }) {
  const [values, setValues] = useState(() => createValues(employee))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const frameId = requestAnimationFrame(() => {
      formRef.current?.querySelector('#USER_NAME')?.focus()
    })
    return () => cancelAnimationFrame(frameId)
  }, [employee, open])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateUserCreationFromEmployee(values, {
      requirePassword: employee?.HAS_USER !== '1',
    })
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      const firstInvalidField = Object.keys(result.errors)[0]
      formRef.current?.querySelector(`[name="${firstInvalidField}"]`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await onSave(result.values)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create User from Employee.', {
        userName: 'USER_NAME', password: 'PASSWORD', confirmPassword: 'CONFIRM_PASSWORD',
        fromDate: 'VALID_FROM_DATE', toDate: 'VALID_TO_DATE', roleId: 'USER_ROLE',
        userTypeId: 'USER_TYPE', isAndroidFixed: 'IS_ANDROID_ID_FIXED', androidId: 'ANDROID_ID', status: 'IS_ACTIVE',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={readOnly ? 'Employee User Details' : 'User Create Self Service'}
      open={open}
      onClose={onClose}
      panelClassName={'erp-user-self-service-modal'}
    >
      <ActionForm
        entityName={'User'}
        ref={formRef}
        data-table={USER_CREATION_FROM_EMPLOYEE_TABLE}
        onSubmit={handleSubmit}
        noValidate
      >
        <UserCreationFromEmployeeForm
          values={values}
          errors={errors}
          roleOptions={roleOptions}
          userTypeOptions={userTypeOptions}
          passwordRequired={!readOnly}
          showPasswordFields={!readOnly}
          readOnly={readOnly}
          onChange={handleChange}
        />

        <div className={'erp-modal-actions'}>
          <button type={'button'} className={'secondary-button'} disabled={submitting} onClick={onClose}>
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && <button type={'submit'} className={'primary-button'} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>}
        </div>
      </ActionForm>
    </Modal>
  )
}

export default UserCreateSelfServiceModal
