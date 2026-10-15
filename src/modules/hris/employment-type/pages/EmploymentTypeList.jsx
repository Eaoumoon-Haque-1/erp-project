/** @file API-backed Employment Type list page. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { employmentTypesApi } from '../api/employmentTypeApi'
import { mapEmploymentTypeFromApi, mapEmploymentTypeToApi } from '../data/employmentTypeApiMapper'

const basePath = '/hris/employee-settings/employment-type'
const filters = [
  { key: 'TYPE_NAME', label: 'Search by Type Name', placeholder: '--Search by Type Name--', matches: (row, value) => String(row.TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]
const columns = [
  { key: 'TYPE_NAME', label: 'Type Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function EmploymentTypeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    employmentTypesApi.list()
      .then((records) => { if (active) setRows(records.map(mapEmploymentTypeFromApi)) })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Employment Types.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleDelete = async (row) => {
    try {
      await employmentTypesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Employment Type.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await employmentTypesApi.update(row.ID, mapEmploymentTypeToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID ? mapEmploymentTypeFromApi(updated) : item))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Employment Type status.'))
    }
  }

  return (
    <ListPage title={'Employment Type List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default EmploymentTypeList
