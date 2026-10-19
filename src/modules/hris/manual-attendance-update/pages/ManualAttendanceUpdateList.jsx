/** @file API-backed Manual Attendance Update list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { manualAttendanceUpdatesApi } from '../api/manualAttendanceUpdateApi'
import { mapManualAttendanceUpdateFromApi, mapManualAttendanceUpdateToApi } from '../data/manualAttendanceUpdateApiMapper'
import { loadManualAttendanceUpdateReferences } from '../data/manualAttendanceUpdateReferences'

const basePath = '/hris/hris-forms/manual-attendance-update'
const columns = [
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'DEPARTMENT_NAME', label: 'Department Name' },
  { key: 'DESIGNATION_NAME', label: 'Designation Name' },
  { key: 'SHIFT_TITLE', label: 'Shift' },
  { key: 'ATTEN_DATE', label: 'Attendance Date', render: formatDateForDisplay },
  { key: 'IN_TIME', label: 'In Time' },
  { key: 'OUT_TIME', label: 'Out Time' },
  { key: 'STATUS', label: 'Status', render: (value) => (
    <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
      value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
      {value === '1' ? 'Active' : 'Inactive'}
    </span>
  ) },
]

function ManualAttendanceUpdateList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([manualAttendanceUpdatesApi.list(), loadManualAttendanceUpdateReferences()])
      .then(([records, loaded]) => {
        if (!active) return
        setReferences(loaded)
        setRows(records.map((record) => mapManualAttendanceUpdateFromApi(record, loaded)))
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Manual Attendance Updates.'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BU_ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--',
      options: (references?.units || []).map((item) => ({ value: String(item.id), label: item.businessUnit })) },
    { key: 'DEPT_ID', label: 'Search by Department', placeholder: '--Search by Department--',
      options: (references?.departments || []).map((item) => ({ value: String(item.id), label: item.departmentName })) },
    { key: 'SHIFT_ID', label: 'Search by Shift', placeholder: '--Search by Shift--',
      options: (references?.shifts || []).map((item) => ({ value: String(item.id), label: item.shiftTitle })) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [
      { label: 'Active', value: '1' }, { label: 'Inactive', value: '0' },
    ] },
  ], [references])

  const handleDelete = async (row) => {
    try {
      await manualAttendanceUpdatesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Manual Attendance Update.')
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await manualAttendanceUpdatesApi.update(row.ID,
        mapManualAttendanceUpdateToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? mapManualAttendanceUpdateFromApi(updated, references) : item))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Manual Attendance status.')
      return false
    }
  }

  return (
    <ListPage title={'Manual Attendance Update List'} createLabel={'New'} createTo={`${basePath}/create`}
      filters={filters} columns={columns} rows={rows} rowKey={'ID'} loading={loading}
      renderActions={(row) => <ListRowActions row={row} entityName={'Manual Attendance Update'}
        onView={() => navigate(`${basePath}/${row.ID}/view`)}
        onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
        onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
  )
}

export default ManualAttendanceUpdateList
