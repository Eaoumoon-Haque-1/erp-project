/** @file Converts Depreciation Category records between API and form fields. */
const text = (value) => value == null ? '' : String(value)
const nullableNumber = (value) => value === '' || value == null ? null : Number(value)

export function mapDepreciationCategoryFromApi(record = {}, references = {}) {
  const methodId = text(record.depriMethodId)
  const assetTypeId = text(record.assetTypeId)
  const ownerId = text(record.assetOwnerId)

  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    DEPRI_CATEGORY: record.depriCategory ?? '',
    DEPRI_METHOD: methodId,
    DEPRI_METHOD_NAME: references.methodOptions?.find((option) => option.value === methodId)?.label ?? '',
    ASSET_TYPE: assetTypeId,
    ASSET_TYPE_NAME: references.assetTypeOptions?.find((option) => option.value === assetTypeId)?.label ?? '',
    DEPRI_LIFE: text(record.depriLife),
    DEPRI_PERCENTAGE: text(record.depriPercentage),
    ASSET_OWNER: ownerId,
    ASSET_OWNER_NAME: references.departmentOptions?.find((option) => option.value === ownerId)?.label ?? '',
    STATUS: text(record.status ?? 1),
    CREATED_BY: text(record.createdUserId),
    CREATED_EMP_ID: text(record.createdEmpId),
    CREATED_AT: text(record.createdDatetime),
    CREATED_APP: text(record.createdApp),
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_EMP_ID: text(record.updatedEmpId),
    UPDATED_AT: text(record.updatedDatetime),
    UPDATED_APP: text(record.updatedApp),
  }
}

export function mapDepreciationCategoryToApi(values, scope = {}) {
  return {
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    depriCategory: values.DEPRI_CATEGORY,
    depriMethodId: nullableNumber(values.DEPRI_METHOD),
    assetTypeId: nullableNumber(values.ASSET_TYPE),
    depriLife: nullableNumber(values.DEPRI_LIFE),
    depriPercentage: nullableNumber(values.DEPRI_PERCENTAGE),
    assetOwnerId: nullableNumber(values.ASSET_OWNER),
    status: Number(values.STATUS),
  }
}
