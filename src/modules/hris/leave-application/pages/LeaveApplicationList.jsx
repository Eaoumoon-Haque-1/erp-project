/** @file API-backed Leave Application list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { leaveApplicationsApi } from '../api/leaveApplicationApi'
import { mapLeaveApplicationFromApi } from '../data/leaveApplicationApiMapper'
import { loadLeaveApplicationReferences } from '../data/leaveApplicationReferences'

const basePath = '/hris/hris-forms/leave-application'

const columns = [
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'EMPLOYEE_NAME', label: 'Employee' },
  { key: 'DEPARTMENT', label: 'Department' },
  { key: 'DESIGNATION', label: 'Designation' },
  { key: 'FROM_DATE', label: 'From Date', render: formatDateForDisplay },
  { key: 'TO_DATE', label: 'To Date', render: formatDateForDisplay },
  { key: 'LEAVE_CATEGORY', label: 'Leave Category' },
  { key: 'TOTAL_LEAVE_DAYS', label: 'Total Days' },
  { key: 'STATUS', label: 'Status', render: (value) => (
    <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
      String(value) === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
      {String(value) === '1' ? 'Submitted' : 'Draft'}
    </span>
  ) },
]

function LeaveApplicationList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([leaveApplicationsApi.list(), loadLeaveApplicationReferences()])
      .then(([records, references]) => {
        if (!active) return
        const mapped = records.map((record) => mapLeaveApplicationFromApi(record, references))
        setRows(mapped)
        setEmployeeOptions(references.employeeOptions)
        setCategoryOptions([...new Map(mapped.filter((row) => row.LEAVE_CATEGORY_ID)
          .map((row) => [row.LEAVE_CATEGORY_ID, { value: row.LEAVE_CATEGORY_ID, label: row.LEAVE_CATEGORY }])).values()])
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Leave Applications.'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'EMPLOYEE_ID', label: 'Search by Employee', placeholder: '--Search by Employee--', options: employeeOptions },
    { key: 'LEAVE_CATEGORY_ID', label: 'Search by Leave Category', placeholder: '--Search by Leave Category--', options: categoryOptions },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [
      { label: 'Submitted', value: '1' }, { label: 'Draft', value: '0' },
    ] },
  ], [categoryOptions, employeeOptions])

  const handleDelete = async (row) => {
    await leaveApplicationsApi.remove(row.ID)
    setRows((current) => current.filter((item) => item.ID !== row.ID))
  }
  const handleSubmit = async (row) => {
    const updated = await leaveApplicationsApi.submit(row.ID)
    setRows((current) => current.map((item) => item.ID === row.ID
      ? { ...item, STATUS: String(updated.status ?? 1) } : item))
  }

  return <ListPage title={'Leave Application List'} createLabel={'New'} createTo={`${basePath}/create`}
    filters={filters} columns={columns} rows={rows} rowKey={'ID'} loading={loading}
    renderActions={(row) => <ListRowActions row={row} entityName={'Leave Application'}
      onView={() => navigate(`${basePath}/${row.ID}/view`)}
      onEdit={row.STATUS === '0' ? () => navigate(`${basePath}/${row.ID}/edit`) : undefined}
      onDelete={row.STATUS === '0' ? handleDelete : undefined}
      onStatusChange={row.STATUS === '0' ? handleSubmit : undefined} />} />
}

export default LeaveApplicationList
