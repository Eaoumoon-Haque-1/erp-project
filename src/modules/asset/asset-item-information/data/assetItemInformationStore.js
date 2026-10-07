/**
 * @file Temporary in-memory ASSET_ITEM repository.
 * Replace this boundary with API calls when Asset endpoints are documented.
 */
let records = [
  {
    ID: '1',
    ITEM_NAME: 'Desktop Computer',
    ITEM_GROUP: '1',
    ITEM_GROUP_NAME: 'Computer Accessories',
    ASSET_DEPRI_CATE_ID: '1',
    DEPRI_CATEGORY_NAME: 'Computer Equipment',
    CATEGORY_TYPE: 'Tangible',
    DEPRI_METHOD: 'Straight Line',
    DEPRI_LIFE: '60',
    DEPRI_PERCENTAGE: '20',
    UOM: '4',
    UOM_NAME: 'Each',
    ASSET_OWNER: 'Human Resources',
    STATUS: '1',
  },
]

export function listAssetItems() {
  return records.map((record) => ({ ...record }))
}

export function getAssetItem(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetItem(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateAssetItem(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getAssetItem(id)
}

export function removeAssetItem(id) {
  records = records.filter((record) => record.ID !== String(id))
}
