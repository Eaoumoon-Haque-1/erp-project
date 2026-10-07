/**
 * @file Create-page controller for Designation Department Mapping.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import DesignationDepartmentMappingForm from '../components/DesignationDepartmentMappingForm'
import {
  DESIGNATION_MAPPING_TABLE,
  initialDesignationDepartmentMappingValues,
  temporaryMappingBusinessGroup,
  temporaryMappingBusinessUnits,
  temporaryMappingDepartments,
  temporaryMappingDesignations,
  validateDesignationDepartmentMapping,
} from '../validation/designationDepartmentMappingValidation'

function DesignationDepartmentMappingCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialDesignationDepartmentMappingValues)
  const [errors, setErrors] = useState({})
  const businessUnitRef = useRef(null)
  const departmentRef = useRef(null)
  const designationRef = useRef(null)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => {
      const nextValues = { ...current, [name]: nextValue }
      if (name === 'BU_ID') {
        nextValues.DEPT_ID = ''
        nextValues.DESIG_ID = ''
      }
      if (name === 'DEPT_ID') {
        nextValues.DESIG_ID = ''
      }
      return nextValues
    })

    setErrors((current) => {
      const nextErrors = { ...current, [name]: undefined }
      if (name === 'BU_ID') {
        nextErrors.DEPT_ID = undefined
        nextErrors.DESIG_ID = undefined
      }
      if (name === 'DEPT_ID') {
        nextErrors.DESIG_ID = undefined
      }
      return nextErrors
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateDesignationDepartmentMapping(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.BU_ID) businessUnitRef.current?.focus()
      else if (result.errors.DEPT_ID) departmentRef.current?.focus()
      else if (result.errors.DESIG_ID) designationRef.current?.focus()
      return
    }

    navigate('/hris/employee-settings/designation-department-mapping')
  }

  const handleReset = () => {
    setValues(initialDesignationDepartmentMappingValues)
    setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage
      title={'Designation Department Mapping Create'}
      listTo={'/hris/employee-settings/designation-department-mapping'}
      tableName={DESIGNATION_MAPPING_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <DesignationDepartmentMappingForm
        values={values}
        errors={errors}
        businessGroup={temporaryMappingBusinessGroup}
        businessUnits={temporaryMappingBusinessUnits}
        departments={temporaryMappingDepartments}
        designations={temporaryMappingDesignations}
        onChange={handleChange}
        businessUnitRef={businessUnitRef}
        departmentRef={departmentRef}
        designationRef={designationRef}
      />
    </FormPage>
  )
}

export default DesignationDepartmentMappingCreate
