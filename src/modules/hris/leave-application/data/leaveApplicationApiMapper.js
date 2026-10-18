/** @file Converts Employee Leave records between API and form/list field names. */
import { fileToDataUrl } from '../../../../utils/imageDataUrl'

const text = (value) => value == null ? '' : String(value)

function auditActor(userId, employeeId) {
  const parts = []
  if (userId != null) parts.push(`User ID: ${userId}`)
  if (employeeId != null) parts.push(`Employee ID: ${employeeId}`)
  return parts.join(' / ')
}

export function mapLeaveApplicationFromApi(record = {}, references = {}) {
  const employee = references.employeeById?.get(text(record.employeeId))
  return {
    ID: text(record.id),
    BU_ID: text(record.buId),
    BUSINESS_UNIT: references.businessUnitNames?.get(text(record.buId)) || text(record.buId),
    EMPLOYEE_ID: text(record.employeeId),
    EMPLOYEE_NAME: employee?.employeeName || text(record.employeeId),
    DEPT_ID: text(record.deptId),
    DEPARTMENT: references.departmentNames?.get(text(record.deptId)) || text(record.deptId),
    DESIGNATION_ID: text(record.designationId),
    DESIGNATION: references.designationNames?.get(text(record.designationId)) || text(record.designationId),
    EMP_TYPE_ID: text(record.empTypeId),
    EMPLOYEE_TYPE: references.employmentTypeNames?.get(text(record.empTypeId)) || text(record.empTypeId),
    FROM_DATE: text(record.fromDate),
    TO_DATE: text(record.toDate),
    LEAVE_CATEGORY_ID: text(record.leaveCategoryId),
    LEAVE_CATEGORY: references.leaveCategoryNames?.get(text(record.leaveCategoryId)) || text(record.leaveCategoryId),
    TOTAL_LEAVE_DAYS: text(record.totalLeaveDays),
    LEAVE_BALANCE: '',
    SUPPORTING_DOCUMENT: record.supportingDocument || '',
    REASON: record.reason || '',
    STATUS: text(record.status ?? 0),
    CREATED_BY: auditActor(record.createdUserId, record.createdEmpId),
    CREATED_AT: record.createdDatetime || '',
    UPDATED_BY: auditActor(record.updatedUserId, record.updatedEmpId),
    UPDATED_AT: record.updatedDatetime || '',
  }
}

export async function mapLeaveApplicationToApi(values) {
  return {
    buId: Number(values.BU_ID),
    employeeId: Number(values.EMPLOYEE_ID),
    deptId: Number(values.DEPT_ID),
    designationId: Number(values.DESIGNATION_ID),
    empTypeId: Number(values.EMP_TYPE_ID),
    fromDate: values.FROM_DATE,
    toDate: values.TO_DATE,
    leaveCategoryId: Number(values.LEAVE_CATEGORY_ID),
    totalLeaveDays: Number(values.TOTAL_LEAVE_DAYS),
    supportingDocument: await fileToDataUrl(values.SUPPORTING_DOCUMENT),
    reason: values.REASON,
    status: Number(values.STATUS),
  }
}

export const leaveApplicationFieldMap = {
  buId: 'BU_ID', employeeId: 'EMPLOYEE_ID', deptId: 'DEPT_ID',
  designationId: 'DESIGNATION_ID', empTypeId: 'EMP_TYPE_ID',
  fromDate: 'FROM_DATE', toDate: 'TO_DATE', leaveCategoryId: 'LEAVE_CATEGORY_ID',
  totalLeaveDays: 'TOTAL_LEAVE_DAYS', supportingDocument: 'SUPPORTING_DOCUMENT',
  reason: 'REASON', status: 'STATUS',
}
