/** @file Converts Department Group API records to and from UI field names. */
export function mapDepartmentGroupFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    BU_ID: String(record.buId ?? ''),
    DEPT_ID: String(record.deptId ?? ''),
    STATUS: String(record.status ?? 1),
  }
}

export function mapDepartmentGroupToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    deptId: Number(values.DEPT_ID),
    status: Number(values.STATUS),
  }
}
