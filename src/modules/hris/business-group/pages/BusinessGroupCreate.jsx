/**
 * @file Create-page controller for Business Group.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessGroupsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import BusinessGroupForm from '../components/BusinessGroupForm'
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

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
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
      await businessGroupsApi.create({
        groupName: result.values.GROUP_NAME,
        bgLogo: '',
        status: Number(result.values.STATUS),
      })
      navigate('/super-admin/business-group')
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, 'Unable to create Business Group.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialBusinessGroupValues)
    setErrors({})
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
      />
    </FormPage>
  )
}

export default BusinessGroupCreate
