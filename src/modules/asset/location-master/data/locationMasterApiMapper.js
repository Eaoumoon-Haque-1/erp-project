/**
 * @file Converts between the Asset Location API schema (camelCase, numeric
 * ids/status) and the UPPER_SNAKE form state (string ids, '1'/'0' flags).
 */
const idToString = (value) => (value === null || value === undefined ? '' : String(value))

export function mapLocationMasterFromApi(record = {}) {
  return {
    ID: idToString(record.id),
    BG_ID: idToString(record.bgId),
    BU_ID: idToString(record.buId),
    CUSTODIAN_ID: idToString(record.custodianId),
    SUB_CUSTODIAN_ID: idToString(record.subCustodianId),
    DEPT_ID: idToString(record.deptId),
    LOCATION_NAME: record.locationName ?? '',
    LOCATION_CODE: record.locationCode ?? '',
    ADDRESS: record.address ?? '',
    BUILDING: record.building ?? '',
    FLOOR: record.floor ?? '',
    ROOM: record.room ?? '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapLocationMasterToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    custodianId: Number(values.CUSTODIAN_ID),
    subCustodianId: Number(values.SUB_CUSTODIAN_ID),
    locationName: values.LOCATION_NAME,
    locationCode: values.LOCATION_CODE,
    address: values.ADDRESS,
    deptId: Number(values.DEPT_ID),
    building: values.BUILDING,
    floor: values.FLOOR,
    room: values.ROOM,
    status: Number(values.STATUS),
  }
}

// The department payload field for the name is not documented; accept the likely keys.
export function mapDepartmentFromApi(record = {}) {
  return {
    ID: idToString(record.id),
    NAME: record.departmentName ?? record.deptName ?? record.name ?? '',
    STATUS: String(record.status ?? 1),
  }
}
