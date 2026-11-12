/**
 * @file Data mapper for Item Store between API and UI state.
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

export function mapItemStoreFromApi(
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

  const createdUserName = resolveAuditActor(
    createdUserId,
    item.createdUserName ?? item.createdByUserName ?? item.CREATED_USER_NAME,
    userNames,
  )
  const createdEmpName = resolveAuditActor(
    createdEmpId,
    directCreatedEmpDisplay,
    employeeNames,
  )
  const updatedUserName = resolveAuditActor(
    updatedUserId,
    item.updatedUserName ?? item.updatedByUserName ?? item.UPDATED_USER_NAME,
    userNames,
  )
  const updatedEmpName = resolveAuditActor(
    updatedEmpId,
    directUpdatedEmpDisplay,
    employeeNames,
  )

  const createdDatetime =
    item.createdDatetime ??
    item.createdDateTime ??
    item.createdAt ??
    item.CREATED_DATETIME ??
    ''
  const updatedDatetime =
    item.updatedDatetime ??
    item.updatedDateTime ??
    item.updatedAt ??
    item.UPDATED_DATETIME ??
    ''

  const createdApp = item.createdApp ?? item.createdFrom ?? item.CREATED_APP ?? '-'
  const updatedApp = item.updatedApp ?? item.updatedFrom ?? item.UPDATED_APP ?? '-'
  const statusStr = item.status !== undefined && item.status !== null ? String(item.status) : '1'
  const isDefaultStr = item.isDefault !== undefined && item.isDefault !== null ? String(item.isDefault) : '0'

  const assignedEmployees = Array.isArray(item.assignedEmployees)
    ? item.assignedEmployees.map((m) => ({
        id: m.id != null ? String(m.id) : '',
        storeId: m.storeId != null ? String(m.storeId) : '',
        employeeId: m.employeeId != null ? String(m.employeeId) : '',
        employeeDisplay:
          m.employeeDisplay ||
          (m.employeeName ? `${m.employeeName}${m.employeeCode ? ` (${m.employeeCode})` : ''}` : ''),
        employeeName: m.employeeName || '',
        employeeCode: m.employeeCode || '',
        status: m.status !== undefined && m.status !== null ? Number(m.status) : 1,
      }))
    : []

  return {
    ID: item.id != null ? String(item.id) : '',
    BG_ID: item.bgId != null ? String(item.bgId) : '',
    BU_ID: item.buId != null ? String(item.buId) : '',
    GROUP_NAME: item.groupName || item.businessGroupName || item.GROUP_NAME || '',
    BUSINESS_UNIT: item.businessUnitName || item.businessUnit || item.BUSINESS_UNIT || '',
    STORE_NAME: item.storeName || '',
    STORE_CODE: item.storeCode || '',
    IS_DEFAULT: isDefaultStr,
    ASSIGNED_EMPLOYEES: assignedEmployees,
    STATUS: statusStr,

    CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
    CREATED_USER_NAME: createdUserName,
    CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
    CREATED_EMP_NAME: createdEmpName,
    CREATED_DATETIME: createdDatetime,
    CREATED_APP: createdApp,
    UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
    UPDATED_USER_NAME: updatedUserName,
    UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
    UPDATED_EMP_NAME: updatedEmpName,
    UPDATED_DATETIME: updatedDatetime,
    UPDATED_APP: updatedApp,

    AUDIT_LOG: {
      CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
      CREATED_USER_NAME: createdUserName,
      CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
      CREATED_EMP_NAME: createdEmpName,
      CREATED_DATETIME: createdDatetime,
      CREATED_APP: createdApp,
      UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
      UPDATED_USER_NAME: updatedUserName,
      UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
      UPDATED_EMP_NAME: updatedEmpName,
      UPDATED_DATETIME: updatedDatetime,
      UPDATED_APP: updatedApp,
      STATUS: statusStr,
    },
    API_RECORD: item,
  }
}

export function mapItemStoreToApi(values, original = null) {
  const empIds = Array.isArray(values.EMPLOYEE_IDS)
    ? values.EMPLOYEE_IDS.map(Number).filter(Boolean)
    : Array.isArray(values.ASSIGNED_EMPLOYEES)
    ? values.ASSIGNED_EMPLOYEES.map((e) => Number(e.employeeId || e.id)).filter(Boolean)
    : undefined

  const employeeIdStr =
    empIds && empIds.length > 0
      ? empIds.join(',')
      : typeof values.EMPLOYEE_ID === 'string' && values.EMPLOYEE_ID.trim()
      ? values.EMPLOYEE_ID.trim()
      : null

  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : original?.bgId || null,
    buId: values.BU_ID ? Number(values.BU_ID) : original?.buId || null,
    storeName: values.STORE_NAME ? String(values.STORE_NAME).trim() : '',
    storeCode: values.STORE_CODE ? String(values.STORE_CODE).trim() : null,
    isDefault: values.IS_DEFAULT != null ? Number(values.IS_DEFAULT) : 0,
    employeeIds: empIds,
    employeeId: employeeIdStr,
    status: values.STATUS != null ? Number(values.STATUS) : 1,
  }
}

