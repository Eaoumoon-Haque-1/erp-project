/** @file Converts AfmChartOfAccounts API records to and from form field names. */
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
 * Maps an AFM_CHART_OF_ACCOUNTS record to form values, including audit columns.
 * @param {Map<string,string>} [userNames] admin_users.id -> admin_users.user_name
 * @param {Map<string,string>} [employeeNames] hr_employee.id -> "employee_code: employee_name"
 */
export function mapAfmChartOfAccountsFromApi(
  record = {},
  groupNames = new Map(),
  unitNames = new Map(),
  accountHeadNames = new Map(),
  userNames = new Map(),
  employeeNames = new Map(),
) {
  const createdUserId = record.createdUserId ?? record.createdByUserId ?? record.CREATED_USER_ID ?? ''
  const createdEmpId = record.createdEmpId ?? record.createdEmployeeId ?? record.CREATED_EMP_ID ?? ''
  const updatedUserId = record.updatedUserId ?? record.updatedByUserId ?? record.UPDATED_USER_ID ?? ''
  const updatedEmpId = record.updatedEmpId ?? record.updatedEmployeeId ?? record.UPDATED_EMP_ID ?? ''
  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    record.createdEmployeeCode ?? record.createdEmpCode ?? record.CREATED_EMPLOYEE_CODE,
    record.createdEmployeeName ?? record.createdEmpName ?? record.CREATED_EMPLOYEE_NAME,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    record.updatedEmployeeCode ?? record.updatedEmpCode ?? record.UPDATED_EMPLOYEE_CODE,
    record.updatedEmployeeName ?? record.updatedEmpName ?? record.UPDATED_EMPLOYEE_NAME,
  )

  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    GROUP_NAME: groupNames.get(String(record.bgId)) || '',
    BU_ID: String(record.buId ?? ''),
    BUSINESS_UNIT: unitNames.get(String(record.buId)) || '',
    ACCOUNT_CODE: record.accountCode ?? '',
    ACCOUNT_HEAD_NAME: record.accountHeadName ?? '',
    LEDGER_HEAD: record.ledgerHead ?? '',
    ACCOUNT_HEAD_TYPE: record.accountHeadType ?? '',
    PARENT_ACCOUNT_HEAD: record.parentAccountHead == null ? '' : String(record.parentAccountHead),
    PARENT_ACCOUNT_HEAD_NAME: accountHeadNames.get(String(record.parentAccountHead)) || '',
    PARENT_ACCOUNT_CODE: record.parentAccountCode ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    ACCOUNT_USAGE: record.accountUsage ?? 'None',
    ACCOUNTS_SOURCE: record.accountsSource ?? 'None',
    IS_COST_CENTER_MANDATORY: String(record.isCostCenterMandatory ?? 0),
    IS_BUDGET_ACC_HEAD: String(record.isBudgetAccHead ?? 0),
    LEVEL: record.level == null ? '' : String(record.level),
    STATUS: String(record.status ?? 1),
    CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
    CREATED_USER_NAME: resolveAuditActor(
      createdUserId,
      record.createdUserName ?? record.createdByUserName ?? record.CREATED_USER_NAME,
      userNames,
    ),
    CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
    CREATED_EMP_NAME: resolveAuditActor(createdEmpId, directCreatedEmpDisplay, employeeNames),
    CREATED_DATETIME:
      record.createdDatetime ?? record.createdDateTime ?? record.createdAt ?? record.CREATED_DATETIME ?? '',
    CREATED_APP: record.createdApp ?? record.createdFrom ?? record.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
    UPDATED_USER_NAME: resolveAuditActor(
      updatedUserId,
      record.updatedUserName ?? record.updatedByUserName ?? record.UPDATED_USER_NAME,
      userNames,
    ),
    UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
    UPDATED_EMP_NAME: resolveAuditActor(updatedEmpId, directUpdatedEmpDisplay, employeeNames),
    UPDATED_DATETIME:
      record.updatedDatetime ?? record.updatedDateTime ?? record.updatedAt ?? record.UPDATED_DATETIME ?? '',
    UPDATED_APP: record.updatedApp ?? record.updatedFrom ?? record.UPDATED_APP ?? '',
  }
}

export function mapAfmChartOfAccountsToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    accountCode: values.ACCOUNT_CODE ? String(values.ACCOUNT_CODE).trim() : '',
    accountHeadName: values.ACCOUNT_HEAD_NAME ? String(values.ACCOUNT_HEAD_NAME).trim() : '',
    ledgerHead: values.LEDGER_HEAD || 'Title Account',
    accountHeadType: values.ACCOUNT_HEAD_TYPE || 'Asset',
    parentAccountHead: values.PARENT_ACCOUNT_HEAD ? Number(values.PARENT_ACCOUNT_HEAD) : null,
    parentAccountCode: values.PARENT_ACCOUNT_CODE || null,
    sortOrder: values.SORT_ORDER === '' || values.SORT_ORDER == null ? null : Number(values.SORT_ORDER),
    accountUsage: values.ACCOUNT_USAGE || 'None',
    accountsSource: values.ACCOUNTS_SOURCE || 'None',
    isCostCenterMandatory: Number(values.IS_COST_CENTER_MANDATORY || 0),
    isBudgetAccHead: Number(values.IS_BUDGET_ACC_HEAD || 0),
    level: values.LEVEL === '' || values.LEVEL == null ? null : Number(values.LEVEL),
    status: Number(values.STATUS ?? 1),
  }
}
