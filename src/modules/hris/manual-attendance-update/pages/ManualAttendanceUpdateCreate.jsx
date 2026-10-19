/** @file API-backed Manual Attendance Update create page. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { manualAttendanceUpdatesApi } from '../api/manualAttendanceUpdateApi'
import ManualAttendanceUpdateForm from '../components/ManualAttendanceUpdateForm'
import { mapManualAttendanceUpdateToApi } from '../data/manualAttendanceUpdateApiMapper'
import { getManualAttendanceUpdateOptions, loadManualAttendanceUpdateReferences } from '../data/manualAttendanceUpdateReferences'
import { MANUAL_ATTENDANCE_UPDATE_TABLE, createInitialManualAttendanceUpdateValues, validateManualAttendanceUpdate } from '../validation/manualAttendanceUpdateValidation'

const listPath = '/hris/hris-forms/manual-attendance-update'
const fieldMap = {
  bgId: 'BG_ID', buId: 'BU_ID', deptId: 'DEPT_ID', desigId: 'DESIG_ID', shiftId: 'SHIFT_ID',
  attenDate: 'ATTEN_DATE', inTime: 'IN_TIME', outTime: 'OUT_TIME', note: 'NOTE', status: 'STATUS',
}

function ManualAttendanceUpdateCreate() {
  const navigate = useNavigate()
  const businessGroupRef = useRef(null)
  const [values, setValues] = useState(createInitialManualAttendanceUpdateValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(null)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const options = useMemo(() => getManualAttendanceUpdateOptions(references, values), [references, values])

  useEffect(() => {
    let active = true
    loadManualAttendanceUpdateReferences()
      .then((loaded) => { if (active) setReferences(loaded) })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Manual Attendance reference data.'))
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    const cleared = name === 'BG_ID'
      ? { BU_ID: '', DEPT_ID: '', DESIG_ID: '', SHIFT_ID: '' }
      : name === 'BU_ID'
        ? { DEPT_ID: '', DESIG_ID: '', SHIFT_ID: '' }
        : name === 'DEPT_ID' ? { DESIG_ID: '' } : {}
    setValues((current) => ({ ...current, [name]: nextValue, ...cleared }))
    setErrors((current) => ({ ...current, [name]: undefined,
      ...Object.fromEntries(Object.keys(cleared).map((key) => [key, undefined])),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateManualAttendanceUpdate(values)
    setValues(result.values); setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return false
    }
    setSubmitting(true)
    try {
      await manualAttendanceUpdatesApi.create(mapManualAttendanceUpdateToApi(result.values))
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Manual Attendance Update.', fieldMap)
      return false
    } finally { setSubmitting(false) }
  }

  const handleReset = () => {
    setValues(createInitialManualAttendanceUpdateValues()); setErrors({})
    requestAnimationFrame(() => businessGroupRef.current?.focus())
  }

  return (
    <FormPage title={'Manual Attendance Update Create'} listTo={listPath}
      tableName={MANUAL_ATTENDANCE_UPDATE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <ManualAttendanceUpdateForm values={values} errors={errors} {...options}
        referencesLoading={referencesLoading} businessGroupRef={businessGroupRef} onChange={handleChange} />
    </FormPage>
  )
}

export default ManualAttendanceUpdateCreate
