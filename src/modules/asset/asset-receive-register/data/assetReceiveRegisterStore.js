/**
 * @file Temporary in-memory ASSET_RECEIVE_REGISTER repository.
 * Replace this boundary when Asset Receive Register endpoints are available.
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

export function createReceiveNumbers() {
  const suffix = String(sequence).padStart(4, '0')
  return {
    GRN_NO: `GRN-${dateStamp()}-${suffix}`,
    ASSET_NO: `AST-${dateStamp()}-${suffix}`,
  }
}

export function listAssetReceives() {
  return records.map(clone)
}

export function getAssetReceive(id) {
  return clone(records.find((record) => record.ID === String(id)))
}

export function createAssetReceive(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  sequence += 1
  return clone(record)
}

export function updateAssetReceive(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetReceive(id)
}

export function removeAssetReceive(id) {
  records = records.filter((record) => record.ID !== String(id))
}
