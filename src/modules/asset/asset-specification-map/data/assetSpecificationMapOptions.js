/** @file Loads active Asset Item and Specification options for ASSET_ITEM_SPEC. */
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../../asset-lookup-value/api/assetLookupValueApi'

const specificationTypeCodes = new Set(['SPEC', 'ASSET_SPEC', 'ASSET_SPECIFICATION'])

export async function loadAssetSpecificationMapReferences(businessUnitId) {
  const [items, types, values] = await Promise.all([
    assetItemsApi.list(businessUnitId),
    assetLookupTypesApi.list(businessUnitId),
    assetLookupValuesApi.list({ businessUnitId }),
  ])
  const typeCodes = new Map(types.map((type) => [String(type.id), String(type.typeCode ?? '')]))
  const assetItems = items
    .filter((record) => String(record.status ?? 1) === '1')
    .map((record) => ({ ID: String(record.id), ITEM_NAME: record.itemName ?? '' }))
  const specificationOptions = values
    .filter((record) => {
      const code = String(record.typeCode || typeCodes.get(String(record.typeId)) || '').toUpperCase()
      return String(record.status ?? 1) === '1' && specificationTypeCodes.has(code)
    })
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((record) => ({ value: record.value ?? '', label: record.value ?? '' }))

  return { assetItems, specificationOptions }
}
