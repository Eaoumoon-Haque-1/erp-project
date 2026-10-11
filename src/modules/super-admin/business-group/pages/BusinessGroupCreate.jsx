/**
 * @file Create-page controller for Business Group.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessGroupsApi } from '../api/businessGroupApi'
import { applyApiFormErrors } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import BusinessGroupForm from '../components/BusinessGroupForm'
import { mapBusinessGroupToApi } from '../data/businessGroupApiMapper'
import {
  BUSINESS_GROUP_TABLE,
  initialBusinessGroupValues,
  validateBusinessGroup,
} from '../validation/businessGroupValidation'

const existingGroupNames = []

function BusinessGroupCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialBusinessGroupValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const groupNameRef = useRef(null)
  const logoInputRef = useRef(null)

  const handleChange = (event) => {
    const { name, type, value, checked, files } = event.target
    let nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    if (type === 'file') nextValue = files?.[0] ?? null
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateBusinessGroup(values, existingGroupNames)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.GROUP_NAME) groupNameRef.current?.focus()
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await businessGroupsApi.create(await mapBusinessGroupToApi(result.values))
      navigate('/super-admin/business-group')
    } catch (error) {
      setMessage(
        applyApiFormErrors(error, setErrors, 'Unable to create Business Group.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialBusinessGroupValues)
    setErrors({})
    if (logoInputRef.current) logoInputRef.current.value = ''
    requestAnimationFrame(() => groupNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Business Group Create'}
      listTo={'/super-admin/business-group'}
      tableName={BUSINESS_GROUP_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <BusinessGroupForm
        values={values}
        errors={errors}
        onChange={handleChange}
        groupNameRef={groupNameRef}
        logoInputRef={logoInputRef}
      />
    </FormPage>
  )
}

export default BusinessGroupCreate
