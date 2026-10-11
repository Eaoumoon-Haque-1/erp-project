/**
 * @file API-backed Business Group edit page.
 * Loads one record by route ID and updates it through the documented PUT API.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { businessGroupsApi } from '../api/businessGroupApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import BusinessGroupForm from '../components/BusinessGroupForm'
import {
  mapBusinessGroupFromApi,
  mapBusinessGroupToApi,
} from '../data/businessGroupApiMapper'
import {
  BUSINESS_GROUP_TABLE,
  initialBusinessGroupValues,
  validateBusinessGroup,
} from '../validation/businessGroupValidation'

const listPath = '/super-admin/business-group'

function BusinessGroupEdit() {
  const { businessGroupId } = useParams()
  const navigate = useNavigate()
  const groupNameRef = useRef(null)
  const logoInputRef = useRef(null)
  const [values, setValues] = useState(initialBusinessGroupValues)
  const [originalValues, setOriginalValues] = useState(initialBusinessGroupValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    businessGroupsApi
      .get(businessGroupId)
      .then((record) => {
        if (!active) return
        const mapped = mapBusinessGroupFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (active) {
          setMessage(
            getApiErrorMessage(error, 'Unable to load Business Group.'),
          )
        }
      })

    return () => {
      active = false
    }
  }, [businessGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked, files } = event.target
    let nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    if (type === 'file') nextValue = files?.[0] ?? originalValues.BG_LOGO
    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateBusinessGroup(values)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid=true]')?.focus(),
      )
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await businessGroupsApi.update(
        businessGroupId,
        await mapBusinessGroupToApi({ ...originalValues, ...result.values }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Business Group.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    if (logoInputRef.current) logoInputRef.current.value = ''
    requestAnimationFrame(() => groupNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Business Group Edit'}
      listTo={listPath}
      tableName={BUSINESS_GROUP_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
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

export default BusinessGroupEdit
