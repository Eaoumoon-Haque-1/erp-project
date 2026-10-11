/**
 * @file Temporary in-memory ASSET_AUDIT repository.
 * Audit records are intentionally isolated from Disposal records and do not mutate asset availability.
 */
let records = []

export function listAssetAudits() {
  return records.map((record) => ({ ...record }))
}

export function getAssetAudit(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetAudit(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetAudit(id, values) {
  records = records.map((record) => record.ID === String(id) ? { ...record, ...values } : record)
  return getAssetAudit(id)
}

export function removeAssetAudit(id) {
  records = records.filter((record) => record.ID !== String(id))
}
