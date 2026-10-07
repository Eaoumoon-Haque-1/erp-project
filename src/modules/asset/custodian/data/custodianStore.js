/**
 * @file Temporary in-memory repository for ASSET_CUSTODIAN and its detail rows.
 * Replace this boundary when the Asset Custodian API is available.
 */
let records = [
  {
    ID: '1',
    CUSTODIAN_NAME: 'Information Technology',
    STATUS: '1',
    SUB_CUSTODIANS: [
      {
        ID: '1',
        CUSTODIAN_ID: '1',
        SUB_CUSTODIAN_NAME: 'IT Store',
        STATUS: '1',
      },
    ],
  },
]

function cloneRecord(record) {
  if (!record) return null
  return {
    ...record,
    SUB_CUSTODIANS: record.SUB_CUSTODIANS.map((row) => ({ ...row })),
  }
}

export function listCustodians() {
  return records.map(cloneRecord)
}

export function getCustodian(id) {
  return cloneRecord(records.find((record) => record.ID === String(id)))
}

export function createCustodian(values) {
  const id = String(Date.now())
  const record = {
    ID: id,
    CUSTODIAN_NAME: values.CUSTODIAN_NAME,
    STATUS: values.STATUS,
    SUB_CUSTODIANS: values.SUB_CUSTODIANS.map((row, index) => ({
      ...row,
      ID: row.ID || `${id}-${index + 1}`,
      CUSTODIAN_ID: id,
    })),
  }
  records = [...records, record]
  return cloneRecord(record)
}

export function updateCustodian(id, values) {
  const normalizedId = String(id)
  records = records.map((record) => (
    record.ID === normalizedId
      ? {
          ...record,
          ...values,
          SUB_CUSTODIANS: values.SUB_CUSTODIANS.map((row, index) => ({
            ...row,
            ID: row.ID || `${normalizedId}-${index + 1}`,
            CUSTODIAN_ID: normalizedId,
          })),
        }
      : record
  ))
  return getCustodian(normalizedId)
}

export function removeCustodian(id) {
  records = records.filter((record) => record.ID !== String(id))
}
