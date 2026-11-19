/** @file Converts Asset Item records between API and form field names. */
const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

function resolveAuditActor(id, directDisplay, lookupMap) {
  if (directDisplay) return String(directDisplay)
  if (id == null || id === '') return ''
  const key = String(id)
  return lookupMap?.get?.(key) || key
}

function formatEmployeeAuditDisplay(code, name) {
  const cleanCode = String(code ?? '').trim()
  const cleanName = String(name ?? '').trim()
  if (cleanCode && cleanName) return `${cleanCode}: ${cleanName}`
  return cleanCode || cleanName || ''
}

export function mapAssetItemFromApi(
  record = {},
  references = {},
  userNames = new Map(),
  employeeNames = new Map(),
  groupMap = new Map(),
  unitMap = new Map(),
) {
  const groupId = text(record.itemGroupId)
  const categoryId = text(record.assetDepriCatId)
  const uomId = text(record.uomId)
  const bgId = text(record.bgId)
  const buId = text(record.buId)
  const group = references.assetGroups?.find((item) => item.ID === groupId)
  const category = references.depreciationCategories?.find((item) => item.ID === categoryId)
  const uom = references.uomOptions?.find((item) => item.value === uomId)

  const createdUserId = text(record.createdUserId ?? record.CREATED_USER_ID ?? record.CREATED_BY)
  const createdEmpId = text(record.createdEmpId ?? record.CREATED_EMP_ID)
  const updatedUserId = text(record.updatedUserId ?? record.UPDATED_USER_ID ?? record.UPDATED_BY)
  const updatedEmpId = text(record.updatedEmpId ?? record.UPDATED_EMP_ID)

  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    record.createdEmployeeCode ?? record.createdEmpCode,
    record.createdEmployeeName ?? record.createdEmpName,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    record.updatedEmployeeCode ?? record.updatedEmpCode,
    record.updatedEmployeeName ?? record.updatedEmpName,
  )

  return {
    ID: text(record.id),
    BG_ID: bgId,
    BU_ID: buId,
    GROUP_NAME: groupMap?.get?.(bgId) || record.groupName || record.GROUP_NAME || '',
    BUSINESS_UNIT: unitMap?.get?.(buId) || record.businessUnit || record.BUSINESS_UNIT || '',
    ITEM_NAME: record.itemName ?? '',
    ITEM_GROUP: groupId,
    ITEM_GROUP_NAME: record.itemGroupName ?? group?.ASSET_GROUP ?? '',
    ASSET_DEPRI_CATE_ID: categoryId,
    DEPRI_CATEGORY_NAME: record.depriCategoryName ?? category?.DEPRI_CATEGORY ?? '',
    CATEGORY_TYPE: record.assetTypeName ?? category?.ASSET_TYPE_NAME ?? '',
    DEPRI_METHOD: record.depriMethodName ?? category?.DEPRI_METHOD_NAME ?? '',
    DEPRI_LIFE: text(record.depriLife ?? category?.DEPRI_LIFE ?? ''),
    DEPRI_PERCENTAGE: text(record.depriPercentage ?? category?.DEPRI_PERCENTAGE ?? ''),
    UOM: uomId,
    UOM_NAME: record.uomName ?? uom?.label ?? '',
    ASSET_OWNER: record.assetOwnerName ?? category?.ASSET_OWNER_NAME ?? group?.ASSET_OWNER_NAME ?? '',
    STATUS: text(record.status ?? 1),
    CREATED_BY: createdUserId,
    CREATED_USER_ID: createdUserId,
    CREATED_USER_NAME: resolveAuditActor(createdUserId, record.createdUserName, userNames),
    CREATED_EMP_ID: createdEmpId,
    CREATED_EMP_NAME: resolveAuditActor(createdEmpId, directCreatedEmpDisplay, employeeNames),
    CREATED_AT: text(record.createdDatetime ?? record.createdAt ?? record.CREATED_AT),
    CREATED_DATETIME: text(record.createdDatetime ?? record.createdAt ?? record.CREATED_AT),
    CREATED_APP: text(record.createdApp ?? record.CREATED_APP ?? ''),
    UPDATED_BY: updatedUserId,
    UPDATED_USER_ID: updatedUserId,
    UPDATED_USER_NAME: resolveAuditActor(updatedUserId, record.updatedUserName, userNames),
    UPDATED_EMP_ID: updatedEmpId,
    UPDATED_EMP_NAME: resolveAuditActor(updatedEmpId, directUpdatedEmpDisplay, employeeNames),
    UPDATED_AT: text(record.updatedDatetime ?? record.updatedAt ?? record.UPDATED_AT),
    UPDATED_DATETIME: text(record.updatedDatetime ?? record.updatedAt ?? record.UPDATED_AT),
    UPDATED_APP: text(record.updatedApp ?? record.UPDATED_APP ?? ''),
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
