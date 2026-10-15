/** @file Converts Leave Type Group API records to and from Leave Type Assign form fields. */
export function mapLeaveTypeAssignFromApi(record = {}, labels = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    BU_ID: String(record.buId ?? ''),
    LEAVE_TYPE_ID: String(record.leaveTypeId ?? ''),
    GROUP_NAME: labels.groupNames?.get(String(record.bgId)) || '',
    BUSINESS_UNIT: labels.unitNames?.get(String(record.buId)) || '',
    LEAVE_TYPE_NAME: labels.leaveTypeNames?.get(String(record.leaveTypeId)) || '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapLeaveTypeAssignToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    leaveTypeId: Number(values.LEAVE_TYPE_ID),
    status: Number(values.STATUS),
  }
}
