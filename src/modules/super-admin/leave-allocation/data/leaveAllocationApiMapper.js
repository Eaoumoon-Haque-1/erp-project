/** @file Converts Leave Allocation API records to and from form field names. */
export function mapLeaveAllocationFromApi(record = {}, labels = {}) {
  return {
    ID: String(record.id ?? ''),
    BU_ID: String(record.buId ?? ''),
    BUSINESS_UNIT: labels.businessUnitNames?.get(String(record.buId)) || '',
    EMP_TYPE_ID: String(record.empTypeId ?? ''),
    EMPLOYEE_TYPE: labels.employmentTypeNames?.get(String(record.empTypeId)) || '',
    LEAVE_CATEGORY_ID: String(record.leaveCategoryId ?? ''),
    LEAVE_CATEGORY: labels.leaveCategoryNames?.get(String(record.leaveCategoryId)) || '',
    TOTAL_LEAVE_DAYS: record.totalLeaveDays == null ? '' : String(record.totalLeaveDays),
    LEAVE_YEAR: record.leaveYear == null ? '' : String(record.leaveYear),
    SANDWICH_LEAVE_APPLICABLE: String(record.sandwichLeaveApplicable ?? 0),
    WITH_PAY: String(record.withPay ?? 0),
    STATUS: String(record.status ?? 1),
  }
}

export function mapLeaveAllocationToApi(values) {
  return {
    buId: Number(values.BU_ID),
    empTypeId: Number(values.EMP_TYPE_ID),
    leaveCategoryId: Number(values.LEAVE_CATEGORY_ID),
    totalLeaveDays: Number(values.TOTAL_LEAVE_DAYS),
    leaveYear: Number(values.LEAVE_YEAR),
    sandwichLeaveApplicable: Number(values.SANDWICH_LEAVE_APPLICABLE),
    withPay: Number(values.WITH_PAY),
    status: Number(values.STATUS),
  }
}
