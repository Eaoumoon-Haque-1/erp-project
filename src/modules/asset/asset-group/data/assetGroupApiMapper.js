/** @file Converts Asset Group records between API and form field names. */
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

export function mapAssetGroupFromApi(
  record = {},
  departmentNames = new Map(),
  userNames = new Map(),
  employeeNames = new Map(),
) {
  const ownerId = text(record.assetOwnerId)
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
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ASSET_GROUP: record.assetGroup ?? '',
    ASSET_OWNER_ID: ownerId,
    ASSET_OWNER_NAME: record.assetOwnerName ?? departmentNames.get(ownerId) ?? '',
    STATUS: text(record.status ?? 1),
    CREATED_USER_ID: createdUserId,
    CREATED_USER_NAME: resolveAuditActor(createdUserId, record.createdUserName, userNames),
    CREATED_EMP_ID: createdEmpId,
    CREATED_EMP_NAME: resolveAuditActor(createdEmpId, directCreatedEmpDisplay, employeeNames),
    CREATED_DATETIME: text(record.createdDatetime ?? record.createdAt ?? record.CREATED_AT),
    CREATED_APP: record.createdApp ?? record.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId,
    UPDATED_USER_NAME: resolveAuditActor(updatedUserId, record.updatedUserName, userNames),
    UPDATED_EMP_ID: updatedEmpId,
    UPDATED_EMP_NAME: resolveAuditActor(updatedEmpId, directUpdatedEmpDisplay, employeeNames),
    UPDATED_DATETIME: text(record.updatedDatetime ?? record.updatedAt ?? record.UPDATED_AT),
    UPDATED_APP: record.updatedApp ?? record.UPDATED_APP ?? '',
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
