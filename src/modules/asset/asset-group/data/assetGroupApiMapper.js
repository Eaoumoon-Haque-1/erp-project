/** @file Converts Asset Group records between API and form field names. */
const text = (value) => value == null ? '' : String(value)
const nullableNumber = (value) => value === '' || value == null ? null : Number(value)

export function mapAssetGroupFromApi(record = {}, departmentNames = new Map()) {
  const ownerId = text(record.assetOwnerId)

  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ASSET_GROUP: record.assetGroup ?? '',
    ASSET_OWNER_ID: ownerId,
    ASSET_OWNER_NAME: record.assetOwnerName ?? departmentNames.get(ownerId) ?? '',
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

export function mapAssetGroupToApi(values, scope = {}) {
  return {
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    assetGroup: values.ASSET_GROUP,
    assetOwnerId: nullableNumber(values.ASSET_OWNER_ID),
    status: Number(values.STATUS),
  }
}
