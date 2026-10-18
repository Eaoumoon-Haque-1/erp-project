/** @file API-backed Employee Attendance Config edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { employeeAttendanceConfigsApi } from '../api/employeeAttendanceConfigApi'
import EmployeeAttendanceConfigForm from '../components/EmployeeAttendanceConfigForm'
import {
  employeeAttendanceConfigFieldMap,
  mapEmployeeAttendanceConfigFromApi,
  mapEmployeeAttendanceConfigToApi,
} from '../data/employeeAttendanceConfigApiMapper'
import { loadEmployeeAttendanceConfigReferences } from '../data/employeeAttendanceConfigReferences'
import useEmployeeAttendanceConfigFormState from '../hooks/useEmployeeAttendanceConfigFormState'
import { EMPLOYEE_ATTENDANCE_CONFIG_TABLE, validateEmployeeAttendanceConfig } from '../validation/employeeAttendanceConfigValidation'

const listPath = '/hris/hris-forms/employee-attendance-config'
const emptyReferences = {
  businessUnits: [], employees: [], shiftOptions: [], wifiOptions: [], gpsOptions: [], employeeById: new Map(),
}

function EmployeeAttendanceConfigEdit() {
  const { employeeAttendanceConfigId } = useParams()
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [references, setReferences] = useState(emptyReferences)
  const [originalState, setOriginalState] = useState(null)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const editor = useEmployeeAttendanceConfigFormState(references)

  useEffect(() => {
    let active = true
    Promise.all([
      employeeAttendanceConfigsApi.get(employeeAttendanceConfigId),
      loadEmployeeAttendanceConfigReferences(),
    ])
      .then(([record, loaded]) => {
        if (!active) return
        const mapped = mapEmployeeAttendanceConfigFromApi(record, loaded)
        const shiftOptions = [...loaded.shiftOptions]
        for (const shift of record.shifts || []) {
          if (!shiftOptions.some((option) => option.value === String(shift.shiftId))) {
            shiftOptions.push({ value: String(shift.shiftId), label: shift.shiftTitle || String(shift.shiftId), buId: mapped.values.BU_ID })
          }
        }
        const wifiOptions = [...loaded.wifiOptions]
        for (const wifi of record.wifis || []) {
          if (!wifiOptions.some((option) => option.ID === String(wifi.wifiId))) {
            wifiOptions.push({ ID: String(wifi.wifiId), BU_ID: mapped.values.BU_ID, WIFI_NAME: wifi.wifiName || String(wifi.wifiId), MAC_ADDRESS: wifi.macAddress || '', STATUS: String(wifi.status ?? 1) === '1' ? 'Active' : 'Inactive' })
          }
        }
        const gpsOptions = [...loaded.gpsOptions]
        for (const gps of record.gpsLocations || []) {
          if (!gpsOptions.some((option) => option.ID === String(gps.locationId))) {
            gpsOptions.push({ ID: String(gps.locationId), BU_ID: mapped.values.BU_ID, LOCATION_NAME: gps.locationName || String(gps.locationId), LATITUDE: String(gps.latitude ?? ''), LONGITUDE: String(gps.longitude ?? ''), STATUS: String(gps.status ?? 1) === '1' ? 'Active' : 'Inactive' })
          }
        }
        setReferences({
          ...loaded,
          shiftOptions,
          wifiOptions,
          gpsOptions,
          businessUnits: loaded.businessUnits.some((unit) => unit.ID === mapped.values.BU_ID)
            ? loaded.businessUnits
            : [...loaded.businessUnits, { ID: mapped.values.BU_ID, BUSINESS_UNIT: mapped.values.BUSINESS_UNIT }],
        })
        setOriginalState(mapped)
        editor.hydrate(mapped)
      })
      .catch((error) => { if (active) getApiErrorMessage(error, 'Unable to load Employee Attendance Config.') })
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
    // editor methods intentionally initialize the fetched record once per route id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeAttendanceConfigId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateEmployeeAttendanceConfig(editor.values, editor.wifiRows, editor.gpsRows)
    editor.setValues(result.values)
    editor.setErrors(result.errors)
    if (!result.isValid) {
      if (result.errors.WIFI_ROWS) editor.setActiveTab('wifi')
      else if (result.errors.GPS_ROWS) editor.setActiveTab('gps')
      return false
    }

    setSubmitting(true)
    try {
      const employee = references.employeeById.get(result.values.EMPLOYEE_ID)
      await employeeAttendanceConfigsApi.update(
        employeeAttendanceConfigId,
        mapEmployeeAttendanceConfigToApi(result.values, editor.wifiRows, editor.gpsRows, employee),
      )
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, editor.setErrors, 'Unable to update Employee Attendance Config.', employeeAttendanceConfigFieldMap)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    editor.hydrate(originalState || undefined)
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage title={'Employee Attendance Config Edit'} listTo={listPath}
      tableName={EMPLOYEE_ATTENDANCE_CONFIG_TABLE} onSubmit={handleSubmit}
      onReset={handleReset} submitLabel={'Update'} submitting={submitting}>
      <EmployeeAttendanceConfigForm values={editor.values} errors={editor.errors}
        businessUnitRef={businessUnitRef} businessUnits={references.businessUnits}
        employees={references.employees} shiftOptions={references.shiftOptions}
        wifiOptions={references.wifiOptions} gpsOptions={references.gpsOptions}
        referencesLoading={referencesLoading} wifiRows={editor.wifiRows} gpsRows={editor.gpsRows}
        activeTab={editor.activeTab} onTabChange={editor.setActiveTab} {...editor.formProps} />
    </FormPage>
  )
}

export default EmployeeAttendanceConfigEdit
