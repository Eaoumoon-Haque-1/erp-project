/** @file Loads and filters User Types using their Business Unit assignments. */
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { userTypeGroupsApi } from '../../user-type-group/api/userTypeGroupApi'

async function getMappingOrEmpty(userType) {
  try {
    return await userTypeGroupsApi.getByUserType(userType.id)
  } catch (error) {
    if (error?.response?.status === 404) {
      return { userTypeId: userType.id, businessUnits: [] }
    }
    throw error
  }
}

export async function loadUserTypeBusinessUnitOptions() {
  const userTypes = await userTypesApi.list()
  const mappings = await Promise.all(userTypes.map(getMappingOrEmpty))
  const mappingByTypeId = new Map(
    mappings.map((mapping) => [String(mapping.userTypeId), mapping]),
  )

  return userTypes
    .filter((userType) => String(userType.status ?? 1) === '1')
    .map((userType) => ({
      value: String(userType.id),
      label: userType.typeName,
      businessUnitIds: (mappingByTypeId.get(String(userType.id))?.businessUnits || [])
        .filter((assignment) => String(assignment.status ?? 1) === '1')
        .map((assignment) => String(assignment.buId)),
    }))
}

export function filterUserTypesByBusinessUnit(options, businessUnitId) {
  if (!businessUnitId) return []
  return options.filter((option) => option.businessUnitIds.includes(String(businessUnitId)))
}

export function isUserTypeAvailableForBusinessUnit(options, userTypeId, businessUnitId) {
  if (!userTypeId || !businessUnitId) return false
  return options.some((option) => (
    option.value === String(userTypeId)
    && option.businessUnitIds.includes(String(businessUnitId))
  ))
}
