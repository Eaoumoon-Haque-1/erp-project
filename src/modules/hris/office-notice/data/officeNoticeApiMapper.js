/** @file Converts Office Notice API records between backend and UI field names. */
const text = (value) => value == null ? '' : String(value)

function auditActor(userId, employeeId) {
  const parts = []
  if (userId != null) parts.push(`User ID: ${userId}`)
  if (employeeId != null) parts.push(`Employee ID: ${employeeId}`)
  return parts.join(' / ')
}

export function mapOfficeNoticeFromApi(record = {}, businessUnitNames = new Map()) {
  return {
    ID: text(record.id),
    BU_ID: text(record.buId),
    BUSINESS_UNIT: businessUnitNames.get(text(record.buId)) || text(record.buId),
    TITLE: record.title || '',
    PUBLISH_DATE: record.publishDate || '',
    EXPIRE_DATE: record.expireDate || '',
    ATTACHMENT: record.attachment || '',
    IS_IMPORTANT: text(record.isImportant ?? 0),
    DESCRIPTION: record.description || '',
    STATUS: text(record.status ?? 1),
    CREATED_BY: auditActor(record.createdUserId, record.createdEmpId),
    CREATED_AT: record.createdDatetime || '',
    UPDATED_BY: auditActor(record.updatedUserId, record.updatedEmpId),
    UPDATED_AT: record.updatedDatetime || '',
  }
}

export function mapOfficeNoticeToApi(values) {
  return {
    buId: Number(values.BU_ID),
    title: values.TITLE,
    publishDate: values.PUBLISH_DATE,
    expireDate: values.EXPIRE_DATE,
    attachment: values.ATTACHMENT,
    isImportant: Number(values.IS_IMPORTANT),
    description: values.DESCRIPTION,
    status: Number(values.STATUS),
  }
}

export const officeNoticeFieldMap = {
  buId: 'BU_ID',
  title: 'TITLE',
  publishDate: 'PUBLISH_DATE',
  expireDate: 'EXPIRE_DATE',
  attachment: 'ATTACHMENT',
  isImportant: 'IS_IMPORTANT',
  description: 'DESCRIPTION',
  status: 'STATUS',
}
