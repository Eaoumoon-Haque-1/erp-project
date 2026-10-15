/** @file API-backed list of User Types available for Business Unit assignment. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { userTypeGroupsApi } from '../api/userTypeGroupApi'

async function getMappingOrEmpty(userType) {
  try {
    return await userTypeGroupsApi.getByUserType(userType.id)
  } catch (error) {
    if (error?.response?.status === 404) {
      return { userTypeId: userType.id, bgId: userType.bgId, businessUnits: [] }
    }
    throw error
  }
}

const filters = [
  {
    key: 'USER_TYPE_NAME',
    label: 'Search by Type Name',
    placeholder: '--Search by Type Name--',
    matches: (row, value) => row.USER_TYPE_NAME.toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'STATUS',
    label: 'Search by Assignment Status',
    placeholder: '--Search by Status--',
    options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
  },
]

const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'USER_TYPE_NAME', label: 'Type Name' },
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
  {
    key: 'STATUS',
    label: 'Assignment Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function UserTypeGroupList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([userTypesApi.list(), businessGroupsApi.list()])
      .then(async ([types, groups]) => {
        if (!active) return
        const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
        const groupIds = [...new Set(types.map((type) => String(type.bgId)).filter(Boolean))]
        const [unitGroups, mappings] = await Promise.all([
          Promise.all(groupIds.map(async (bgId) => [bgId, await businessUnitsApi.listByGroup(bgId)])),
          Promise.all(types.map(getMappingOrEmpty)),
        ])
        if (!active) return

        const unitNames = new Map(unitGroups.flatMap(([, units]) =>
          units.map((unit) => [String(unit.id), unit.businessUnit])))
        const typeById = new Map(types.map((type) => [String(type.id), type]))
        setRows(mappings.flatMap((mapping) => {
          const type = typeById.get(String(mapping.userTypeId))
          if (!type) return []
          return (mapping.businessUnits || []).map((assignment, index) => ({
            ROW_ID: assignment.id == null
              ? `${type.id}-${assignment.buId}-${index}`
              : `mapping-${assignment.id}`,
            ID: String(type.id),
            BG_ID: String(mapping.bgId ?? type.bgId),
            BU_ID: String(assignment.buId),
            MAPPING_ID: assignment.id ?? null,
            GROUP_NAME: groupNames.get(String(mapping.bgId ?? type.bgId)) || 'N/A',
            USER_TYPE_NAME: type.typeName,
            BUSINESS_UNIT_NAME: unitNames.get(String(assignment.buId)) || `Business Unit #${assignment.buId}`,
            USER_TYPE_STATUS: String(type.status ?? 1),
            STATUS: String(assignment.status ?? 1),
          }))
        }))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load User Types.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleStatusChange = async (row) => {
    try {
      const mapping = await userTypeGroupsApi.getByUserType(row.ID)
      const nextStatus = row.STATUS === '1' ? 0 : 1
      const businessUnits = (mapping.businessUnits || []).map((assignment) => {
        const sameAssignment = row.MAPPING_ID != null && assignment.id != null
          ? String(assignment.id) === String(row.MAPPING_ID)
          : String(assignment.buId) === row.BU_ID
        return {
          id: assignment.id ?? null,
          buId: Number(assignment.buId),
          status: sameAssignment ? nextStatus : Number(assignment.status ?? 1),
        }
      })
      await userTypeGroupsApi.save(row.ID, {
        userTypeId: Number(row.ID),
        bgId: Number(mapping.bgId ?? row.BG_ID),
        businessUnits,
      })
      setRows((current) => current.map((item) => item.ROW_ID === row.ROW_ID
        ? { ...item, STATUS: String(nextStatus) }
        : item))
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Unable to update assignment status.'),
        { cause: error },
      )
    }
  }

  return (
    <ListPage
      title={'User Type Business Unit Assignments'}
      createLabel={'New'}
      createTo={'/super-admin/user-creation/user-type-group/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      rowKey={'ROW_ID'}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          editLabel={'Manage Business Unit assignments'}
          onView={() => navigate(`/super-admin/user-creation/user-type-group/${row.ID}/view`)}
          onEdit={row.USER_TYPE_STATUS === '1'
            ? () => navigate(`/super-admin/user-creation/user-type-group/${row.ID}/edit`)
            : undefined}
          onStatusChange={row.USER_TYPE_STATUS === '1' ? handleStatusChange : undefined}
        />
      )}
    />
  )
}

export default UserTypeGroupList
