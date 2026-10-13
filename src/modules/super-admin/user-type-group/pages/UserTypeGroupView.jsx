/** @file Standard read-only view for one User Type's Business Unit assignments. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { userTypeGroupsApi } from '../api/userTypeGroupApi'

const listPath = '/super-admin/user-creation/user-type-group'

async function getMappingOrEmpty(userTypeId, bgId) {
  try {
    return await userTypeGroupsApi.getByUserType(userTypeId)
  } catch (error) {
    if (error?.response?.status === 404) {
      return { userTypeId: Number(userTypeId), bgId: Number(bgId), businessUnits: [] }
    }
    throw error
  }
}

const viewConfig = {
  title: 'User Type Business Unit Assignment View',
  param: 'userTypeGroupId',
  listTo: listPath,
  editTo: (id, record) => String(record.status ?? 1) === '1'
    ? `/super-admin/user-creation/user-type-group/${id}/edit`
    : null,
  loader: async (id) => {
    const [userType, groups] = await Promise.all([
      userTypesApi.get(id),
      businessGroupsApi.list(),
    ])
    const [units, mapping] = await Promise.all([
      businessUnitsApi.listByGroup(userType.bgId),
      getMappingOrEmpty(id, userType.bgId),
    ])
    const unitNames = new Map(units.map((unit) => [String(unit.id), unit.businessUnit]))
    const assignments = (mapping.businessUnits || []).map((row) => {
      const name = unitNames.get(String(row.buId)) || `Business Unit #${row.buId}`
      return `${name} (${String(row.status ?? 1) === '1' ? 'Active' : 'Inactive'})`
    })

    return {
      ...userType,
      groupName: groups.find((group) => String(group.id) === String(userType.bgId))?.groupName,
      assignmentCount: assignments.length,
      assignedBusinessUnits: assignments.join(', ') || 'None assigned',
    }
  },
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Type Name', key: 'typeName' },
    { label: 'User Type Status', key: 'status', type: 'status' },
    { label: 'Assigned Business Unit Count', key: 'assignmentCount' },
    { label: 'Business Unit Details', key: 'assignedBusinessUnits', wide: true },
  ],
}

function UserTypeGroupView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default UserTypeGroupView
