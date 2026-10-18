/** @file API-backed Employee Attendance Config create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { employeeAttendanceConfigsApi } from '../api/employeeAttendanceConfigApi'
import EmployeeAttendanceConfigForm from '../components/EmployeeAttendanceConfigForm'
import {
  employeeAttendanceConfigFieldMap,
  mapEmployeeAttendanceConfigToApi,
} from '../data/employeeAttendanceConfigApiMapper'
import { loadEmployeeAttendanceConfigReferences } from '../data/employeeAttendanceConfigReferences'
import useEmployeeAttendanceConfigFormState from '../hooks/useEmployeeAttendanceConfigFormState'
import {
  EMPLOYEE_ATTENDANCE_CONFIG_TABLE,
  validateEmployeeAttendanceConfig,
} from '../validation/employeeAttendanceConfigValidation'

const listPath = '/hris/hris-forms/employee-attendance-config'
const emptyReferences = {
  businessUnits: [], employees: [], shiftOptions: [], wifiOptions: [], gpsOptions: [], employeeById: new Map(),
}

function EmployeeAttendanceConfigCreate() {
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [references, setReferences] = useState(emptyReferences)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const editor = useEmployeeAttendanceConfigFormState(references)

  useEffect(() => {
    let active = true
    loadEmployeeAttendanceConfigReferences()
      .then((loaded) => { if (active) setReferences(loaded) })
      .catch((error) => { if (active) getApiErrorMessage(error, 'Unable to load Attendance Config options.') })
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateEmployeeAttendanceConfig(editor.values, editor.wifiRows, editor.gpsRows)
    editor.setValues(result.values)
    editor.setErrors(result.errors)
    if (!result.isValid) {
      if (result.errors.WIFI_ROWS) editor.setActiveTab('wifi')
      else if (result.errors.GPS_ROWS) editor.setActiveTab('gps')
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return false
    }

    setSubmitting(true)
    try {
      const employee = references.employeeById.get(result.values.EMPLOYEE_ID)
      await employeeAttendanceConfigsApi.create(
        mapEmployeeAttendanceConfigToApi(result.values, editor.wifiRows, editor.gpsRows, employee),
      )
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, editor.setErrors, 'Unable to create Employee Attendance Config.', employeeAttendanceConfigFieldMap)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    editor.hydrate()
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage title={'Employee Attendance Config Create'} listTo={listPath}
      tableName={EMPLOYEE_ATTENDANCE_CONFIG_TABLE} onSubmit={handleSubmit}
      onReset={handleReset} submitting={submitting}>
      <EmployeeAttendanceConfigForm values={editor.values} errors={editor.errors}
        businessUnitRef={businessUnitRef} businessUnits={references.businessUnits}
        employees={references.employees} shiftOptions={references.shiftOptions}
        wifiOptions={references.wifiOptions} gpsOptions={references.gpsOptions}
        referencesLoading={referencesLoading} wifiRows={editor.wifiRows} gpsRows={editor.gpsRows}
        activeTab={editor.activeTab} onTabChange={editor.setActiveTab} {...editor.formProps} />
    </FormPage>
  )
}

export default EmployeeAttendanceConfigCreate
