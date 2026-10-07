/**
 * @file Temporary in-memory repository for Asset Lookup Type.
 * Replace these functions with API wrappers when Asset endpoints are added to
 * Swagger. Records persist during the current browser session only.
 */
let records = [
  {
    ID: '1',
    TYPE_NAME: 'Asset Specification',
    CODE: 'SPEC',
    STATUS: '1',
  },
  { ID: '2', TYPE_NAME: 'Depreciation Method', CODE: 'DEPRI-MTH', STATUS: '1' },
  { ID: '3', TYPE_NAME: 'Asset Type', CODE: 'ASSET-TYPE', STATUS: '1' },
  { ID: '4', TYPE_NAME: 'UOM', CODE: 'UOM', STATUS: '1' },
]

export function listAssetLookupTypes() {
  return records.map((record) => ({ ...record }))
}

export function getAssetLookupType(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetLookupType(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetLookupType(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetLookupType(id)
}

export function removeAssetLookupType(id) {
  records = records.filter((record) => record.ID !== String(id))
}

