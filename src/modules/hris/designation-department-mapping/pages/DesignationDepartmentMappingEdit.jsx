/** @file API-backed Department–Designation mapping edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import ActionForm from '../../../../components/shared/ActionForm'
import PageHeader from '../../../../components/shared/PageHeader'
import { designationDepartmentMappingsApi } from '../api/designationDepartmentMappingApi'
import DesignationDepartmentMappingForm from '../components/DesignationDepartmentMappingForm'
import { mapDesignationDepartmentMappingFromApi, mapDesignationDepartmentMappingToApi } from '../data/designationDepartmentMappingApiMapper'
import useDesignationDepartmentMappingOptions from '../hooks/useDesignationDepartmentMappingOptions'
import { DESIGNATION_MAPPING_TABLE, initialDesignationDepartmentMappingValues, validateDesignationDepartmentMapping } from '../validation/designationDepartmentMappingValidation'

const listPath = '/hris/employee-settings/designation-department-mapping'

function DesignationDepartmentMappingEdit() {
  const { mappingId } = useParams()
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const departmentRef = useRef(null)
  const designationRef = useRef(null)
  const [mapping, setMapping] = useState(null)
  const [values, setValues] = useState(initialDesignationDepartmentMappingValues)
  const [existingMappings, setExistingMappings] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const options = useDesignationDepartmentMappingOptions(values, mapping || {})

  useEffect(() => {
    let active = true
    Promise.all([
      designationDepartmentMappingsApi.get(mappingId),
      designationDepartmentMappingsApi.list(),
    ]).then(([record, records]) => {
      if (!active) return
      const mapped = mapDesignationDepartmentMappingFromApi(record)
      setMapping(mapped)
      setValues(mapped)
      setExistingMappings(records.filter((row) => String(row.id) !== String(mappingId)))
    }).catch((error) => {
      if (active) getApiErrorMessage(error, 'Unable to load Department–Designation mapping.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [mappingId])

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
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await designationDepartmentMappingsApi.update(mappingId, mapDesignationDepartmentMappingToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Department–Designation mapping.', {
        bgId: 'BG_ID', buId: 'BU_ID', deptId: 'DEPT_ID', desigId: 'DESIG_ID', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className={'erp-list-page'}><PageHeader title={'Designation Department Mapping Edit'} actionLabel={'List'} actionTo={listPath} /><section className={'erp-form-card'}><p>Loading...</p></section></div>
  }
  if (!mapping) {
    return <div className={'erp-list-page'}><PageHeader title={'Mapping Not Found'} actionLabel={'List'} actionTo={listPath} /><section className={'erp-form-card'}><p>No mapping record was found for this ID.</p></section></div>
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Designation Department Mapping Edit'} actionLabel={'List'} actionTo={listPath} />
      <section className={'erp-form-card'}>
        <ActionForm action={'update'} entityName={'Designation Department Mapping'} data-table={DESIGNATION_MAPPING_TABLE} onSubmit={handleSubmit} noValidate>
          <DesignationDepartmentMappingForm values={values} errors={errors} {...options} onChange={handleChange} businessUnitRef={businessUnitRef} departmentRef={departmentRef} designationRef={designationRef} />
          <div className={'erp-form-actions'}>
            <button type={'submit'} className={'primary-button'} disabled={submitting}>{submitting ? 'Saving...' : 'Update'}</button>
          </div>
        </ActionForm>
      </section>
    </div>
  )
}

export default DesignationDepartmentMappingEdit
