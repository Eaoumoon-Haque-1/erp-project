/** @file Converts Employee Attendance Config API records to and from form state. */
import { createGpsConfigRow, createWifiConfigRow } from '../validation/employeeAttendanceConfigValidation'

const text = (value) => value == null ? '' : String(value)
const methodLabel = (method) => {
  const value = text(method).toLowerCase()
  if (value === 'wifi' || value === 'wi-fi') return 'WiFi'
  if (value === 'gps') return 'GPS'
  if (value === 'machine') return 'Machine'
  return text(method)
}

function shiftIds(record) {
  const ids = Array.isArray(record.shiftIds) && record.shiftIds.length
    ? record.shiftIds
    : (record.shifts || []).map((item) => item.shiftId)
  return ids.map(text).filter(Boolean)
}

function mapWifiRows(record, references) {
  const items = Array.isArray(record.wifis) && record.wifis.length
    ? record.wifis
    : (record.wifiIds || []).map((wifiId) => references.wifiOptions.find((item) => item.ID === text(wifiId)) || { wifiId })
  return items.length ? items.map((item) => ({
    ...createWifiConfigRow(),
    WIFI_ID: text(item.wifiId ?? item.ID),
    MAC_ADDRESS: item.macAddress ?? item.MAC_ADDRESS ?? '',
    STATUS: text(item.status ?? 1) === '1' ? 'Active' : 'Inactive',
  })) : [createWifiConfigRow()]
}

function mapGpsRows(record, references) {
  const items = Array.isArray(record.gpsLocations) && record.gpsLocations.length
    ? record.gpsLocations
    : (record.gpsIds || []).map((locationId) => references.gpsOptions.find((item) => item.ID === text(locationId)) || { locationId })
  return items.length ? items.map((item) => ({
    ...createGpsConfigRow(),
    LOCATION_ID: text(item.locationId ?? item.ID),
    LATITUDE: text(item.latitude ?? item.LATITUDE),
    LONGITUDE: text(item.longitude ?? item.LONGITUDE),
    STATUS: text(item.status ?? 1) === '1' ? 'Active' : 'Inactive',
  })) : [createGpsConfigRow()]
}

export function mapEmployeeAttendanceConfigFromApi(record = {}, references = {}) {
  const employee = references.employeeById?.get(text(record.employeeId))
  const selectedShiftIds = shiftIds(record)
  const shiftMode = text(record.shiftMode).toLowerCase() === 'multiple' ? 'Multiple' : 'Single'
  const attendanceMethods = (record.attendanceMethods || []).map(methodLabel).filter(Boolean)

  return {
    values: {
      ID: text(record.id),
      BU_ID: text(record.buId),
      BUSINESS_UNIT: references.businessUnitNames?.get(text(record.buId)) || text(record.buId),
      EMPLOYEE_ID: text(record.employeeId),
      EMPLOYEE_CODE: record.employeeCode || employee?.code || '',
      EMPLOYEE_NAME: record.employeeName || employee?.name || '',
      EMPLOYEE_TYPE: employee?.type || text(record.empTypeId),
      DEPARTMENT_NAME: employee?.department || text(record.deptId),
      DESIGNATION_NAME: employee?.designation || text(record.desigId),
      ATTENDANCE_PERMISSIONS: attendanceMethods,
      WIFI_FLEXIBLE: text(record.wifiFlexible ?? 0),
      WIFI_IN_FLEXIBLE: text(record.wifiInFlexible ?? 0),
      WIFI_OUT_FLEXIBLE: text(record.wifiOutFlexible ?? 0),
      GPS_FLEXIBLE: text(record.gpsFlexible ?? 0),
      GPS_IN_FLEXIBLE: text(record.gpsInFlexible ?? 0),
      GPS_OUT_FLEXIBLE: text(record.gpsOutFlexible ?? 0),
      GPS_TRACKING: text(record.gpsTracking ?? 0),
      TRACKING_FROM_TIME: text(record.trackingFromTime).slice(0, 5),
      TRACKING_TO_TIME: text(record.trackingToTime).slice(0, 5),
      SHIFT_MODE: shiftMode,
      SHIFT_ID: shiftMode === 'Multiple' ? selectedShiftIds : selectedShiftIds[0] || '',
      STATUS: text(record.status ?? 1),
    },
    wifiRows: mapWifiRows(record, references),
    gpsRows: mapGpsRows(record, references),
  }
}

export function mapEmployeeAttendanceConfigToApi(values, wifiRows, gpsRows, employee) {
  const shiftIds = (Array.isArray(values.SHIFT_ID) ? values.SHIFT_ID : [values.SHIFT_ID])
    .filter(Boolean).map(Number)
  return {
    buId: Number(values.BU_ID),
    employeeId: Number(values.EMPLOYEE_ID),
    employeeName: values.EMPLOYEE_NAME,
    employeeCode: values.EMPLOYEE_CODE,
    empTypeId: employee?.empTypeId ? Number(employee.empTypeId) : null,
    deptId: employee?.deptId ? Number(employee.deptId) : null,
    desigId: employee?.desigId ? Number(employee.desigId) : null,
    attendanceMethods: values.ATTENDANCE_PERMISSIONS,
    wifiFlexible: Number(values.WIFI_FLEXIBLE),
    wifiInFlexible: Number(values.WIFI_IN_FLEXIBLE),
    wifiOutFlexible: Number(values.WIFI_OUT_FLEXIBLE),
    gpsFlexible: Number(values.GPS_FLEXIBLE),
    gpsInFlexible: Number(values.GPS_IN_FLEXIBLE),
    gpsOutFlexible: Number(values.GPS_OUT_FLEXIBLE),
    gpsTracking: Number(values.GPS_TRACKING),
    trackingFromTime: values.GPS_TRACKING === '1' ? values.TRACKING_FROM_TIME : null,
    trackingToTime: values.GPS_TRACKING === '1' ? values.TRACKING_TO_TIME : null,
    shiftMode: values.SHIFT_MODE,
    status: Number(values.STATUS),
    shiftIds,
    wifiIds: values.ATTENDANCE_PERMISSIONS.includes('WiFi')
      ? wifiRows.map((row) => row.WIFI_ID).filter(Boolean).map(Number) : [],
    gpsIds: values.ATTENDANCE_PERMISSIONS.includes('GPS')
      ? gpsRows.map((row) => row.LOCATION_ID).filter(Boolean).map(Number) : [],
  }
}

export const employeeAttendanceConfigFieldMap = {
  buId: 'BU_ID', employeeId: 'EMPLOYEE_ID', attendanceMethods: 'ATTENDANCE_PERMISSIONS',
  shiftIds: 'SHIFT_ID', wifiIds: 'WIFI_ROWS', gpsIds: 'GPS_ROWS',
  trackingFromTime: 'TRACKING_FROM_TIME', trackingToTime: 'TRACKING_TO_TIME', status: 'STATUS',
}
