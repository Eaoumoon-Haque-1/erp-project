/**
 * @file Inbound and outbound data mappers between Voucher and Payment Type Mapping API and UI state.
 */

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
 * Maps a backend AfmVTypePTypeMapResponseDto to UI state.
 * @param {object} record Backend record
 * @param {Map<string, string>} [groupNames=new Map()] Business Group name map
 * @param {Map<string, string>} [unitNames=new Map()] Business Unit name map
 * @param {Map<string, string>} [userNames=new Map()] Admin User user_name map
 * @param {Map<string, string>} [employeeNames=new Map()] HR Employee "employee_code: employee_name" map
 */
export function mapVoucherMappingFromApi(
  record = {},
  groupNames = new Map(),
  unitNames = new Map(),
  userNames = new Map(),
  employeeNames = new Map(),
) {
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
    VOUCHER_TYPE_ID:
      record.voucherTypeId != null ? String(record.voucherTypeId) : '',
    VOUCHER_TYPE_VALUE: record.voucherTypeValue ?? '',
    VOUCHER_TYPE_CODE: record.voucherTypeValueCode ?? '',
    PAYMENT_TYPE_ID:
      record.paymentTypeId != null ? String(record.paymentTypeId) : '',
    PAYMENT_TYPE_VALUE: record.paymentTypeValue ?? '',
    PAYMENT_TYPE_CODE: record.paymentTypeValueCode ?? '',
    STATUS: String(record.status ?? 1),
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
 * Maps UI form state to backend AfmVTypePTypeMapRequestDto.
 * @param {object} values Form values
 */
export function mapVoucherMappingToApi(values = {}) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    voucherTypeId: Number(values.VOUCHER_TYPE_ID),
    paymentTypeId: Number(values.PAYMENT_TYPE_ID),
    status: Number(values.STATUS ?? 1),
  }
}
