/** @file API-backed Shift create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { shiftsApi } from '../api/shiftApi'
import ShiftForm from '../components/ShiftForm'
import { mapShiftToApi } from '../data/shiftApiMapper'
import { clearShiftFieldErrors, getShiftValuePatch, shiftFieldMap } from '../data/shiftFormState'
import { SHIFT_TABLE, createInitialShiftValues, validateShift } from '../validation/shiftValidation'

const listPath = '/hris/attendance-settings/shift'

function ShiftCreate() {
  const navigate = useNavigate()
  const shiftTitleRef = useRef(null)
  const [values, setValues] = useState(createInitialShiftValues)
  const [errors, setErrors] = useState({})
  const [businessUnitOptions, setBusinessUnitOptions] = useState([])
  const [businessUnitsLoading, setBusinessUnitsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    businessUnitsApi.list()
      .then((units) => {
        if (!active) return
        setBusinessUnitOptions(units
          .filter((unit) => String(unit.status ?? 1) === '1')
          .map((unit) => ({ value: String(unit.id), label: unit.businessUnit })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Business Units.')
      })
      .finally(() => {
        if (active) setBusinessUnitsLoading(false)
      })
    return () => { active = false }
  }, [])

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
      await shiftsApi.create(mapShiftToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Shift.', shiftFieldMap)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialShiftValues())
    setErrors({})
    requestAnimationFrame(() => shiftTitleRef.current?.focus())
  }

  return (
    <FormPage
      title={'Shift Create'}
      listTo={listPath}
      tableName={SHIFT_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
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

export default ShiftCreate
