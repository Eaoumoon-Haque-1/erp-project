/** @file Converts Asset Item Specification records between API and form fields. */
const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapAssetSpecificationMapFromApi(
  record = {},
  references = {},
  userMap = new Map(),
  empMap = new Map(),
) {
  const itemId = text(record.itemNameId ?? record.ITEM_NAME_ID)
  const specificationName = record.specName ?? record.SPEC_NAME ?? ''
  const item = references.assetItems?.find((option) => option.ID === itemId)

  const createdUserId = text(record.createdUserId ?? record.CREATED_USER_ID)
  const createdEmpId = text(record.createdEmpId ?? record.CREATED_EMP_ID)
  const updatedUserId = text(record.updatedUserId ?? record.UPDATED_USER_ID)
  const updatedEmpId = text(record.updatedEmpId ?? record.UPDATED_EMP_ID)

  return {
    ID: text(record.id ?? record.ID),
    BG_ID: text(record.bgId ?? record.BG_ID),
    BU_ID: text(record.buId ?? record.BU_ID),
    ITEM_NAME: itemId,
    ITEM_NAME_LABEL: record.itemName ?? record.ITEM_NAME ?? item?.ITEM_NAME ?? '',
    SPECIFICATION: specificationName,
    SPECIFICATION_NAME: specificationName,
    SORT_ORDER: text(record.sortOrder ?? record.SORT_ORDER ?? '1'),
    STATUS: text(record.status ?? record.STATUS ?? 1),
    CREATED_USER_ID: createdUserId,
    CREATED_USER_NAME:
      userMap.get(createdUserId) || record.createdUserName || record.CREATED_USER_NAME || '',
    CREATED_EMP_ID: createdEmpId,
    CREATED_EMP_NAME:
      empMap.get(createdEmpId) || record.createdEmpName || record.CREATED_EMP_NAME || '',
    CREATED_DATETIME: text(record.createdDatetime ?? record.CREATED_DATETIME),
    CREATED_APP: record.createdApp ?? record.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId,
    UPDATED_USER_NAME:
      userMap.get(updatedUserId) || record.updatedUserName || record.UPDATED_USER_NAME || '',
    UPDATED_EMP_ID: updatedEmpId,
    UPDATED_EMP_NAME:
      empMap.get(updatedEmpId) || record.updatedEmpName || record.UPDATED_EMP_NAME || '',
    UPDATED_DATETIME: text(record.updatedDatetime ?? record.UPDATED_DATETIME),
    UPDATED_APP: record.updatedApp ?? record.UPDATED_APP ?? '',
    // backward compatibility:
    CREATED_BY: createdUserId,
    CREATED_AT: text(record.createdDatetime ?? record.CREATED_DATETIME),
    UPDATED_BY: updatedUserId,
    UPDATED_AT: text(record.updatedDatetime ?? record.UPDATED_DATETIME),
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
