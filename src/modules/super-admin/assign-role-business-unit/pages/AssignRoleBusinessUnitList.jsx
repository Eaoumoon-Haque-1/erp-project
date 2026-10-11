/** @file API-backed Business Unit role mapping list. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { businessUnitRolesApi } from '../api/businessUnitRoleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'ROLE_NAMES', label: 'Assigned Roles' },
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

function AssignRoleBusinessUnitList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const [unitOptions, setUnitOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const filters = useMemo(() => [
    { key: 'BG_ID', label: 'Search by Group Name', placeholder: '--Search by Group Name--', options: groupOptions },
    { key: 'ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--', options: unitOptions },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [groupOptions, unitOptions])

  useEffect(() => {
    let active = true
    Promise.all([businessUnitsApi.list(), businessGroupsApi.list()])
      .then(async ([units, groups]) => {
        const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
        const mappings = await Promise.all(
          units.map((unit) => businessUnitRolesApi.list(unit.id)),
        )
        if (!active) return
        setGroupOptions(groups.map((group) => ({ value: String(group.id), label: group.groupName })))
        setUnitOptions(units.map((unit) => ({ value: String(unit.id), label: unit.businessUnit })))
        setRows(units.map((unit, index) => ({
          ID: String(unit.id),
          BG_ID: String(unit.bgId),
          GROUP_NAME: groupNames.get(String(unit.bgId)) || String(unit.bgId),
          BUSINESS_UNIT: unit.businessUnit,
          ROLE_NAMES: (mappings[index].assignedRoles || []).map((role) => role.roleName).join(', ') || 'Not assigned',
          STATUS: String(unit.status ?? 1),
        })))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Business Unit role mappings.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <ListPage
      title={'Assign Role to Business Unit List'}
      createLabel={'New'}
      createTo={'/super-admin/role-creation/assign-role-business-unit/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() =>
            navigate(`/super-admin/role-creation/assign-role-business-unit/create?buId=${row.ID}`)
          }
        />
      )}
    />
  )
}

export default AssignRoleBusinessUnitList
