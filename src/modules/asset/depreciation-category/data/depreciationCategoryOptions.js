/** @file Builds Depreciation Category dropdowns from active master data. */
import { afmLookupData } from '../../../../config/afmLookupData'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { departmentGroupsApi } from '../../../hris/department-group/api/departmentGroupApi'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../../asset-lookup-value/api/assetLookupValueApi'

export const ASSET_TYPE_OPTIONS = [
  { value: '1', label: 'Transible' },
  { value: '2', label: 'Intransible' },
]

export function getAssetTypeOptions() {
  return ASSET_TYPE_OPTIONS
}

export async function getDepreciationMethodOptions(businessUnitId) {
  if (!businessUnitId) return []
  const targetCode = String(afmLookupData?.depreciationMethod || 'DM001').trim().toUpperCase()

  // 1. Fetch lookup types for the logged-in user's business unit only
  const types = await assetLookupTypesApi.list(businessUnitId).catch(() => [])

  // 2. Find the lookup type matching the parameter (DM001) for this BU
  const targetType = (types || []).find((t) => (
    String(t.buId) === String(businessUnitId)
    && (
      String(t.typeCode || '').trim().toUpperCase() === targetCode
      || String(t.typeName || '').trim().toLowerCase() === 'depreciation method'
    )
    && Number(t.status) === 1
  ))

  if (!targetType?.id) return []

  // 3. Fetch lookup values from LookupValue for this BU and targetType.id
  let rawValues = []
  try {
    rawValues = await assetLookupValuesApi.list({
      businessUnitId,
      typeId: targetType.id,
    })
  } catch {
    rawValues = targetType.lookupValues || []
  }

  if (!rawValues || rawValues.length === 0) {
    rawValues = targetType.lookupValues || []
  }

  // 4. Ensure values strictly belong to the logged-in BU and are active
  return (rawValues || [])
    .filter((v) => (
      String(v.status ?? 1) === '1'
      && (v.buId == null || String(v.buId) === String(businessUnitId))
    ))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((v) => ({
      value: String(v.id),
      label: v.valueCode ? `${v.value} (${v.valueCode})` : v.value,
      name: v.value,
      code: v.valueCode,
    }))
}

export async function loadDepreciationCategoryReferences(businessUnitId, businessGroupId) {
  const [methodOptions, departments, departmentGroups] = await Promise.all([
    getDepreciationMethodOptions(businessUnitId),
    departmentsApi.listByGroup(businessGroupId).catch(() => []),
    departmentGroupsApi.list().catch(() => []),
  ])

  return {
    methodOptions,
    assetTypeOptions: ASSET_TYPE_OPTIONS,
    // Asset owners are departments actively mapped to the logged-in BU.
    departmentOptions: (departments || [])
      .filter((department) => (
        String(department.status ?? 1) === '1'
        && (departmentGroups || []).some((mapping) => (
          String(mapping.buId) === String(businessUnitId)
          && String(mapping.deptId) === String(department.id)
          && String(mapping.status ?? 1) === '1'
        ))
      ))
      .map((department) => ({ value: String(department.id), label: department.departmentName })),
  }
}

