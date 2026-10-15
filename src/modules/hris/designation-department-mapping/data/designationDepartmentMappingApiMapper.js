/** @file Converts Department–Designation mapping API records to and from form field names. */
export function mapDesignationDepartmentMappingFromApi(record = {}, labels = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    BU_ID: String(record.buId ?? ''),
    DEPT_ID: String(record.deptId ?? ''),
    DESIG_ID: String(record.desigId ?? ''),
    GROUP_NAME: labels.groupNames?.get(String(record.bgId)) || '',
    BUSINESS_UNIT: labels.unitNames?.get(String(record.buId)) || '',
    DEPARTMENT_NAME: labels.departmentNames?.get(String(record.deptId)) || '',
    DESIGNATION_NAME: labels.designationNames?.get(String(record.desigId)) || '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapDesignationDepartmentMappingToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    deptId: Number(values.DEPT_ID),
    desigId: Number(values.DESIG_ID),
    status: Number(values.STATUS),
  }
}
