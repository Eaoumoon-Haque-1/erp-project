/**
 * @file Temporary in-memory INV_UOM repository.
 * Replace this boundary when the Unit of Measure (UOM) API is documented.
 */
let records = [
  { ID: '1', BG_ID: '1', BU_ID: '', UNIT_NAME: 'Each', SORT_ORDER: '1', STATUS: '1' },
]

export function listAssetUnitsOfMeasure() {
  return records.map((record) => ({ ...record }))
}

export function getAssetUnitOfMeasure(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetUnitOfMeasure(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetUnitOfMeasure(id, values) {
  records = records.map((record) => record.ID === String(id) ? { ...record, ...values } : record)
  return getAssetUnitOfMeasure(id)
}

export function removeAssetUnitOfMeasure(id) {
  records = records.filter((record) => record.ID !== String(id))
}
