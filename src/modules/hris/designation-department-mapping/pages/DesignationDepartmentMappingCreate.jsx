/** @file API-backed Department–Designation mapping create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { designationDepartmentMappingsApi } from '../api/designationDepartmentMappingApi'
import DesignationDepartmentMappingForm from '../components/DesignationDepartmentMappingForm'
import { mapDesignationDepartmentMappingToApi } from '../data/designationDepartmentMappingApiMapper'
import useDesignationDepartmentMappingOptions from '../hooks/useDesignationDepartmentMappingOptions'
import { DESIGNATION_MAPPING_TABLE, initialDesignationDepartmentMappingValues, validateDesignationDepartmentMapping } from '../validation/designationDepartmentMappingValidation'

const listPath = '/hris/employee-settings/designation-department-mapping'

function DesignationDepartmentMappingCreate() {
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const departmentRef = useRef(null)
  const designationRef = useRef(null)
  const [values, setValues] = useState(initialDesignationDepartmentMappingValues)
  const [existingMappings, setExistingMappings] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const options = useDesignationDepartmentMappingOptions(values)

  useEffect(() => {
    let active = true
    designationDepartmentMappingsApi.list()
      .then((records) => { if (active) setExistingMappings(records) })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load existing mappings.')
      })
    return () => { active = false }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'BG_ID' ? { BU_ID: '', DEPT_ID: '', DESIG_ID: '' } : {}),
      ...(name === 'BU_ID' ? { DEPT_ID: '', DESIG_ID: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDesignationDepartmentMapping(values, existingMappings)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      if (result.errors.BU_ID) businessUnitRef.current?.focus()
      else if (result.errors.DEPT_ID) departmentRef.current?.focus()
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
    setValues(initialDesignationDepartmentMappingValues)
    setErrors({})
  }

  return (
    <FormPage title={'Designation Department Mapping Create'} listTo={listPath} tableName={DESIGNATION_MAPPING_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <DesignationDepartmentMappingForm values={values} errors={errors} {...options} onChange={handleChange} businessUnitRef={businessUnitRef} departmentRef={departmentRef} designationRef={designationRef} />
    </FormPage>
  )
}

export default DesignationDepartmentMappingCreate
