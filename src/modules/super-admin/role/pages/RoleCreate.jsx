/**
 * @file Create-page controller for Role.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rolesApi } from '../api/roleApi'
import { applyApiFormErrors } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import RoleForm from '../components/RoleForm'
import { mapRoleToApi } from '../data/roleApiMapper'
import { ROLE_TABLE, initialRoleValues, validateRole } from '../validation/roleValidation'

const existingRoleNames = ['Super Admin']
const listPath = '/super-admin/role-creation/role'

function RoleCreate() {
  const navigate = useNavigate()
  const roleNameRef = useRef(null)
  const [values, setValues] = useState(initialRoleValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateRole(values, existingRoleNames)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await rolesApi.create(mapRoleToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Role.', { roleName: 'PERMISSION_NAME' }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialRoleValues)
    setErrors({})
    requestAnimationFrame(() => roleNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Role Create'}
      listTo={listPath}
      tableName={ROLE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <RoleForm values={values} errors={errors} roleNameRef={roleNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default RoleCreate
