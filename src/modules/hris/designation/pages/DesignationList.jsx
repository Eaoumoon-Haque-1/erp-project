/** @file API-backed Designation list page. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { designationsApi } from '../api/designationApi'
import { mapDesignationFromApi, mapDesignationToApi } from '../data/designationApiMapper'

const basePath = '/hris/employee-settings/designation'

const columns = [
  { key: 'DESIGNATION_NAME', label: 'Designation Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>,
  },
]

const filters = [
  { key: 'DESIGNATION_NAME', label: 'Search by Designation Name', placeholder: '--Search by Designation Name--', matches: (row, value) => row.DESIGNATION_NAME.toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]

function bySortOrder(left, right) {
  const leftOrder = Number(left.SORT_ORDER)
  const rightOrder = Number(right.SORT_ORDER)
  const safeLeftOrder = Number.isFinite(leftOrder) ? leftOrder : Number.POSITIVE_INFINITY
  const safeRightOrder = Number.isFinite(rightOrder) ? rightOrder : Number.POSITIVE_INFINITY

  return safeLeftOrder - safeRightOrder
    || left.DESIGNATION_NAME.localeCompare(right.DESIGNATION_NAME)
}

function DesignationList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionGroupId) return undefined

    let active = true
    designationsApi.list(sessionGroupId)
      .then((designations) => {
        if (!active) return
        setRows(designations.map((designation) => mapDesignationFromApi(designation)).sort(bySortOrder))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Designations.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [sessionGroupId])

  const handleDelete = async (row) => {
    try {
      await designationsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Designation.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await designationsApi.update(row.ID, mapDesignationToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? mapDesignationFromApi(updated, new Map([[row.BG_ID, row.GROUP_NAME]]))
        : item))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Designation status.')
    }
  }

  return (
    <ListPage title={'Designation List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default DesignationList
