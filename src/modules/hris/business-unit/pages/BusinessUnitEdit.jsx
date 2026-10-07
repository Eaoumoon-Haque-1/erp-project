/**
 * @file API-backed Business Unit edit page.
 * Role assignment is intentionally handled by the dedicated Assign Role to
 * Business Unit workflow rather than being mixed into this CRUD editor.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { businessGroupsApi, businessUnitsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import BusinessUnitForm from '../components/BusinessUnitForm'
import {
  mapBusinessUnitFromApi,
  mapBusinessUnitToApi,
} from '../data/businessUnitApiMapper'
import {
  BUSINESS_UNIT_TABLE,
  initialBusinessUnitValues,
  validateBusinessUnit,
} from '../validation/businessUnitValidation'

const listPath = '/super-admin/business-unit'

function BusinessUnitEdit() {
  const { businessUnitId } = useParams()
  const navigate = useNavigate()
  const unitNameRef = useRef(null)
  const logoInputRef = useRef(null)
  const [values, setValues] = useState(initialBusinessUnitValues)
  const [originalValues, setOriginalValues] = useState(initialBusinessUnitValues)
  const [businessGroup, setBusinessGroup] = useState({ ID: '', GROUP_NAME: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const logoPreviewUrl = useMemo(
    () =>
      values.BU_LOGO instanceof File
        ? URL.createObjectURL(values.BU_LOGO)
        : String(values.BU_LOGO || ''),
    [values.BU_LOGO],
  )

  useEffect(
    () => () => {
      if (logoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(logoPreviewUrl)
    },
    [logoPreviewUrl],
  )

  useEffect(() => {
    let active = true

    businessUnitsApi
      .get(businessUnitId)
      .then(async (record) => {
        const mapped = mapBusinessUnitFromApi(record)
        const group = await businessGroupsApi.get(mapped.BG_ID)
        if (!active) return
        setValues(mapped)
        setOriginalValues(mapped)
        setBusinessGroup({
          ID: String(group.id),
          GROUP_NAME: group.groupName,
        })
      })
      .catch((error) => {
        if (active) {
          setMessage(getApiErrorMessage(error, 'Unable to load Business Unit.'))
        }
      })

    return () => {
      active = false
    }
  }, [businessUnitId])

  const handleChange = (event) => {
    const { name, type, value, checked, files } = event.target
    let nextValue = value
    if (type === 'checkbox') nextValue = checked ? '1' : '0'
    if (type === 'file') nextValue = files?.[0] ?? originalValues.BU_LOGO
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateBusinessUnit(values, [], [])
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
      await businessUnitsApi.update(
        businessUnitId,
        await mapBusinessUnitToApi(result.values),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Business Unit.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    if (logoInputRef.current) logoInputRef.current.value = ''
    requestAnimationFrame(() => unitNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Business Unit Edit'}
      listTo={listPath}
      tableName={BUSINESS_UNIT_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
    >
      <BusinessUnitForm
        values={values}
        errors={errors}
        businessGroup={businessGroup}
        onChange={handleChange}
        unitNameRef={unitNameRef}
        logoInputRef={logoInputRef}
        logoPreviewUrl={logoPreviewUrl}
      />
    </FormPage>
  )
}

export default BusinessUnitEdit
