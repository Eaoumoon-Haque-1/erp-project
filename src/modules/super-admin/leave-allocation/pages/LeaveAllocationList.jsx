/** @file API-backed Leave Allocation list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { employmentTypesApi } from '../../../hris/employment-type/api/employmentTypeApi'
import { leaveTypesApi } from '../../../hris/leave-type/api/leaveTypeApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { leaveAllocationsApi } from '../api/leaveAllocationApi'
import {
  mapLeaveAllocationFromApi,
  mapLeaveAllocationToApi,
} from '../data/leaveAllocationApiMapper'

const basePath = '/hris/leave-settings/leave-allocation'

const columns = [
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'EMPLOYEE_TYPE', label: 'Employee Type' },
  { key: 'LEAVE_CATEGORY', label: 'Leave Category' },
  { key: 'TOTAL_LEAVE_DAYS', label: 'Total Leave Days' },
  { key: 'LEAVE_YEAR', label: 'Year' },
  { key: 'SANDWICH_LEAVE_APPLICABLE', label: 'Sandwich Leave', render: (value) => value === '1' ? 'Yes' : 'No' },
  { key: 'WITH_PAY', label: 'With Pay', render: (value) => value === '1' ? 'Yes' : 'No' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function LeaveAllocationList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({
    businessUnitNames: new Map(),
    employmentTypeNames: new Map(),
    leaveCategoryNames: new Map(),
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      leaveAllocationsApi.list(),
      businessUnitsApi.list(),
      employmentTypesApi.list(),
      leaveTypesApi.list(),
    ])
      .then(([allocations, businessUnits, employmentTypes, leaveTypes]) => {
        if (!active) return
        const labels = {
          businessUnitNames: new Map(businessUnits.map((unit) => [String(unit.id), unit.businessUnit])),
          employmentTypeNames: new Map(employmentTypes.map((type) => [String(type.id), type.typeName])),
          leaveCategoryNames: new Map(leaveTypes.map((type) => [String(type.id), type.typeName])),
        }
        setLookups(labels)
        setRows(allocations.map((record) => mapLeaveAllocationFromApi(record, labels)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Leave Allocations.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BU_ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--', options: [...lookups.businessUnitNames].map(([value, label]) => ({ value, label })) },
    { key: 'EMP_TYPE_ID', label: 'Search by Employee Type', placeholder: '--Search by Employee Type--', options: [...lookups.employmentTypeNames].map(([value, label]) => ({ value, label })) },
    { key: 'LEAVE_CATEGORY_ID', label: 'Search by Leave Category', placeholder: '--Search by Leave Category--', options: [...lookups.leaveCategoryNames].map(([value, label]) => ({ value, label })) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [lookups])

  const handleDelete = async (row) => {
    try {
      await leaveAllocationsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Leave Allocation.'))
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await leaveAllocationsApi.update(
        row.ID,
        mapLeaveAllocationToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) =>
        item.ID === row.ID ? mapLeaveAllocationFromApi(updated, lookups) : item,
      ))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Leave Allocation status.'))
      return false
    }
  }

  return (
    <ListPage
      title={'Leave Allocation List'}
      createLabel={'New'}
      createTo={`${basePath}/create`}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      rowKey={'ID'}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`${basePath}/${row.ID}/view`)}
          onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default LeaveAllocationList
