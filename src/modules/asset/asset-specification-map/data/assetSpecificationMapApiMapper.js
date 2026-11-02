/** @file Converts Asset Item Specification records between API and form fields. */
const text = (value) => value == null ? '' : String(value)
const nullableNumber = (value) => value === '' || value == null ? null : Number(value)

export function mapAssetSpecificationMapFromApi(record = {}, references = {}) {
  const itemId = text(record.itemNameId)
  const specificationName = record.specName ?? ''
  const item = references.assetItems?.find((option) => option.ID === itemId)

  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ITEM_NAME: itemId,
    ITEM_NAME_LABEL: record.itemName ?? item?.ITEM_NAME ?? '',
    SPECIFICATION: specificationName,
    SPECIFICATION_NAME: specificationName,
    SORT_ORDER: text(record.sortOrder),
    STATUS: text(record.status ?? 1),
    CREATED_BY: text(record.createdUserId),
    CREATED_EMP_ID: text(record.createdEmpId),
    CREATED_AT: text(record.createdDatetime),
    CREATED_APP: record.createdApp ?? '',
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_EMP_ID: text(record.updatedEmpId),
    UPDATED_AT: text(record.updatedDatetime),
    UPDATED_APP: record.updatedApp ?? '',
  }
}

export function mapAssetSpecificationMapToApi(values, scope = {}) {
  return {
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    itemNameId: nullableNumber(values.ITEM_NAME),
    specName: values.SPECIFICATION_NAME || values.SPECIFICATION,
    sortOrder: nullableNumber(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
