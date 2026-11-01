/** @file API-backed Asset Item references and dependent-field derivation. */
import { assetUomsApi, depriCategoriesApi, lookupValuesApi } from '../../../../api/assetReferences'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { assetGroupsApi } from '../../asset-group/api/assetGroupApi'
import { mapAssetGroupFromApi } from '../../asset-group/data/assetGroupApiMapper'

export function getAssetItemReferences({
  assetGroupRecords = [],
  categoryRecords = [],
  uomRecords = [],
  lookupValueRecords = [],
  departmentRecords = [],
} = {}) {
  const lookupNames = new Map(lookupValueRecords.map((record) => [
    String(record.id),
    record.value ?? record.lookupValue ?? record.valueName ?? record.name ?? '',
  ]))
  const departmentNames = new Map(departmentRecords.map((record) => [
    String(record.id),
    record.departmentName ?? '',
  ]))
  const assetGroups = assetGroupRecords
    .map((record) => mapAssetGroupFromApi(record, departmentNames))
    .filter((record) => record.STATUS === '1')
  const depreciationCategories = categoryRecords
    .filter((record) => String(record.status ?? 1) === '1')
    .map((record) => ({
      ID: String(record.id ?? ''),
      DEPRI_CATEGORY: record.depriCategory ?? '',
      DEPRI_METHOD: String(record.depriMethodId ?? ''),
      DEPRI_METHOD_NAME: lookupNames.get(String(record.depriMethodId)) || '',
      ASSET_TYPE: String(record.assetTypeId ?? ''),
      ASSET_TYPE_NAME: lookupNames.get(String(record.assetTypeId)) || '',
      DEPRI_LIFE: record.depriLife == null ? '' : String(record.depriLife),
      DEPRI_PERCENTAGE: record.depriPercentage == null ? '' : String(record.depriPercentage),
      ASSET_OWNER: String(record.assetOwnerId ?? ''),
      ASSET_OWNER_NAME: departmentNames.get(String(record.assetOwnerId)) || '',
      STATUS: String(record.status ?? 1),
    }))
  const uomOptions = uomRecords
    .filter((record) => String(record.status ?? 1) === '1')
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((record) => ({ value: String(record.id), label: record.unitName ?? '' }))

  return { assetGroups, depreciationCategories, uomOptions }
}

export async function loadAssetItemReferences(businessUnitId, businessGroupId) {
  const [assetGroupRecords, categoryRecords, uomRecords, lookupValueRecords, departmentRecords] = await Promise.all([
    assetGroupsApi.list(businessUnitId),
    depriCategoriesApi.list(businessUnitId),
    assetUomsApi.list(businessUnitId),
    lookupValuesApi.list(businessUnitId),
    departmentsApi.listByGroup(businessGroupId),
  ])

  return getAssetItemReferences({
    assetGroupRecords,
    categoryRecords,
    uomRecords,
    lookupValueRecords,
    departmentRecords,
  })
}

export function deriveAssetItemFields(name, value, current, references) {
  const { assetGroups, depreciationCategories, uomOptions } = references

  if (name === 'ITEM_GROUP') {
    const group = assetGroups.find((record) => record.ID === value)
    const category = depreciationCategories.find(
      (record) => record.ID === current.ASSET_DEPRI_CATE_ID,
    )
    return {
      ITEM_GROUP: value,
      ITEM_GROUP_NAME: group?.ASSET_GROUP || '',
      ASSET_OWNER: category?.ASSET_OWNER_NAME || group?.ASSET_OWNER_NAME || '',
    }
  }

  if (name === 'ASSET_DEPRI_CATE_ID') {
    const category = depreciationCategories.find((record) => record.ID === value)
    const group = assetGroups.find((record) => record.ID === current.ITEM_GROUP)
    return {
      ASSET_DEPRI_CATE_ID: value,
      DEPRI_CATEGORY_NAME: category?.DEPRI_CATEGORY || '',
      CATEGORY_TYPE: category?.ASSET_TYPE_NAME || '',
      DEPRI_METHOD: category?.DEPRI_METHOD_NAME || '',
      DEPRI_LIFE: category?.DEPRI_LIFE || '',
      DEPRI_PERCENTAGE: category?.DEPRI_PERCENTAGE || '',
      ASSET_OWNER: category?.ASSET_OWNER_NAME || group?.ASSET_OWNER_NAME || '',
    }
  }

  if (name === 'UOM') {
    return {
      UOM: value,
      UOM_NAME: uomOptions.find((option) => option.value === value)?.label || '',
    }
  }

  return { [name]: value }
}
