/**
 * @file Converts between the Asset Location API schema (camelCase, numeric
 * ids/status) and the UPPER_SNAKE form state (string ids, '1'/'0' flags).
 */
const idToString = (value) => (value === null || value === undefined ? '' : String(value))

export function mapLocationMasterFromApi(record = {}, userMap = new Map(), empMap = new Map()) {
  const createdUserId = idToString(record.createdUserId ?? record.CREATED_USER_ID)
  const createdEmpId = idToString(record.createdEmpId ?? record.CREATED_EMP_ID)
  const updatedUserId = idToString(record.updatedUserId ?? record.UPDATED_USER_ID)
  const updatedEmpId = idToString(record.updatedEmpId ?? record.UPDATED_EMP_ID)

  return {
    ID: idToString(record.id ?? record.ID),
    BG_ID: idToString(record.bgId ?? record.BG_ID),
    BU_ID: idToString(record.buId ?? record.BU_ID),
    CUSTODIAN_ID: idToString(record.custodianId ?? record.CUSTODIAN_ID),
    SUB_CUSTODIAN_ID: idToString(record.subCustodianId ?? record.SUB_CUSTODIAN_ID),
    DEPT_ID: idToString(record.deptId ?? record.DEPT_ID),
    LOCATION_NAME: record.locationName ?? record.LOCATION_NAME ?? '',
    LOCATION_CODE: record.locationCode ?? record.LOCATION_CODE ?? '',
    ADDRESS: record.address ?? record.ADDRESS ?? '',
    BUILDING: record.building ?? record.BUILDING ?? '',
    FLOOR: record.floor ?? record.FLOOR ?? '',
    ROOM: record.room ?? record.ROOM ?? '',
    STATUS: String(record.status ?? record.STATUS ?? 1),
    CREATED_USER_ID: createdUserId,
    CREATED_USER_NAME:
      userMap.get(createdUserId) || record.createdUserName || record.CREATED_USER_NAME || '',
    CREATED_EMP_ID: createdEmpId,
    CREATED_EMP_NAME:
      empMap.get(createdEmpId) || record.createdEmpName || record.CREATED_EMP_NAME || '',
    CREATED_DATETIME: record.createdDatetime ?? record.CREATED_DATETIME ?? '',
    CREATED_APP: record.createdApp ?? record.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId,
    UPDATED_USER_NAME:
      userMap.get(updatedUserId) || record.updatedUserName || record.UPDATED_USER_NAME || '',
    UPDATED_EMP_ID: updatedEmpId,
    UPDATED_EMP_NAME:
      empMap.get(updatedEmpId) || record.updatedEmpName || record.UPDATED_EMP_NAME || '',
    UPDATED_DATETIME: record.updatedDatetime ?? record.UPDATED_DATETIME ?? '',
    UPDATED_APP: record.updatedApp ?? record.UPDATED_APP ?? '',
  }
}

export function mapLocationMasterToApi(values, scope = {}) {
  return {
    bgId: Number(scope.bgId ?? values.BG_ID),
    buId: Number(scope.buId ?? values.BU_ID),
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
