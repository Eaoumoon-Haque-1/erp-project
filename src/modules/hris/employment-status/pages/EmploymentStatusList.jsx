/** @file API-backed Employment Status list page. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { employmentStatusesApi } from '../api/employmentStatusApi'
import { mapEmploymentStatusFromApi, mapEmploymentStatusToApi } from '../data/employmentStatusApiMapper'

const basePath = '/hris/employee-settings/employment-status'
const filters = [
  { key: 'STATUS_NAME', label: 'Search by Status Name', placeholder: '--Search by Status Name--',
    matches: (row, value) => String(row.STATUS_NAME ?? '').toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [
    { label: 'Active', value: '1' }, { label: 'Inactive', value: '0' },
  ] },
]
const columns = [
  { key: 'STATUS_NAME', label: 'Status Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  { key: 'STATUS', label: 'Status', render: (value) => (
    <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
      value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
      {value === '1' ? 'Active' : 'Inactive'}
    </span>
  ) },
]

function EmploymentStatusList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    employmentStatusesApi.list()
      .then((records) => { if (active) setRows(records.map(mapEmploymentStatusFromApi)) })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Employment Statuses.'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleDelete = async (row) => {
    try {
      await employmentStatusesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Employment Status.')
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await employmentStatusesApi.update(row.ID,
        mapEmploymentStatusToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID ? mapEmploymentStatusFromApi(updated) : item))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Employment Status status.')
      return false
    }
  }

  return (
    <ListPage title={'Employment Status List'} createLabel={'New'} createTo={`${basePath}/create`}
      filters={filters} columns={columns} rows={rows} rowKey={'ID'} loading={loading}
      renderActions={(row) => <ListRowActions row={row} entityName={'Employment Status'}
        onView={() => navigate(`${basePath}/${row.ID}/view`)}
        onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
        onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
  )
}

export default EmploymentStatusList
