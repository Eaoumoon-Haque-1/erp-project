/** @file API-backed Department list page. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { departmentsApi } from '../api/departmentApi'
import { mapDepartmentFromApi, mapDepartmentToApi } from '../data/departmentApiMapper'

const basePath = '/hris/employee-settings/department'

const columns = [
  { key: 'DEPARTMENT_NAME', label: 'Department Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>,
  },
]

const filters = [
  { key: 'DEPARTMENT_NAME', label: 'Search by Department Name', placeholder: '--Search by Department Name--', searchable: true, matches: (row, value) => row.DEPARTMENT_NAME.toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]

function bySortOrder(left, right) {
  const leftOrder = Number(left.SORT_ORDER)
  const rightOrder = Number(right.SORT_ORDER)
  const safeLeftOrder = Number.isFinite(leftOrder) ? leftOrder : Number.POSITIVE_INFINITY
  const safeRightOrder = Number.isFinite(rightOrder) ? rightOrder : Number.POSITIVE_INFINITY

  return safeLeftOrder - safeRightOrder
    || left.DEPARTMENT_NAME.localeCompare(right.DEPARTMENT_NAME)
}

function DepartmentList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionGroupId) return undefined

    let active = true
    departmentsApi.list(sessionGroupId)
      .then((departments) => {
        if (!active) return
        setRows(departments.map((department) => mapDepartmentFromApi(department)).sort(bySortOrder))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Departments.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [sessionGroupId])

  const handleDelete = async (row) => {
    try {
      await departmentsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Department.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await departmentsApi.update(row.ID, mapDepartmentToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? mapDepartmentFromApi(updated, new Map([[row.BG_ID, row.GROUP_NAME]]))
        : item))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Department status.')
    }
  }

  return (
    <ListPage title={'Department List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default DepartmentList
