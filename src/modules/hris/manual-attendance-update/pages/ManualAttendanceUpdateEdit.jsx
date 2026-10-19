/** @file API-backed Manual Attendance Update edit page. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { manualAttendanceUpdatesApi } from '../api/manualAttendanceUpdateApi'
import ManualAttendanceUpdateForm from '../components/ManualAttendanceUpdateForm'
import { mapManualAttendanceUpdateFromApi, mapManualAttendanceUpdateToApi } from '../data/manualAttendanceUpdateApiMapper'
import { getManualAttendanceUpdateOptions, loadManualAttendanceUpdateReferences } from '../data/manualAttendanceUpdateReferences'
import { MANUAL_ATTENDANCE_UPDATE_TABLE, createInitialManualAttendanceUpdateValues, validateManualAttendanceUpdate } from '../validation/manualAttendanceUpdateValidation'

const listPath = '/hris/hris-forms/manual-attendance-update'
const fieldMap = {
  bgId: 'BG_ID', buId: 'BU_ID', deptId: 'DEPT_ID', desigId: 'DESIG_ID', shiftId: 'SHIFT_ID',
  attenDate: 'ATTEN_DATE', inTime: 'IN_TIME', outTime: 'OUT_TIME', note: 'NOTE', status: 'STATUS',
}

function ManualAttendanceUpdateEdit() {
  const { manualAttendanceUpdateId } = useParams()
  const navigate = useNavigate()
  const businessGroupRef = useRef(null)
  const [values, setValues] = useState(createInitialManualAttendanceUpdateValues)
  const [originalValues, setOriginalValues] = useState(createInitialManualAttendanceUpdateValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(null)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const options = useMemo(() => getManualAttendanceUpdateOptions(references, values, originalValues),
    [originalValues, references, values])

  useEffect(() => {
    let active = true
    Promise.all([
      manualAttendanceUpdatesApi.get(manualAttendanceUpdateId),
      loadManualAttendanceUpdateReferences(),
    ]).then(([record, loaded]) => {
      if (!active) return
      const mapped = mapManualAttendanceUpdateFromApi(record, loaded)
      setReferences(loaded); setValues(mapped); setOriginalValues(mapped)
    }).catch((error) => getApiErrorMessage(error, 'Unable to load Manual Attendance Update.'))
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
  }, [manualAttendanceUpdateId])

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
      await manualAttendanceUpdatesApi.update(manualAttendanceUpdateId, mapManualAttendanceUpdateToApi(result.values))
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Manual Attendance Update.', fieldMap)
      return false
    } finally { setSubmitting(false) }
  }

  const handleReset = () => {
    setValues(originalValues); setErrors({})
    requestAnimationFrame(() => businessGroupRef.current?.focus())
  }

  return (
    <FormPage title={'Manual Attendance Update Edit'} listTo={listPath}
      tableName={MANUAL_ATTENDANCE_UPDATE_TABLE} onSubmit={handleSubmit} onReset={handleReset}
      submitLabel={'Update'} submitting={submitting}>
      <ManualAttendanceUpdateForm values={values} errors={errors} {...options}
        referencesLoading={referencesLoading} businessGroupRef={businessGroupRef} onChange={handleChange} />
    </FormPage>
  )
}

export default ManualAttendanceUpdateEdit
