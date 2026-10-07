/**
 * @file Temporary in-memory ASSET_ITEM_SPEC repository.
 * Replace this boundary when Asset Specification Mapping APIs are documented.
 */
let records = [
  {
    ID: '1',
    ITEM_NAME: '1',
    ITEM_NAME_LABEL: 'Desktop Computer',
    SPECIFICATION: '1',
    SPECIFICATION_NAME: 'Size',
    SORT_ORDER: '1',
    STATUS: '1',
  },
]

export function listAssetSpecificationMaps() {
  return records.map((record) => ({ ...record }))
}

export function getAssetSpecificationMap(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetSpecificationMap(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetSpecificationMap(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetSpecificationMap(id)
}

export function removeAssetSpecificationMap(id) {
  records = records.filter((record) => record.ID !== String(id))
}
