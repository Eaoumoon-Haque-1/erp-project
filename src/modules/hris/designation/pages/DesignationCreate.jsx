/** @file API-backed Designation create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import { designationGroupsApi } from '../../designation-group/api/designationGroupApi'
import { designationsApi } from '../api/designationApi'
import DesignationForm from '../components/DesignationForm'
import { mapDesignationToApi } from '../data/designationApiMapper'
import { DESIGNATION_TABLE, initialDesignationValues, validateDesignation } from '../validation/designationValidation'

const listPath = '/hris/employee-settings/designation'

function DesignationCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const designationNameRef = useRef(null)
  const [values, setValues] = useState(() => ({
    ...initialDesignationValues,
    BG_ID: sessionGroupId,
  }))
  const [existingDesignations, setExistingDesignations] = useState([])
  const [businessUnitDesignations, setBusinessUnitDesignations] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      designationsApi.list(sessionGroupId),
      designationGroupsApi.list(),
    ])
      .then(([records, assignments]) => {
        if (!active) return

        const assignedDesignationIds = new Set(
          assignments
            .filter((assignment) =>
              String(assignment.buId ?? '') === sessionBusinessUnitId
              && Number(assignment.status ?? 1) === 1)
            .map((assignment) => String(assignment.desigId ?? '')),
        )
        const scopedRecords = records.filter((record) =>
          assignedDesignationIds.has(String(record.id ?? '')),
        )

        setExistingDesignations(records)
        setBusinessUnitDesignations(scopedRecords)
        setValues((current) => ({
          ...current,
          SORT_ORDER: getNextSortOrder(scopedRecords),
        }))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load existing Designations.')
      })
    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDesignation(
      { ...values, BG_ID: sessionGroupId },
      existingDesignations,
    )
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
    setValues({
      ...initialDesignationValues,
      BG_ID: sessionGroupId,
      SORT_ORDER: getNextSortOrder(businessUnitDesignations),
    })
    setErrors({})
    requestAnimationFrame(() => designationNameRef.current?.focus())
  }

  return (
    <FormPage title={'Designation Create'} listTo={listPath} tableName={DESIGNATION_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <DesignationForm values={values} errors={errors} onChange={handleChange} designationNameRef={designationNameRef} />
    </FormPage>
  )
}

export default DesignationCreate
