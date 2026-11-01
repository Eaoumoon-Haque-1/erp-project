/** @file Converts Asset Item records between API and form field names. */
const text = (value) => value == null ? '' : String(value)
const nullableNumber = (value) => value === '' || value == null ? null : Number(value)

export function mapAssetItemFromApi(record = {}, references = {}) {
  const groupId = text(record.itemGroupId)
  const categoryId = text(record.assetDepriCatId)
  const uomId = text(record.uomId)
  const group = references.assetGroups?.find((item) => item.ID === groupId)
  const category = references.depreciationCategories?.find((item) => item.ID === categoryId)
  const uom = references.uomOptions?.find((item) => item.value === uomId)

  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ITEM_NAME: record.itemName ?? '',
    ITEM_GROUP: groupId,
    ITEM_GROUP_NAME: group?.ASSET_GROUP ?? '',
    ASSET_DEPRI_CATE_ID: categoryId,
    DEPRI_CATEGORY_NAME: category?.DEPRI_CATEGORY ?? '',
    CATEGORY_TYPE: category?.ASSET_TYPE_NAME ?? '',
    DEPRI_METHOD: category?.DEPRI_METHOD_NAME ?? '',
    DEPRI_LIFE: category?.DEPRI_LIFE ?? '',
    DEPRI_PERCENTAGE: category?.DEPRI_PERCENTAGE ?? '',
    UOM: uomId,
    UOM_NAME: uom?.label ?? '',
    ASSET_OWNER: category?.ASSET_OWNER_NAME ?? group?.ASSET_OWNER_NAME ?? '',
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

export function mapAssetItemToApi(values, scope = {}) {
  return {
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    itemName: values.ITEM_NAME,
    itemGroupId: nullableNumber(values.ITEM_GROUP),
    assetDepriCatId: nullableNumber(values.ASSET_DEPRI_CATE_ID),
    uomId: nullableNumber(values.UOM),
    status: Number(values.STATUS),
  }
}
