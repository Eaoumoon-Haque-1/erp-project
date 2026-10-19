/** @file Converts Manual Attendance API records to/from form field names. */
const text = (value) => value == null ? '' : String(value)

export function mapManualAttendanceUpdateFromApi(record = {}, labels = {}) {
  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    DEPT_ID: text(record.deptId),
    DESIG_ID: text(record.desigId),
    SHIFT_ID: text(record.shiftId),
    ATTEN_DATE: text(record.attenDate),
    IN_TIME: text(record.inTime).slice(0, 5),
    OUT_TIME: text(record.outTime).slice(0, 5),
    NOTE: record.note ?? '',
    STATUS: text(record.status ?? 1),
    GROUP_NAME: labels.groupNames?.get(text(record.bgId)) || '',
    BUSINESS_UNIT: labels.unitNames?.get(text(record.buId)) || '',
    DEPARTMENT_NAME: labels.departmentNames?.get(text(record.deptId)) || '',
    DESIGNATION_NAME: labels.designationNames?.get(text(record.desigId)) || '',
    SHIFT_TITLE: labels.shiftNames?.get(text(record.shiftId)) || '',
    CREATED_BY: text(record.createdUserId),
    CREATED_AT: text(record.createdDatetime),
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_AT: text(record.updatedDatetime),
  }
}

export function mapManualAttendanceUpdateToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    deptId: Number(values.DEPT_ID),
    desigId: Number(values.DESIG_ID),
    shiftId: Number(values.SHIFT_ID),
    attenDate: values.ATTEN_DATE,
    inTime: values.IN_TIME,
    outTime: values.OUT_TIME || null,
    note: values.NOTE || null,
    status: Number(values.STATUS),
  }
}
