/** @file API-backed Department–Designation mapping create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { designationDepartmentMappingsApi } from '../api/designationDepartmentMappingApi'
import DesignationDepartmentMappingForm from '../components/DesignationDepartmentMappingForm'
import { mapDesignationDepartmentMappingToApi } from '../data/designationDepartmentMappingApiMapper'
import useDesignationDepartmentMappingOptions from '../hooks/useDesignationDepartmentMappingOptions'
import { DESIGNATION_MAPPING_TABLE, initialDesignationDepartmentMappingValues, validateDesignationDepartmentMapping } from '../validation/designationDepartmentMappingValidation'

const listPath = '/hris/employee-settings/designation-department-mapping'

function DesignationDepartmentMappingCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const departmentRef = useRef(null)
  const designationRef = useRef(null)
  const [values, setValues] = useState(() => ({
    ...initialDesignationDepartmentMappingValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  }))
  const [existingMappings, setExistingMappings] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const options = useDesignationDepartmentMappingOptions(values)

  useEffect(() => {
    let active = true
    designationDepartmentMappingsApi.list(sessionBusinessUnitId)
      .then((records) => {
        if (!active) return
        setExistingMappings(records.filter((record) => (
          String(record.bgId) === sessionGroupId
          && String(record.buId) === sessionBusinessUnitId
        )))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load existing mappings.')
      })
    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDesignationDepartmentMapping({
      ...values,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    }, existingMappings)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      if (result.errors.DEPT_ID) departmentRef.current?.focus()
      else if (result.errors.DESIG_ID) designationRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await designationDepartmentMappingsApi.create(mapDesignationDepartmentMappingToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Department–Designation mapping.', {
        bgId: 'BG_ID', buId: 'BU_ID', deptId: 'DEPT_ID', desigId: 'DESIG_ID', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialDesignationDepartmentMappingValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    setErrors({})
  }

  return (
    <FormPage title={'Designation Department Mapping Create'} listTo={listPath} tableName={DESIGNATION_MAPPING_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <DesignationDepartmentMappingForm values={values} errors={errors} {...options} onChange={handleChange} departmentRef={departmentRef} designationRef={designationRef} />
    </FormPage>
  )
}

export default DesignationDepartmentMappingCreate
