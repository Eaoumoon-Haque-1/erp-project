/** @file API-backed Designation create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { designationsApi } from '../api/designationApi'
import DesignationForm from '../components/DesignationForm'
import { mapDesignationToApi } from '../data/designationApiMapper'
import { DESIGNATION_TABLE, initialDesignationValues, validateDesignation } from '../validation/designationValidation'

const listPath = '/hris/employee-settings/designation'

function DesignationCreate() {
  const navigate = useNavigate()
  const designationNameRef = useRef(null)
  const [values, setValues] = useState(initialDesignationValues)
  const [existingDesignations, setExistingDesignations] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, groupsLoading } = useBusinessOptions(values.BG_ID, { loadUnits: false })

  useEffect(() => {
    let active = true
    designationsApi.list()
      .then((records) => { if (active) setExistingDesignations(records) })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load existing Designations.')
      })
    return () => { active = false }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDesignation(values, existingDesignations)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      if (result.errors.DESIGNATION_NAME) designationNameRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await designationsApi.create(mapDesignationToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Designation.', {
        bgId: 'BG_ID', designationName: 'DESIGNATION_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialDesignationValues)
    setErrors({})
    requestAnimationFrame(() => designationNameRef.current?.focus())
  }

  return (
    <FormPage title={'Designation Create'} listTo={listPath} tableName={DESIGNATION_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <DesignationForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} onChange={handleChange} designationNameRef={designationNameRef} />
    </FormPage>
  )
}

export default DesignationCreate
