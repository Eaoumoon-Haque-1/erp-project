/** @file API-backed Employee Attendance Config list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { employeeAttendanceConfigsApi } from '../api/employeeAttendanceConfigApi'
import {
  mapEmployeeAttendanceConfigFromApi,
  mapEmployeeAttendanceConfigToApi,
} from '../data/employeeAttendanceConfigApiMapper'
import { loadEmployeeAttendanceConfigReferences } from '../data/employeeAttendanceConfigReferences'

const basePath = '/hris/hris-forms/employee-attendance-config'
const columns = [
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'EMPLOYEE_CODE', label: 'Employee ID' },
  { key: 'DEPARTMENT_NAME', label: 'Department' },
  { key: 'EMPLOYEE_NAME', label: 'Employee Name' },
  { key: 'ATTENDANCE_PERMISSION', label: 'Attendance Permission' },
  { key: 'STATUS', label: 'Status', render: (value) => (
    <span className={[
      'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
      value === '1' ? 'bg-action-success' : 'bg-action-danger',
    ].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>
  ) },
]

function EmployeeAttendanceConfigList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([employeeAttendanceConfigsApi.list(), loadEmployeeAttendanceConfigReferences()])
      .then(([records, loaded]) => {
        if (!active) return
        setReferences(loaded)
        setRows(records.map((record) => {
          const mapped = mapEmployeeAttendanceConfigFromApi(record, loaded)
          return {
            ...mapped.values,
            WIFI_ROWS: mapped.wifiRows,
            GPS_ROWS: mapped.gpsRows,
            ATTENDANCE_PERMISSION: mapped.values.ATTENDANCE_PERMISSIONS.join('/'),
          }
        }))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Employee Attendance Configs.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BU_ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--',
      options: (references?.businessUnits || []).map((unit) => ({ value: unit.ID, label: unit.BUSINESS_UNIT })) },
    { key: 'EMPLOYEE_ID', label: 'Search by Employee', placeholder: '--Search by Employee--',
      options: (references?.employees || []).map((employee) => ({ value: employee.id, label: employee.name })) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [references])

  const handleDelete = async (row) => {
    try {
      await employeeAttendanceConfigsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Employee Attendance Config.'))
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const next = { ...row, STATUS: row.STATUS === '1' ? '0' : '1' }
      const updated = await employeeAttendanceConfigsApi.update(
        row.ID,
        mapEmployeeAttendanceConfigToApi(
          next, row.WIFI_ROWS, row.GPS_ROWS, references?.employeeById.get(row.EMPLOYEE_ID),
        ),
      )
      const mapped = mapEmployeeAttendanceConfigFromApi(updated, references)
      setRows((current) => current.map((item) => item.ID === row.ID ? {
        ...mapped.values, WIFI_ROWS: mapped.wifiRows, GPS_ROWS: mapped.gpsRows,
        ATTENDANCE_PERMISSION: mapped.values.ATTENDANCE_PERMISSIONS.join('/'),
      } : item))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Employee Attendance Config status.'))
      return false
    }
  }

  return (
    <ListPage title={'Employee Attendance Config List'} createLabel={'New'} createTo={`${basePath}/create`}
      filters={filters} columns={columns} rows={rows} rowKey={'ID'} loading={loading} message={message}
      renderActions={(row) => (
        <ListRowActions row={row} entityName={'Employee Attendance Config'}
          onView={() => navigate(`${basePath}/${row.ID}/view`)}
          onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
          onDelete={handleDelete} onStatusChange={handleStatusChange} />
      )} />
  )
}

export default EmployeeAttendanceConfigList
