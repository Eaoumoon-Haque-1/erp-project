/**
 * @file Temporary repository for the Bulk Asset Receive for Split workflow.
 * The workbook maps this workflow to ASSET_RECEIVE_REGISTER. Keep the store
 * separate only while the backend endpoint and record discriminator are absent.
 */
let sequence = 1
let records = []

function clone(record) {
  return record ? {
    ...record,
    SPECIFICATIONS: record.SPECIFICATIONS.map((row) => ({ ...row })),
  } : null
}

function dateStamp() {
  const today = new Date()
  return [today.getFullYear(), today.getMonth() + 1, today.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('')
}

export function createBulkReceiveNumbers() {
  const suffix = String(sequence).padStart(4, '0')
  return {
    GRN_NO: `GRN-BULK-${dateStamp()}-${suffix}`,
    ASSET_NO: `AST-BULK-${dateStamp()}-${suffix}`,
  }
}

export function listBulkAssetReceives() {
  return records.map(clone)
}

export function getBulkAssetReceive(id) {
  return clone(records.find((record) => record.ID === String(id)))
}

export function createBulkAssetReceive(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  sequence += 1
  return clone(record)
}

export function updateBulkAssetReceive(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getBulkAssetReceive(id)
}

export function removeBulkAssetReceive(id) {
  records = records.filter((record) => record.ID !== String(id))
}
