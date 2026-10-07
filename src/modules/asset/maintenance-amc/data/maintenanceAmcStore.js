/** @file Temporary in-memory ASSET_MAINTENANCE repository. */
let records = []

export function listMaintenanceRecords() {
  return records.map((record) => ({ ...record }))
}

export function getMaintenanceRecord(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createMaintenanceRecord(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateMaintenanceRecord(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getMaintenanceRecord(id)
}

export function removeMaintenanceRecord(id) {
  records = records.filter((record) => record.ID !== String(id))
}
