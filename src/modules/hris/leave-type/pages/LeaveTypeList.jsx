/** @file API-backed Leave Type list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { leaveTypesApi } from '../api/leaveTypeApi'
import { mapLeaveTypeFromApi, mapLeaveTypeToApi } from '../data/leaveTypeApiMapper'

const basePath = '/hris/leave-settings/leave-type'
const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'TYPE_NAME', label: 'Type Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function LeaveTypeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([leaveTypesApi.list(), businessGroupsApi.list()])
      .then(([leaveTypes, groups]) => {
        if (!active) return
        const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
        setRows(leaveTypes.map((record) => mapLeaveTypeFromApi(record, groupNames)))
        setGroupOptions(groups.map((group) => ({ value: String(group.id), label: group.groupName })))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Leave Types.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BG_ID', label: 'Search by Group Name', placeholder: '--Search by Group Name--', options: groupOptions },
    { key: 'TYPE_NAME', label: 'Search by Type Name', placeholder: '--Search by Type Name--', matches: (row, value) => String(row.TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [groupOptions])

  const handleDelete = async (row) => {
    try {
      await leaveTypesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Leave Type.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await leaveTypesApi.update(row.ID, mapLeaveTypeToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? mapLeaveTypeFromApi(updated, new Map([[row.BG_ID, row.GROUP_NAME]]))
        : item))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Leave Type status.'))
    }
  }

  return (
    <ListPage title={'Leave Type List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default LeaveTypeList
