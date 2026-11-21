/**
 * @file Converts between the Custodian API schema (camelCase, numeric status)
 * and the UPPER_SNAKE form state (string '1'/'0' flags). `_ROW_ID` is a
 * client-only key for React and error lookup; it is never sent to the API.
 */
let rowSequence = 0

export function createSubCustodianRow(row = {}) {
  rowSequence += 1
  return {
    _ROW_ID: `row-${rowSequence}`,
    ID: row.ID ?? row.id ?? '',
    SUB_CUSTODIAN_NAME: row.SUB_CUSTODIAN_NAME ?? row.subCustodianName ?? '',
    STATUS: String(row.STATUS ?? row.status ?? '1'),
  }
}

export function mapCustodianFromApi(
  record = {},
  userMap = new Map(),
  empMap = new Map(),
) {
  const createdUserId = String(record.createdUserId ?? record.CREATED_USER_ID ?? '')
  const createdEmpId = String(record.createdEmpId ?? record.CREATED_EMP_ID ?? '')
  const updatedUserId = String(record.updatedUserId ?? record.UPDATED_USER_ID ?? '')
  const updatedEmpId = String(record.updatedEmpId ?? record.UPDATED_EMP_ID ?? '')

  return {
    ID: String(record.id ?? record.ID ?? ''),
    BG_ID: String(record.bgId ?? record.BG_ID ?? ''),
    BU_ID: String(record.buId ?? record.BU_ID ?? ''),
    CUSTODIAN_NAME: record.custodianName ?? record.CUSTODIAN_NAME ?? '',
    STATUS: String(record.status ?? record.STATUS ?? 1),
    SUB_CUSTODIANS: (record.subCustodians ?? record.SUB_CUSTODIANS ?? []).map((row) => ({
      ID: String(row.id ?? row.ID ?? ''),
      SUB_CUSTODIAN_NAME: row.subCustodianName ?? row.SUB_CUSTODIAN_NAME ?? '',
      STATUS: String(row.status ?? row.STATUS ?? 1),
    })),
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

// Rows without an id are new (id: null). Saved rows keep their id; rows the
// user removed are simply not in `rows`, so the backend sets them Inactive.
export function mapCustodianToApi(values, rows, scope = {}) {
  return {
    bgId: Number(scope.bgId ?? values.BG_ID),
    buId: Number(scope.buId ?? values.BU_ID),
    custodianName: values.CUSTODIAN_NAME,
    status: Number(values.STATUS),
    subCustodians: rows.map((row) => ({
      id: row.ID ? Number(row.ID) : null,
      subCustodianName: row.SUB_CUSTODIAN_NAME,
      status: Number(row.STATUS),
    })),
  }
}

export function countActiveSubCustodians(record) {
  return (record.SUB_CUSTODIANS ?? []).filter((row) => String(row.STATUS) === '1').length
}
