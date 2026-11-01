/** @file Builds Depreciation Category dropdowns from active master data. */
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../../asset-lookup-value/api/assetLookupValueApi'
function valuesForType(lookupValues, typeName) {
  return lookupValues
    .filter((record) => (
      record.STATUS === '1'
      && record.TYPE_NAME.trim().toLowerCase() === typeName.toLowerCase()
    ))
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.VALUE }))
}

export function getDepreciationMethodOptions(lookupValues = []) {
  return valuesForType(lookupValues, 'Depreciation Method')
}

export function getAssetTypeOptions(lookupValues = []) {
  return valuesForType(lookupValues, 'Asset Type')
}

export async function loadDepreciationCategoryReferences(businessUnitId, businessGroupId) {
  const [types, values, departments] = await Promise.all([
    assetLookupTypesApi.list(businessUnitId),
    assetLookupValuesApi.list({ businessUnitId }),
    departmentsApi.listByGroup(businessGroupId),
  ])
  const typeNames = new Map(types.map((type) => [String(type.id), type.typeName]))
  const lookupValues = values.map((record) => ({
    ID: String(record.id ?? ''),
    TYPE_NAME: typeNames.get(String(record.typeId)) || '',
    VALUE: record.value ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }))

  return {
    methodOptions: getDepreciationMethodOptions(lookupValues),
    assetTypeOptions: getAssetTypeOptions(lookupValues),
    departmentOptions: departments
      .filter((department) => String(department.status ?? 1) === '1')
      .map((department) => ({ value: String(department.id), label: department.departmentName })),
  }
}

