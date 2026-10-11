/**
 * @file Create-page controller for Business Unit.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessUnitsApi } from '../api/businessUnitApi'
import { applyApiFormErrors } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import BusinessUnitForm from '../components/BusinessUnitForm'
import { mapBusinessUnitToApi } from '../data/businessUnitApiMapper'
import {
  BUSINESS_UNIT_TABLE,
  initialBusinessUnitValues,
  validateBusinessUnit,
} from '../validation/businessUnitValidation'

const existingUnitNames = []
const existingEmails = []

function BusinessUnitCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialBusinessUnitValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, groupsLoading } = useBusinessOptions('', { loadUnits: false })
  const unitNameRef = useRef(null)
  const logoInputRef = useRef(null)
  const handleChange = (event) => {
    const { name, type, value, checked, files } = event.target
    let nextValue = value

    if (type === 'checkbox') nextValue = checked ? '1' : '0'
    if (type === 'file') nextValue = files?.[0] ?? null

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateBusinessUnit(
      values,
      existingUnitNames,
      existingEmails,
    )

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.BUSINESS_UNIT) unitNameRef.current?.focus()
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await businessUnitsApi.create(await mapBusinessUnitToApi(result.values))
      navigate('/super-admin/business-unit')
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Business Unit.', { email: 'E_MAIL' }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialBusinessUnitValues)
    setErrors({})
    if (logoInputRef.current) logoInputRef.current.value = ''
    requestAnimationFrame(() => unitNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Business Unit Create'}
      listTo={'/super-admin/business-unit'}
      tableName={BUSINESS_UNIT_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <BusinessUnitForm
        values={values}
        errors={errors}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        onChange={handleChange}
        unitNameRef={unitNameRef}
        logoInputRef={logoInputRef}
      />
    </FormPage>
  )
}

export default BusinessUnitCreate
