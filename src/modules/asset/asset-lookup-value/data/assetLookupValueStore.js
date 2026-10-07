/**
 * @file Temporary in-memory repository for Asset Lookup Value.
 * Replace with API calls when Asset endpoints are documented in Swagger.
 */
let records = [
  {
    ID: '1',
    BG_ID: '1',
    GROUP_NAME: 'Health Expert',
    TYPE_ID: '1',
    TYPE_NAME: 'Asset Specification',
    VALUE: 'Size',
    SORT_ORDER: '1',
    STATUS: '1',
  },
  { ID: '2', BG_ID: '1', GROUP_NAME: 'Health Expert', TYPE_ID: '2', TYPE_NAME: 'Depreciation Method', VALUE: 'Straight Line', SORT_ORDER: '1', STATUS: '1' },
  { ID: '3', BG_ID: '1', GROUP_NAME: 'Health Expert', TYPE_ID: '3', TYPE_NAME: 'Asset Type', VALUE: 'Tangible', SORT_ORDER: '1', STATUS: '1' },
  { ID: '4', BG_ID: '1', GROUP_NAME: 'Health Expert', TYPE_ID: '4', TYPE_NAME: 'UOM', VALUE: 'Each', SORT_ORDER: '1', STATUS: '1' },
]

export function listAssetLookupValues() {
  return records.map((record) => ({ ...record }))
}

export function getAssetLookupValue(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetLookupValue(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetLookupValue(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetLookupValue(id)
}

export function removeAssetLookupValue(id) {
  records = records.filter((record) => record.ID !== String(id))
}

