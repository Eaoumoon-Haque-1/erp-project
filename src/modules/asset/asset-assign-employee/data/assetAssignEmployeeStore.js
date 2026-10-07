/**
 * @file Temporary in-memory ASSET_ASSIGN_TO_EMPL repository.
 * Replace this boundary when assignment endpoints are documented.
 */
let records = []

export function listAssetAssignments() {
  return records.map((record) => ({ ...record }))
}

export function getAssetAssignment(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetAssignment(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetAssignment(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetAssignment(id)
}

export function removeAssetAssignment(id) {
  records = records.filter((record) => record.ID !== String(id))
}
