/**
 * @file Inbound and outbound data mappers between AFM_USER_SETUP API and UI state.
 */

function csvToArray(val) {
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean)
  if (!val || typeof val !== 'string') return []
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function arrayToCsv(val) {
  if (Array.isArray(val)) {
    const cleaned = val.map(String).map((s) => s.trim()).filter(Boolean)
    return cleaned.length > 0 ? cleaned.join(',') : null
  }
  if (typeof val === 'string' && val.trim()) {
    return val.trim()
  }
  return null
}

export function mapUserSetupFromApi(record = {}) {
  return {
    ID: record.id != null ? String(record.id) : '',
    BG_ID: record.bgId != null ? String(record.bgId) : '',
    GROUP_NAME: record.groupName || '',
    BU_ID: record.buId != null ? String(record.buId) : '',
    BUSINESS_UNIT_NAME: record.businessUnitName || '',

    USER_ID: record.userId != null ? String(record.userId) : '',
    USER_NAME: record.userName || '',
    EMPLOYEE_ID: record.employeeId != null ? String(record.employeeId) : '',
    EMPLOYEE_CODE: record.employeeCode || '',
    EMPLOYEE_NAME: record.employeeName || '',
    USER_DISPLAY_LABEL: record.userDisplayLabel || record.userName || '',

    VOUCHER_DATE: csvToArray(record.voucherDate),
    VOUCHER_TYPE: csvToArray(record.voucherType),
    VOUCHER_TYPE_DEFAULT: record.voucherTypeDefault != null ? String(record.voucherTypeDefault) : '',
    VOUCHER_TYPE_DEFAULT_NAME: record.voucherTypeDefaultName || '',

    LOCATION: csvToArray(record.location),
    LOCATION_DEFAULT: record.locationDefault != null ? String(record.locationDefault) : '',
    LOCATION_DEFAULT_NAME: record.locationDefaultName || '',

    BANK_ACCOUNT: csvToArray(record.bankAccount),
    BANK_ACCOUNT_DEFAULT: record.bankAccountDefault != null ? String(record.bankAccountDefault) : '',
    BANK_ACCOUNT_DEFAULT_NAME: record.bankAccountDefaultName || '',

    COST_CENTER: csvToArray(record.costCenter),
    COST_CENTER_DEFAULT: record.costCenterDefault != null ? String(record.costCenterDefault) : '',
    COST_CENTER_DEFAULT_NAME: record.costCenterDefaultName || '',

    STATUS: record.status != null ? String(record.status) : '1',

    // Audit details matching BankChequeMapForm audit schema
    CREATED_USER_ID: record.createdUserId != null ? String(record.createdUserId) : '',
    CREATED_USER_NAME: record.createdUserName || '',
    CREATED_EMP_ID: record.createdEmpId != null ? String(record.createdEmpId) : '',
    CREATED_EMP_NAME: record.createdEmpName || '',
    CREATED_DATETIME: record.createdDatetime || null,
    CREATED_APP: record.createdApp || '',

    UPDATED_USER_ID: record.updatedUserId != null ? String(record.updatedUserId) : '',
    UPDATED_USER_NAME: record.updatedUserName || '',
    UPDATED_EMP_ID: record.updatedEmpId != null ? String(record.updatedEmpId) : '',
    UPDATED_EMP_NAME: record.updatedEmpName || '',
    UPDATED_DATETIME: record.updatedDatetime || null,
    UPDATED_APP: record.updatedApp || '',
  }
}

export function mapUserSetupToApi(values = {}) {
  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : null,
    buId: values.BU_ID ? Number(values.BU_ID) : null,
    userId: values.USER_ID ? Number(values.USER_ID) : null,
    voucherDate: arrayToCsv(values.VOUCHER_DATE),
    voucherType: arrayToCsv(values.VOUCHER_TYPE),
    voucherTypeDefault: values.VOUCHER_TYPE_DEFAULT ? String(values.VOUCHER_TYPE_DEFAULT).trim() : null,
    location: arrayToCsv(values.LOCATION),
    locationDefault: values.LOCATION_DEFAULT ? String(values.LOCATION_DEFAULT).trim() : null,
    bankAccount: arrayToCsv(values.BANK_ACCOUNT),
    bankAccountDefault: values.BANK_ACCOUNT_DEFAULT ? String(values.BANK_ACCOUNT_DEFAULT).trim() : null,
    costCenter: arrayToCsv(values.COST_CENTER),
    costCenterDefault: values.COST_CENTER_DEFAULT ? String(values.COST_CENTER_DEFAULT).trim() : null,
    status: values.STATUS !== undefined && values.STATUS !== '' ? Number(values.STATUS) : 1,
  }
}

