/** @file Active Asset Item and Specification options for ASSET_ITEM_SPEC. */
import { listAssetItems } from '../../asset-item-information/data/assetItemInformationStore'
import { listAssetLookupValues } from '../../asset-lookup-value/data/assetLookupValueStore'

export function getAssetSpecificationMapReferences() {
  const assetItems = listAssetItems().filter((record) => record.STATUS === '1')
  const specificationOptions = listAssetLookupValues()
    .filter((record) => (
      record.STATUS === '1'
      && record.TYPE_NAME.trim().toLowerCase() === 'asset specification'
    ))
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.VALUE }))

  return { assetItems, specificationOptions }
}
