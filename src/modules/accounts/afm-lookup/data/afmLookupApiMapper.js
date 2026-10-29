/**
 * @file Inbound and outbound data mappers between AFM Lookup API and UI state.
 */
import { createInitialLookupValueRow } from '../validation/afmLookupValidation'

/**
 * Maps a single detail lookup value from backend DTO to form state.
 * @param {object} detail Backend AfmLookupValueDto
 * @param {number} [fallbackIndex=1] Default row position index
 */
export function mapLookupValueFromApi(detail = {}, fallbackIndex = 1) {
  return createInitialLookupValueRow(
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
  return lookupMap.get(key) || key
}

function formatEmployeeAuditDisplay(code, name) {
  const cleanCode = String(code ?? '').trim()
  const cleanName = String(name ?? '').trim()
  if (cleanCode && cleanName) return `${cleanCode}: ${cleanName}`
  return cleanCode || cleanName || ''
}

/**
 * Maps a master AFM_LOOKUP_TYPE record and its values from API to UI representation.
 * @param {object} record Backend AfmLookupTypeResponseDto
 * @param {Map<string, string>} [groupNames=new Map()] Business Group name map
 * @param {Map<string, string>} [unitNames=new Map()] Business Unit name map
 * @param {Map<string, string>} [userNames=new Map()] Admin User user_name map
 * @param {Map<string, string>} [employeeNames=new Map()] HR Employee "employee_code: employee_name" map
 */
export function mapLookupTypeFromApi(
  record = {},
  groupNames = new Map(),
  unitNames = new Map(),
  userNames = new Map(),
  employeeNames = new Map(),
) {
  const details = Array.isArray(record.lookupValues)
    ? record.lookupValues.map((v, i) => mapLookupValueFromApi(v, i + 1))
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

  return {
    ID: record.id != null ? String(record.id) : '',
    BG_ID: record.bgId != null ? String(record.bgId) : '',
    BU_ID: record.buId != null ? String(record.buId) : '',
    GROUP_NAME: groupNames.get(String(record.bgId)) || '',
    BUSINESS_UNIT: unitNames.get(String(record.buId)) || '',
    TYPE_NAME: record.typeName ?? '',
    TYPE_CODE: record.typeCode ?? '',
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
 * Maps UI form state to backend AfmLookupTypeRequestDto.
 * @param {object} values Master form fields
 * @param {Array} rows Repeatable lookup value rows
 */
export function mapLookupTypeToApi(values = {}, rows = []) {
  const normalizedTypeCode = String(values.TYPE_CODE ?? '').trim().toUpperCase() || null

  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    typeName: String(values.TYPE_NAME ?? '').trim(),
    typeCode: normalizedTypeCode,
    status: Number(values.STATUS ?? 1),
    lookupValues: rows.map((row, index) => {
      const valCode = String(row.VALUE_CODE ?? '').trim()
      const note = String(row.NOTE ?? '').trim()
      return {
        id: row.ID ? Number(row.ID) : null,
        bgId: Number(values.BG_ID),
        buId: Number(values.BU_ID),
        typeNameId: values.ID ? Number(values.ID) : null,
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
