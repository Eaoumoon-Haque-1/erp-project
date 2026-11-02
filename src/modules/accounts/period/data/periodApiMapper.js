/**
 * @file Data mapper for Accounting Period between API and UI state.
 */

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

export function mapPeriodFromApi(
  item = {},
  userNames = new Map(),
  employeeNames = new Map(),
) {
  if (!item) return null

  const createdUserId =
    item.createdUserId ??
    item.createdByUserId ??
    item.CREATED_USER_ID ??
    ''
  const createdEmpId =
    item.createdEmpId ??
    item.createdEmployeeId ??
    item.CREATED_EMP_ID ??
    ''
  const updatedUserId =
    item.updatedUserId ??
    item.updatedByUserId ??
    item.UPDATED_USER_ID ??
    ''
  const updatedEmpId =
    item.updatedEmpId ??
    item.updatedEmployeeId ??
    item.UPDATED_EMP_ID ??
    ''

  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    item.createdEmployeeCode ?? item.createdEmpCode ?? item.CREATED_EMPLOYEE_CODE,
    item.createdEmployeeName ?? item.createdEmpName ?? item.CREATED_EMPLOYEE_NAME,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    item.updatedEmployeeCode ?? item.updatedEmpCode ?? item.UPDATED_EMPLOYEE_CODE,
    item.updatedEmployeeName ?? item.updatedEmpName ?? item.UPDATED_EMPLOYEE_NAME,
  )

  return {
    ID: item.id != null ? String(item.id) : '',
    BG_ID: item.bgId != null ? String(item.bgId) : '',
    BU_ID: item.buId != null ? String(item.buId) : '',
    GROUP_NAME: item.groupName || item.GROUP_NAME || '',
    BUSINESS_UNIT_NAME:
      item.businessUnitName || item.businessUnit || item.BUSINESS_UNIT_NAME || '',
    PERIOD_YEAR: item.periodYear ?? item.PERIOD_YEAR ?? '',
    PERIOD_NAME: item.periodName ?? item.PERIOD_NAME ?? '',
    PERIOD_STATUS: item.periodStatus ?? item.PERIOD_STATUS ?? 'Open',
    STATUS:
      item.status !== undefined && item.status !== null ? String(item.status) : '1',
    CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
    CREATED_USER_NAME: resolveAuditActor(
      createdUserId,
      item.createdUserName ?? item.createdByUserName ?? item.CREATED_USER_NAME,
      userNames,
    ),
    CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
    CREATED_EMP_NAME: resolveAuditActor(
      createdEmpId,
      directCreatedEmpDisplay,
      employeeNames,
    ),
    CREATED_DATETIME:
      item.createdDatetime ??
      item.createdDateTime ??
      item.createdAt ??
      item.CREATED_DATETIME ??
      '',
    CREATED_APP:
      item.createdApp ?? item.createdFrom ?? item.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
    UPDATED_USER_NAME: resolveAuditActor(
      updatedUserId,
      item.updatedUserName ?? item.updatedByUserName ?? item.UPDATED_USER_NAME,
      userNames,
    ),
    UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
    UPDATED_EMP_NAME: resolveAuditActor(
      updatedEmpId,
      directUpdatedEmpDisplay,
      employeeNames,
    ),
    UPDATED_DATETIME:
      item.updatedDatetime ??
      item.updatedDateTime ??
      item.updatedAt ??
      item.UPDATED_DATETIME ??
      '',
    UPDATED_APP:
      item.updatedApp ?? item.updatedFrom ?? item.UPDATED_APP ?? '',
  }
}

export function mapPeriodToApi(values = {}) {
  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : null,
    buId: values.BU_ID ? Number(values.BU_ID) : null,
    periodYear: String(values.PERIOD_YEAR ?? '').trim(),
    periodName: String(values.PERIOD_NAME ?? '').trim(),
    periodStatus: String(values.PERIOD_STATUS ?? 'Open').trim(),
    status:
      values.STATUS !== undefined && values.STATUS !== null
        ? Number(values.STATUS)
        : 1,
  }
}

