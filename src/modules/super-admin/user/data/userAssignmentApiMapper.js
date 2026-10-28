/** @file Maps User assignment DTOs to and from UserAssignmentTabs rows. */
export function mapEmployeeOptions(records = [], preserveEmployeeId = '') {
  return records
    .filter((employee) => (
      Number(employee.status ?? 1) === 1
      || String(employee.id) === String(preserveEmployeeId)
    ))
    .map((employee) => ({
      value: String(employee.id),
      code: employee.employeeCode || String(employee.id),
      name: employee.employeeName || String(employee.id),
      label: `${employee.employeeName || employee.id} (${employee.id})`,
      bgId: String(employee.bgId ?? ''),
      buId: String(employee.buId ?? ''),
      deptId: String(employee.deptId ?? ''),
      desigId: String(employee.desigId ?? ''),
    }))
}

export function mapAssignedBusinessUnits(dto, unitNames = new Map()) {
  return (dto?.businessUnits || []).map((row) => ({
    id: String(row.id ?? `business-unit-${row.buId}`),
    MAPPING_ID: row.id == null ? null : String(row.id),
    BU_ID: String(row.buId),
    NAME: unitNames.get(String(row.buId)) || String(row.buId),
    STATUS: String(row.status ?? 1),
  }))
}

export function mapBusinessUnitAssignmentsToApi(userId, bgId, rows = []) {
  return {
    userId: Number(userId),
    bgId: Number(bgId),
    businessUnits: rows.map((row) => ({
      id: row.MAPPING_ID ? Number(row.MAPPING_ID) : null,
      buId: Number(row.BU_ID),
      status: Number(row.STATUS),
    })),
  }
}

