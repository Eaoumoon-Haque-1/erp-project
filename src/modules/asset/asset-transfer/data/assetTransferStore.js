/**
 * @file Temporary in-memory ASSET_TRANSFER repository.
 * Transfer history is kept separately so the latest destination can become
 * the source of a later transfer without mutating the original receive row.
 */
let records = []

export function listAssetTransfers() {
  return records.map((record) => ({ ...record }))
}

export function getAssetTransfer(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetTransfer(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetTransfer(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetTransfer(id)
}

export function removeAssetTransfer(id) {
  records = records.filter((record) => record.ID !== String(id))
}
