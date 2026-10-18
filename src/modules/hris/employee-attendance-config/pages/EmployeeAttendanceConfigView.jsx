/** @file Read-only Employee Attendance Config details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { employeeAttendanceConfigsApi } from '../api/employeeAttendanceConfigApi'
import { mapEmployeeAttendanceConfigFromApi } from '../data/employeeAttendanceConfigApiMapper'
import { loadEmployeeAttendanceConfigReferences } from '../data/employeeAttendanceConfigReferences'

const basePath = '/hris/hris-forms/employee-attendance-config'

async function loadRecord(id) {
  const [record, references] = await Promise.all([
    employeeAttendanceConfigsApi.get(id), loadEmployeeAttendanceConfigReferences(),
  ])
  const mapped = mapEmployeeAttendanceConfigFromApi(record, references)
  const values = mapped.values
  return {
    ...values,
    ATTENDANCE_PERMISSION: values.ATTENDANCE_PERMISSIONS.join(', '),
    SHIFT_NAMES: (record.shifts || []).map((shift) => shift.shiftTitle).filter(Boolean).join(', ')
      || (Array.isArray(values.SHIFT_ID) ? values.SHIFT_ID.join(', ') : values.SHIFT_ID),
    WIFI_NAMES: (record.wifis || []).map((wifi) => wifi.wifiName).filter(Boolean).join(', '),
    GPS_NAMES: (record.gpsLocations || []).map((gps) => gps.locationName).filter(Boolean).join(', '),
  }
}

const fields = [
  { label: 'Business Unit', key: 'BUSINESS_UNIT' },
  { label: 'Employee ID', key: 'EMPLOYEE_CODE' },
  { label: 'Employee Name', key: 'EMPLOYEE_NAME' },
  { label: 'Employee Type', key: 'EMPLOYEE_TYPE' },
  { label: 'Department', key: 'DEPARTMENT_NAME' },
  { label: 'Designation', key: 'DESIGNATION_NAME' },
  { label: 'Attendance Permission', key: 'ATTENDANCE_PERMISSION' },
  { label: 'Attendance Shift', key: 'SHIFT_MODE' },
  { label: 'Shift Name', key: 'SHIFT_NAMES' },
  { label: 'WiFi', key: 'WIFI_NAMES' },
  { label: 'GPS Location', key: 'GPS_NAMES' },
  { label: 'WiFi Flexible', key: 'WIFI_FLEXIBLE', type: 'boolean' },
  { label: 'GPS Flexible', key: 'GPS_FLEXIBLE', type: 'boolean' },
  { label: 'GPS Tracking', key: 'GPS_TRACKING', type: 'boolean' },
  { label: 'Tracking From Time', key: 'TRACKING_FROM_TIME' },
  { label: 'Tracking To Time', key: 'TRACKING_TO_TIME' },
  { label: 'Status', key: 'STATUS', type: 'status' },
]

function EmployeeAttendanceConfigView() {
  return <ApiRecordViewPage title={'Employee Attendance Config View'} param={'employeeAttendanceConfigId'}
    listTo={basePath} editTo={(id) => `${basePath}/${id}/edit`} loader={loadRecord} fields={fields} />
}

export default EmployeeAttendanceConfigView
