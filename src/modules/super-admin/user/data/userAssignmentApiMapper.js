/** @file Maps User assignment DTOs to and from UserAssignmentTabs rows. */
export function mapEmployeeOptions(records = []) {
  return records
    .filter((employee) => Number(employee.status ?? 1) === 1)
    .map((employee) => ({
      value: String(employee.id),
      code: employee.employeeCode || String(employee.id),
      name: employee.employeeName || String(employee.id),
      label: `${employee.employeeName || employee.id} (${employee.employeeCode || employee.id})`,
      bgId: String(employee.bgId ?? ''),
    }))
}

export function mapAssignedEmployee(dto) {
  if (!dto?.employeeId) return []
  return [{
    id: `employee-map-${dto.employeeId}`,
    EMPL_ID: String(dto.employeeId),
    CODE: dto.employeeCode || String(dto.employeeId),
    NAME: dto.employeeName || String(dto.employeeId),
    DISPLAY_NAME: dto.employeeName
      ? `${dto.employeeName} (${dto.employeeCode || dto.employeeId})`
      : String(dto.employeeId),
    STATUS: '1',
  }]
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

export function mapEmployeeAssignmentToApi(rows = []) {
  const currentRow = rows.find((row) => String(row.STATUS) === '1') || rows.at(-1)
  return {
    employeeId: currentRow ? Number(currentRow.EMPL_ID) : null,
  }
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

