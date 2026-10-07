/**
 * @file Temporary in-memory repository for Asset Group.
 * Replace with API calls when the Asset Group endpoints are documented.
 */
let records = [
  {
    ID: '1',
    ASSET_GROUP: 'Computer Accessories',
    ASSET_OWNER_ID: '1',
    ASSET_OWNER_NAME: 'Human Resources',
    STATUS: '1',
  },
]

export function listAssetGroups() {
  return records.map((record) => ({ ...record }))
}

export function getAssetGroup(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetGroup(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetGroup(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetGroup(id)
}

export function removeAssetGroup(id) {
  records = records.filter((record) => record.ID !== String(id))
}

