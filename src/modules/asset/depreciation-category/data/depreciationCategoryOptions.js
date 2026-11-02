/** @file Builds Depreciation Category dropdowns from active master data. */
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { departmentGroupsApi } from '../../../hris/department-group/api/departmentGroupApi'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../../asset-lookup-value/api/assetLookupValueApi'
function valuesForTypeCodes(lookupValues, typeCodes) {
  const acceptedCodes = new Set(typeCodes.map((code) => code.toUpperCase()))
  return lookupValues
    .filter((record) => (
      record.STATUS === '1'
      && acceptedCodes.has(record.TYPE_CODE.trim().toUpperCase())
    ))
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.VALUE }))
}

export function getDepreciationMethodOptions(lookupValues = []) {
  return valuesForTypeCodes(lookupValues, ['DM', 'DEPRI_METHOD'])
}

export function getAssetTypeOptions(lookupValues = []) {
  return valuesForTypeCodes(lookupValues, ['AT', 'ASSET_TYPE'])
}

export async function loadDepreciationCategoryReferences(businessUnitId, businessGroupId) {
  const [types, values, departments, departmentGroups] = await Promise.all([
    assetLookupTypesApi.list(businessUnitId),
    assetLookupValuesApi.list({ businessUnitId }),
    departmentsApi.listByGroup(businessGroupId),
    departmentGroupsApi.list(),
  ])
  const typeNames = new Map(types.map((type) => [String(type.id), type.typeName]))
  const typeCodes = new Map(types.map((type) => [String(type.id), type.typeCode]))
  const lookupValues = values.map((record) => ({
    ID: String(record.id ?? ''),
    TYPE_NAME: typeNames.get(String(record.typeId)) || '',
    TYPE_CODE: record.typeCode || typeCodes.get(String(record.typeId)) || '',
    VALUE: record.value ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }))

  return {
    methodOptions: getDepreciationMethodOptions(lookupValues),
    assetTypeOptions: getAssetTypeOptions(lookupValues),
    // Asset owners are departments actively mapped to the logged-in BU.
    departmentOptions: departments
      .filter((department) => (
        String(department.status ?? 1) === '1'
        && departmentGroups.some((mapping) => (
          String(mapping.buId) === String(businessUnitId)
          && String(mapping.deptId) === String(department.id)
          && String(mapping.status ?? 1) === '1'
        ))
      ))
      .map((department) => ({ value: String(department.id), label: department.departmentName })),
  }
}

