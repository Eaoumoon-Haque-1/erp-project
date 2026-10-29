/**
 * @file Inbound and outbound data mappers between Bank API and UI state.
 */
import { createInitialBankDetailRow } from '../validation/bankValidation'

/**
 * Maps a single detail row from backend DTO to form state.
 */
export function mapBankDetailFromApi(detail = {}) {
  return createInitialBankDetailRow({
    _ROW_ID: detail.id ? `detail_${detail.id}` : `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ID: detail.id ? String(detail.id) : '',
    BG_ID: detail.bgId != null ? String(detail.bgId) : '',
    BU_ID: detail.buId != null ? String(detail.buId) : '',
    AFM_BANK_ID: detail.afmBankId != null ? String(detail.afmBankId) : '',
    BRANCH_NAME: detail.branchName ?? '',
    ADDRESS: detail.address ?? '',
    ACCOUNT_TYPE: detail.accountType ?? 'Current Account',
    ACCOUNT_NAME: detail.accountName ?? '',
    ACCOUNT_NUMBER: detail.accountNumber ?? '',
    OPENING_DATE: detail.openingDate ?? '',
    OPENING_BALANCE: detail.openingBalance != null ? String(detail.openingBalance) : '0.00',
    STATUS: String(detail.status ?? 1),
  })
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
 * Maps a master AFM_BANK record and its details from API to UI representation.
 */
export function mapBankFromApi(
  record = {},
  groupNames = new Map(),
  unitNames = new Map(),
  userNames = new Map(),
  employeeNames = new Map(),
) {
  const details = Array.isArray(record.bankDetails)
    ? record.bankDetails.map(mapBankDetailFromApi)
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
    BANK_NAME: record.bankName ?? '',
    SHORT_NAME: record.shortName ?? '',
    STATUS: String(record.status ?? 1),
    BANK_DETAILS: details,
    ACCOUNT_COUNT: details.length,
    ACTIVE_ACCOUNT_COUNT: details.filter((d) => String(d.STATUS) === '1').length,
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
 * Maps UI form state to backend AfmBankRequestDto.
 */
export function mapBankToApi(values = {}, rows = []) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    bankName: String(values.BANK_NAME ?? '').trim(),
    shortName: String(values.SHORT_NAME ?? '').trim() || null,
    status: Number(values.STATUS ?? 1),
    bankDetails: rows.map((row) => ({
      id: row.ID ? Number(row.ID) : null,
      bgId: Number(values.BG_ID),
      buId: Number(values.BU_ID),
      afmBankId: values.ID ? Number(values.ID) : null,
      branchName: String(row.BRANCH_NAME ?? '').trim() || null,
      address: String(row.ADDRESS ?? '').trim() || null,
      accountType: String(row.ACCOUNT_TYPE ?? 'Current Account').trim() || null,
      accountName: String(row.ACCOUNT_NAME ?? '').trim(),
      accountNumber: String(row.ACCOUNT_NUMBER ?? '').trim(),
      openingDate: row.OPENING_DATE || null,
      openingBalance: row.OPENING_BALANCE !== '' ? Number(row.OPENING_BALANCE) : 0,
      status: Number(row.STATUS ?? 1),
    })),
  }
}
