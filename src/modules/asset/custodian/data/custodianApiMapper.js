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
    ID: row.ID ?? '',
    SUB_CUSTODIAN_NAME: row.SUB_CUSTODIAN_NAME ?? '',
    STATUS: row.STATUS ?? '1',
  }
}

export function mapCustodianFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    BU_ID: String(record.buId ?? ''),
    CUSTODIAN_NAME: record.custodianName ?? '',
    STATUS: String(record.status ?? 1),
    SUB_CUSTODIANS: (record.subCustodians ?? []).map((row) => ({
      ID: String(row.id ?? ''),
      SUB_CUSTODIAN_NAME: row.subCustodianName ?? '',
      STATUS: String(row.status ?? 1),
    })),
  }
}

// Rows without an id are new (id: null). Saved rows keep their id; rows the
// user removed are simply not in `rows`, so the backend sets them Inactive.
export function mapCustodianToApi(values, rows) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
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
  return record.SUB_CUSTODIANS.filter((row) => row.STATUS === '1').length
}
