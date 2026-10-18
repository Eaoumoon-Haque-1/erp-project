/** @file Converts Mobile Notification records between API and UI field names. */
const text = (value) => value == null ? '' : String(value)

function auditActor(userId, employeeId) {
  const parts = []
  if (userId != null) parts.push(`User ID: ${userId}`)
  if (employeeId != null) parts.push(`Employee ID: ${employeeId}`)
  return parts.join(' / ')
}

export function mapMobileNotificationFromApi(record = {}, references = {}) {
  return {
    ID: text(record.id),
    BU_ID: record.buId == null ? [] : [text(record.buId)],
    BUSINESS_UNITS: references.businessUnitNames?.get(text(record.buId)) || text(record.buId),
    DEPT_ID: record.deptId == null ? [] : [text(record.deptId)],
    DEPARTMENTS: references.departmentNames?.get(text(record.deptId)) || text(record.deptId),
    EMPL_ID: record.emplId == null ? [] : [text(record.emplId)],
    EMPLOYEES: references.employeeNames?.get(text(record.emplId)) || text(record.emplId),
    NOTIFICATION_TYPE: text(record.notificationTypeId),
    NOTIFICATION_TYPE_LABEL: references.notificationTypeNames?.get(text(record.notificationTypeId)) || text(record.notificationTypeId),
    TITLE: record.title || '',
    BODY: record.body || '',
    STATUS: text(record.status ?? 1),
    CREATED_BY: auditActor(record.createdUserId, record.createdEmpId),
    CREATED_AT: record.createdDatetime || '',
    UPDATED_BY: auditActor(record.updatedUserId, record.updatedEmpId),
    UPDATED_AT: record.updatedDatetime || '',
  }
}

export function mapMobileNotificationCreateToApi(values) {
  return {
    buIds: values.BU_ID.map(Number),
    deptIds: values.DEPT_ID.map(Number),
    employeeIds: values.EMPL_ID.map(Number),
    notificationTypeId: Number(values.NOTIFICATION_TYPE),
    title: values.TITLE,
    body: values.BODY,
    status: Number(values.STATUS),
  }
}

export function mapMobileNotificationUpdateToApi(values) {
  return {
    buId: Number(values.BU_ID[0]),
    deptId: Number(values.DEPT_ID[0]),
    emplId: Number(values.EMPL_ID[0]),
    notificationTypeId: Number(values.NOTIFICATION_TYPE),
    title: values.TITLE,
    body: values.BODY,
    status: Number(values.STATUS),
  }
}

export const mobileNotificationFieldMap = {
  buIds: 'BU_ID', buId: 'BU_ID', deptIds: 'DEPT_ID', deptId: 'DEPT_ID',
  employeeIds: 'EMPL_ID', emplId: 'EMPL_ID', notificationTypeId: 'NOTIFICATION_TYPE',
  title: 'TITLE', body: 'BODY', status: 'STATUS',
}
