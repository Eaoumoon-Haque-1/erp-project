/**
 * @file Modal workflow for User Create Self Service.
 * Sections: modal state/validation handlers, field content, and modal action composition.
 * Keep open/close behavior accessible and place future API mutations in the owning workflow.
 */
import { useEffect, useRef, useState } from 'react'
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
    IS_ACTIVE: employee?.IS_ACTIVE ?? '1',
  }
}

function UserCreateSelfServiceModal({ open, employee, roleOptions, userTypeOptions, onClose, onSave }) {
  const [values, setValues] = useState(() => createValues(employee))
  const [errors, setErrors] = useState({})
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

    await onSave(result.values)
  }

  return (
    <Modal
      title={'User Create Self Service'}
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
          passwordRequired={employee?.HAS_USER !== '1'}
          onChange={handleChange}
        />

        <div className={'erp-modal-actions'}>
          <button type={'button'} className={'secondary-button'} onClick={onClose}>
            Cancel
          </button>
          <button type={'submit'} className={'primary-button'}>
            Save
          </button>
        </div>
      </ActionForm>
    </Modal>
  )
}

export default UserCreateSelfServiceModal
