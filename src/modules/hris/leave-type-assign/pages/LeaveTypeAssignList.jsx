/** @file API-backed Leave Type assignment list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { leaveTypesApi } from '../../leave-type/api/leaveTypeApi'
import { leaveTypeGroupsApi } from '../api/leaveTypeGroupApi'
import { mapLeaveTypeAssignFromApi, mapLeaveTypeAssignToApi } from '../data/leaveTypeAssignApiMapper'

const basePath = '/hris/leave-settings/leave-type-assign'
const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'LEAVE_TYPE_NAME', label: 'Leave Type' },
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function LeaveTypeAssignList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [options, setOptions] = useState({ leaveTypes: [], units: [] })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([leaveTypeGroupsApi.list(), businessGroupsApi.list(), businessUnitsApi.list(), leaveTypesApi.list()])
      .then(([assignments, groups, units, leaveTypes]) => {
        if (!active) return
        const labels = {
          groupNames: new Map(groups.map((row) => [String(row.id), row.groupName])),
          unitNames: new Map(units.map((row) => [String(row.id), row.businessUnit])),
          leaveTypeNames: new Map(leaveTypes.map((row) => [String(row.id), row.typeName])),
        }
        setRows(assignments.map((row) => mapLeaveTypeAssignFromApi(row, labels)))
        setOptions({
          leaveTypes: leaveTypes.map((row) => ({ value: String(row.id), label: row.typeName })),
          units: units.map((row) => ({ value: String(row.id), label: row.businessUnit })),
        })
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Leave Type assignments.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'LEAVE_TYPE_ID', label: 'Search by Leave Type', placeholder: '--Search by Leave Type--', options: options.leaveTypes },
    { key: 'BU_ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--', options: options.units },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [options])

  const handleDelete = async (row) => {
    try {
      await leaveTypeGroupsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Leave Type assignment.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await leaveTypeGroupsApi.update(row.ID, mapLeaveTypeAssignToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? { ...item, ...mapLeaveTypeAssignFromApi(updated), GROUP_NAME: item.GROUP_NAME, BUSINESS_UNIT: item.BUSINESS_UNIT, LEAVE_TYPE_NAME: item.LEAVE_TYPE_NAME }
        : item))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update assignment status.'))
    }
  }

  return (
    <ListPage title={'Leave Type Assign List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default LeaveTypeAssignList
