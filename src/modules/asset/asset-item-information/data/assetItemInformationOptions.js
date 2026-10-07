/** @file Active master options and dependent-field derivation for ASSET_ITEM. */
import { listAssetGroups } from '../../asset-group/data/assetGroupStore'
import { listAssetLookupValues } from '../../asset-lookup-value/data/assetLookupValueStore'
import { listDepreciationCategories } from '../../depreciation-category/data/depreciationCategoryStore'

export function getAssetItemReferences() {
  const assetGroups = listAssetGroups().filter((record) => record.STATUS === '1')
  const depreciationCategories = listDepreciationCategories()
    .filter((record) => record.STATUS === '1')
  const uomOptions = listAssetLookupValues()
    .filter((record) => (
      record.STATUS === '1'
      && record.TYPE_NAME.trim().toLowerCase() === 'uom'
    ))
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.VALUE }))

  return { assetGroups, depreciationCategories, uomOptions }
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
