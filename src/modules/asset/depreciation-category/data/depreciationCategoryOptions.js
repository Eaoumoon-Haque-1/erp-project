/** @file Builds Depreciation Category dropdowns from active master data. */
import { listAssetLookupValues } from '../../asset-lookup-value/data/assetLookupValueStore'

function valuesForType(typeName) {
  return listAssetLookupValues()
    .filter((record) => (
      record.STATUS === '1'
      && record.TYPE_NAME.trim().toLowerCase() === typeName.toLowerCase()
    ))
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.VALUE }))
}

export function getDepreciationMethodOptions() {
  return valuesForType('Depreciation Method')
}

export function getAssetTypeOptions() {
  return valuesForType('Asset Type')
}

