/** @file Loads active Asset Item and Specification options for ASSET_ITEM_SPEC. */
import { afmLookupData } from '../../../../config/afmLookupData'
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../../asset-lookup-value/api/assetLookupValueApi'

export async function loadAssetSpecificationMapReferences(businessUnitId) {
  const targetCode = String(afmLookupData?.assetSpecification || 'AS001').trim().toUpperCase()

  const [items, typesRes] = await Promise.all([
    assetItemsApi.list(businessUnitId).catch(() => []),
    assetLookupTypesApi.list(businessUnitId).catch(() => []),
  ])

  let types = Array.isArray(typesRes) ? typesRes : []
  let targetType = types.find(
    (t) => String(t.typeCode ?? t.code ?? '').trim().toUpperCase() === targetCode,
  )

  // If not found in current BU, try fetching all types without BU filter
  if (!targetType) {
    const globalTypes = await assetLookupTypesApi.list().catch(() => [])
    types = Array.isArray(globalTypes) ? globalTypes : []
    targetType = types.find(
      (t) => String(t.typeCode ?? t.code ?? '').trim().toUpperCase() === targetCode,
    )
  }

  const typeNameId = targetType?.id != null ? String(targetType.id) : null

  let rawValues = []
  if (typeNameId) {
    try {
      rawValues = await assetLookupValuesApi.list({
        businessUnitId,
        typeId: typeNameId,
      })
    } catch {
      rawValues = []
    }

    if (!rawValues || rawValues.length === 0) {
      try {
        rawValues = await assetLookupValuesApi.getByType(typeNameId)
      } catch {
        rawValues = []
      }
    }

    if (!rawValues || rawValues.length === 0) {
      rawValues = targetType.lookupValues || []
    }
  }

  const assetItems = (items || [])
    .filter((record) => String(record.status ?? 1) === '1')
    .map((record) => ({ ID: String(record.id), ITEM_NAME: record.itemName ?? '' }))

  const specificationOptions = (rawValues || [])
    .filter((v) => {
      const vTypeId = String(v.typeId ?? v.typeNameId ?? v.TYPE_ID ?? '')
      const matchType = !vTypeId || !typeNameId || vTypeId === typeNameId
      const active = v.status === undefined || v.status === null || String(v.status) === '1'
      return matchType && active
    })
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((v) => {
      const val = v.value ?? v.meaning ?? v.valueCode ?? String(v.id)
      return {
        value: val,
        label: val,
      }
    })

  return { assetItems, specificationOptions }
}
