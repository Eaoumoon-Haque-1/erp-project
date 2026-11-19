/**
 * @file Inbound and outbound data mappers between Asset Lookup Type API and UI state.
 */
import { createInitialAssetLookupValueRow } from '../validation/assetLookupTypeValidation'

/**
 * Maps a single detail lookup value from backend DTO to form state.
 * @param {object} detail Backend LookupValueRowDto
 * @param {number} [fallbackIndex=1] Default row position index
 */
export function mapAssetLookupValueFromApi(detail = {}, fallbackIndex = 1) {
  return createInitialAssetLookupValueRow(
    {
      _ROW_ID: detail.id
        ? `detail_${detail.id}`
        : `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ID: detail.id != null ? String(detail.id) : '',
      VALUE: detail.value ?? '',
      VALUE_CODE: detail.valueCode ?? '',
      NOTE: detail.note ?? detail.NOTE ?? '',
      SORT_ORDER:
        detail.sortOrder != null
          ? String(detail.sortOrder)
          : String(fallbackIndex),
      STATUS: String(detail.status ?? 1),
      IN_USE: Boolean(detail.inUse ?? detail.IN_USE ?? false),
    },
    fallbackIndex,
  )
}

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

/**
 * Maps a master asset_lookup_type record and its values from API to UI representation.
 * @param {object} record Backend LookupTypeResponseDto
 * @param {Map<string, string>} [groupNames=new Map()] Business Group name map
 * @param {Map<string, string>} [unitNames=new Map()] Business Unit name map
 * @param {Map<string, string>} [userNames=new Map()] Admin User user_name map
 * @param {Map<string, string>} [employeeNames=new Map()] HR Employee "employee_code: employee_name" map
 */
export function mapAssetLookupTypeFromApi(
  record = {},
  groupNames = new Map(),
  unitNames = new Map(),
  userNames = new Map(),
  employeeNames = new Map(),
) {
  const details = Array.isArray(record.lookupValues)
    ? record.lookupValues.map((v, i) => mapAssetLookupValueFromApi(v, i + 1))
    : []

  const createdUserId =
    record.createdUserId ??
    record.createdByUserId ??
    record.CREATED_USER_ID ??
    ''
  const createdEmpId =
    record.createdEmpId ??
    record.createdEmployeeId ??
    record.CREATED_EMP_ID ??
    ''
  const updatedUserId =
    record.updatedUserId ??
    record.updatedByUserId ??
    record.UPDATED_USER_ID ??
    ''
  const updatedEmpId =
    record.updatedEmpId ??
    record.updatedEmployeeId ??
    record.UPDATED_EMP_ID ??
    ''

  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    record.createdEmployeeCode ?? record.createdEmpCode ?? record.CREATED_EMPLOYEE_CODE,
    record.createdEmployeeName ?? record.createdEmpName ?? record.CREATED_EMPLOYEE_NAME,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    record.updatedEmployeeCode ?? record.updatedEmpCode ?? record.UPDATED_EMPLOYEE_CODE,
    record.updatedEmployeeName ?? record.updatedEmpName ?? record.UPDATED_EMPLOYEE_NAME,
  )

  const typeCode = record.typeCode ?? record.code ?? record.TYPE_CODE ?? record.CODE ?? ''

  return {
    ID: record.id != null ? String(record.id) : '',
    BG_ID: record.bgId != null ? String(record.bgId) : '',
    BU_ID: record.buId != null ? String(record.buId) : '',
    GROUP_NAME: record.groupName || groupNames.get(String(record.bgId)) || '',
    BUSINESS_UNIT: record.businessUnitName || unitNames.get(String(record.buId)) || '',
    TYPE_NAME: record.typeName ?? record.TYPE_NAME ?? '',
    TYPE_CODE: typeCode,
    CODE: typeCode,
    STATUS: String(record.status ?? 1),
    LOOKUP_VALUES: details,
    VALUE_COUNT: details.length,
    ACTIVE_VALUE_COUNT: details.filter((d) => String(d.STATUS) === '1').length,
    HAS_IN_USE_VALUES: details.some((d) => Boolean(d.IN_USE)),
    CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
    CREATED_USER_NAME: resolveAuditActor(
      createdUserId,
      record.createdUserName ?? record.createdByUserName ?? record.CREATED_USER_NAME,
      userNames,
    ),
    CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
    CREATED_EMP_NAME: resolveAuditActor(
      createdEmpId,
      directCreatedEmpDisplay,
      employeeNames,
    ),
    CREATED_DATETIME:
      record.createdDatetime ??
      record.createdDateTime ??
      record.createdAt ??
      record.CREATED_DATETIME ??
      '',
    CREATED_APP:
      record.createdApp ?? record.createdFrom ?? record.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
    UPDATED_USER_NAME: resolveAuditActor(
      updatedUserId,
      record.updatedUserName ?? record.updatedByUserName ?? record.UPDATED_USER_NAME,
      userNames,
    ),
    UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
    UPDATED_EMP_NAME: resolveAuditActor(
      updatedEmpId,
      directUpdatedEmpDisplay,
      employeeNames,
    ),
    UPDATED_DATETIME:
      record.updatedDatetime ??
      record.updatedDateTime ??
      record.updatedAt ??
      record.UPDATED_DATETIME ??
      '',
    UPDATED_APP:
      record.updatedApp ?? record.updatedFrom ?? record.UPDATED_APP ?? '',
  }
}

/**
 * Maps UI form state to backend LookupTypeRequestDto.
 * @param {object} values Master form fields
 * @param {Array} rows Repeatable lookup value rows
 * @param {object} [sessionParents={}] Optional bgId / buId fallback
 */
export function mapAssetLookupTypeToApi(values = {}, rows = [], sessionParents = {}) {
  const bgId = values.BG_ID || sessionParents.bgId
  const buId = values.BU_ID || sessionParents.buId
  const normalizedTypeCode = String(values.TYPE_CODE || values.CODE || '').trim().toUpperCase() || null

  const rowList = Array.isArray(rows) ? rows : []

  return {
    bgId: bgId ? Number(bgId) : null,
    buId: buId ? Number(buId) : null,
    typeName: String(values.TYPE_NAME ?? '').trim(),
    typeCode: normalizedTypeCode,
    status: Number(values.STATUS ?? 1),
    lookupValues: rowList.map((row, index) => {
      const valCode = String(row.VALUE_CODE ?? '').trim()
      const note = String(row.NOTE ?? '').trim()
      return {
        id: row.ID ? Number(row.ID) : null,
        bgId: bgId ? Number(bgId) : null,
        buId: buId ? Number(buId) : null,
        typeId: values.ID ? Number(values.ID) : null,
        typeCode: normalizedTypeCode,
        value: String(row.VALUE ?? '').trim(),
        valueCode: valCode ? valCode.toUpperCase() : null,
        note: note || null,
        sortOrder: row.SORT_ORDER !== '' ? Number(row.SORT_ORDER) : index + 1,
        status: Number(row.STATUS ?? 1),
      }
    }),
  }
}
