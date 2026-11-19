/** @file Converts Depreciation Category records between API and form fields. */
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

const ASSET_TYPE_MAP = new Map([
  ['1', 'Transible'],
  ['2', 'Intransible'],
])

function resolveAssetType(raw) {
  if (raw == null || raw === '') return { value: '', label: '' }
  const str = String(raw).trim()
  if (str === '1' || str.toLowerCase() === 'transible') {
    return { value: '1', label: 'Transible' }
  }
  if (str === '2' || str.toLowerCase() === 'intransible') {
    return { value: '2', label: 'Intransible' }
  }
  return { value: str, label: ASSET_TYPE_MAP.get(str) || str }
}

export function mapDepreciationCategoryFromApi(
  record = {},
  references = {},
  userNames = new Map(),
  employeeNames = new Map(),
  groupMap = new Map(),
  unitMap = new Map(),
) {
  const methodId = text(record.depriMethodId)
  const resolvedAssetType = resolveAssetType(record.assetTypeId)
  const assetTypeId = resolvedAssetType.value
  const ownerId = text(record.assetOwnerId)
  const bgId = text(record.bgId)
  const buId = text(record.buId)
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

  const assetTypeName = references.assetTypeOptions?.find((option) => option.value === assetTypeId)?.label ?? resolvedAssetType.label

  return {
    ID: text(record.id),
    BG_ID: bgId,
    BU_ID: buId,
    GROUP_NAME: groupMap?.get?.(bgId) || record.groupName || record.GROUP_NAME || '',
    BUSINESS_UNIT: unitMap?.get?.(buId) || record.businessUnit || record.BUSINESS_UNIT || '',
    DEPRI_CATEGORY: record.depriCategory ?? '',
    DEPRI_METHOD: methodId,
    DEPRI_METHOD_NAME: references.methodOptions?.find((option) => option.value === methodId)?.label ?? '',
    ASSET_TYPE: assetTypeId,
    ASSET_TYPE_NAME: assetTypeName,
    DEPRI_LIFE: text(record.depriLife),
    DEPRI_PERCENTAGE: text(record.depriPercentage),
    ASSET_OWNER: ownerId,
    ASSET_OWNER_NAME: references.departmentOptions?.find((option) => option.value === ownerId)?.label ?? '',
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
