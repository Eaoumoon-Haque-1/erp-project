/** @file API-backed Shift edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { shiftsApi } from '../api/shiftApi'
import ShiftForm from '../components/ShiftForm'
import { mapShiftFromApi, mapShiftToApi } from '../data/shiftApiMapper'
import {
  clearShiftFieldErrors,
  getShiftValuePatch,
  shiftFieldMap,
} from '../data/shiftFormState'
import { SHIFT_TABLE, createInitialShiftValues, validateShift } from '../validation/shiftValidation'

const listPath = '/hris/attendance-settings/shift'

function ShiftEdit() {
  const { shiftId } = useParams()
  const navigate = useNavigate()
  const shiftTitleRef = useRef(null)
  const [values, setValues] = useState(createInitialShiftValues)
  const [originalValues, setOriginalValues] = useState(createInitialShiftValues)
  const [errors, setErrors] = useState({})
  const [businessUnitOptions, setBusinessUnitOptions] = useState([])
  const [businessUnitsLoading, setBusinessUnitsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([shiftsApi.get(shiftId), businessUnitsApi.list()])
      .then(([record, units]) => {
        if (!active) return
        const mapped = mapShiftFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setBusinessUnitOptions(units
          .filter((unit) => String(unit.status ?? 1) === '1' || String(unit.id) === mapped.BU_ID)
          .map((unit) => ({ value: String(unit.id), label: unit.businessUnit })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Shift.')
      })
      .finally(() => {
        if (active) setBusinessUnitsLoading(false)
      })
    return () => { active = false }
  }, [shiftId])

  const handleChange = (event) => {
    if (!event?.target) return
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    const patch = getShiftValuePatch(name, nextValue)
    setValues((current) => ({ ...current, ...patch }))
    setErrors((current) => clearShiftFieldErrors(current, Object.keys(patch)))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateShift(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      await shiftsApi.update(shiftId, mapShiftToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Shift.', shiftFieldMap)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    requestAnimationFrame(() => shiftTitleRef.current?.focus())
  }

  return (
    <FormPage
      title={'Shift Edit'}
      listTo={listPath}
      tableName={SHIFT_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
    >
      <ShiftForm
        values={values}
        errors={errors}
        businessUnitOptions={businessUnitOptions}
        businessUnitsLoading={businessUnitsLoading}
        onChange={handleChange}
        shiftTitleRef={shiftTitleRef}
      />
    </FormPage>
  )
}

export default ShiftEdit
