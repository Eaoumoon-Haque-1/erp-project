/** @file Shared controlled state and row handlers for Employee Attendance Config create/edit. */
import { useState } from 'react'
import {
  createGpsConfigRow,
  createInitialEmployeeAttendanceConfigValues,
  createWifiConfigRow,
} from '../validation/employeeAttendanceConfigValidation'

const emptyRows = () => ({ wifiRows: [createWifiConfigRow()], gpsRows: [createGpsConfigRow()] })

export default function useEmployeeAttendanceConfigFormState(references) {
  const [values, setValues] = useState(createInitialEmployeeAttendanceConfigValues)
  const [errors, setErrors] = useState({})
  const [activeTab, setActiveTab] = useState('wifi')
  const [wifiRows, setWifiRows] = useState(() => emptyRows().wifiRows)
  const [gpsRows, setGpsRows] = useState(() => emptyRows().gpsRows)

  const hydrate = (state = {}) => {
    setValues(state.values || createInitialEmployeeAttendanceConfigValues())
    setWifiRows(state.wifiRows || [createWifiConfigRow()])
    setGpsRows(state.gpsRows || [createGpsConfigRow()])
    setErrors({})
    setActiveTab('wifi')
  }

  const handleChange = (event) => {
    if (!event?.target) return
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' && typeof checked === 'boolean' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'SHIFT_MODE' ? {
        SHIFT_ID: nextValue === 'Multiple'
          ? (Array.isArray(current.SHIFT_ID) ? current.SHIFT_ID : current.SHIFT_ID ? [current.SHIFT_ID] : [])
          : (Array.isArray(current.SHIFT_ID) ? current.SHIFT_ID[0] ?? '' : current.SHIFT_ID),
      } : {}),
      ...(name === 'BU_ID' ? {
        EMPLOYEE_ID: '', EMPLOYEE_CODE: '', EMPLOYEE_NAME: '', EMPLOYEE_TYPE: '',
        DEPARTMENT_NAME: '', DESIGNATION_NAME: '', SHIFT_ID: current.SHIFT_MODE === 'Multiple' ? [] : '',
      } : {}),
      ...(name === 'WIFI_FLEXIBLE' ? { WIFI_IN_FLEXIBLE: nextValue, WIFI_OUT_FLEXIBLE: nextValue } : {}),
      ...(name === 'GPS_FLEXIBLE' ? { GPS_IN_FLEXIBLE: nextValue, GPS_OUT_FLEXIBLE: nextValue } : {}),
      ...(name === 'GPS_TRACKING' && nextValue === '0' ? { TRACKING_FROM_TIME: '', TRACKING_TO_TIME: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined, ...(name === 'SHIFT_MODE' ? { SHIFT_ID: undefined } : {}) }))
    if (name === 'BU_ID') {
      setWifiRows([createWifiConfigRow()])
      setGpsRows([createGpsConfigRow()])
    }
  }

  const handleShiftMultiSelectChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleEmployeeChange = (event) => {
    const employee = references.employeeById?.get(event.target.value)
    setValues((current) => ({
      ...current,
      EMPLOYEE_ID: employee?.id || '', EMPLOYEE_CODE: employee?.code || '',
      EMPLOYEE_NAME: employee?.name || '', EMPLOYEE_TYPE: employee?.type || '',
      DEPARTMENT_NAME: employee?.department || '', DESIGNATION_NAME: employee?.designation || '',
    }))
    setErrors((current) => ({ ...current, EMPLOYEE_ID: undefined }))
  }

  const handlePermissionChange = (permission) => {
    setValues((current) => {
      const permissions = current.ATTENDANCE_PERMISSIONS.includes(permission)
        ? current.ATTENDANCE_PERMISSIONS.filter((item) => item !== permission)
        : [...current.ATTENDANCE_PERMISSIONS, permission]
      const next = { ...current, ATTENDANCE_PERMISSIONS: permissions }
      if (!permissions.includes('WiFi')) Object.assign(next, { WIFI_FLEXIBLE: '0', WIFI_IN_FLEXIBLE: '0', WIFI_OUT_FLEXIBLE: '0' })
      if (!permissions.includes('GPS')) Object.assign(next, {
        GPS_FLEXIBLE: '0', GPS_IN_FLEXIBLE: '0', GPS_OUT_FLEXIBLE: '0',
        GPS_TRACKING: '0', TRACKING_FROM_TIME: '', TRACKING_TO_TIME: '',
      })
      return next
    })
    setErrors((current) => ({
      ...current, ATTENDANCE_PERMISSIONS: undefined, WIFI_ROWS: undefined, GPS_ROWS: undefined,
    }))
  }

  const handleWifiSelection = (index, wifiId) => {
    const wifi = references.wifiOptions?.find((item) => item.ID === wifiId)
    setWifiRows((current) => current.map((row, rowIndex) => rowIndex === index ? {
      ...row, WIFI_ID: wifi?.ID || '', MAC_ADDRESS: wifi?.MAC_ADDRESS || '', STATUS: wifi?.STATUS || '',
    } : row))
    setErrors((current) => ({ ...current, WIFI_ROWS: undefined }))
  }

  const handleGpsSelection = (index, locationId) => {
    const location = references.gpsOptions?.find((item) => item.ID === locationId)
    setGpsRows((current) => current.map((row, rowIndex) => rowIndex === index ? {
      ...row, LOCATION_ID: location?.ID || '', LATITUDE: location?.LATITUDE || '',
      LONGITUDE: location?.LONGITUDE || '', STATUS: location?.STATUS || '',
    } : row))
    setErrors((current) => ({ ...current, GPS_ROWS: undefined }))
  }

  return {
    values, setValues, errors, setErrors, activeTab, setActiveTab, wifiRows, gpsRows, hydrate,
    formProps: {
      onChange: handleChange, onShiftMultiSelectChange: handleShiftMultiSelectChange,
      onEmployeeChange: handleEmployeeChange, onPermissionChange: handlePermissionChange,
      onWifiSelection: handleWifiSelection, onGpsSelection: handleGpsSelection,
      onAddWifiRow: () => setWifiRows((current) => [...current, createWifiConfigRow()]),
      onRemoveWifiRow: (index) => setWifiRows((current) => current.length === 1
        ? [createWifiConfigRow()] : current.filter((_, rowIndex) => rowIndex !== index)),
      onAddGpsRow: () => setGpsRows((current) => [...current, createGpsConfigRow()]),
      onRemoveGpsRow: (index) => setGpsRows((current) => current.length === 1
        ? [createGpsConfigRow()] : current.filter((_, rowIndex) => rowIndex !== index)),
    },
  }
}
