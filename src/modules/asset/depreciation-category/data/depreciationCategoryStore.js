/**
 * @file Temporary in-memory repository for Depreciation Category.
 * Replace with API calls when Asset endpoints are documented.
 */
let records = [
  {
    ID: '1',
    DEPRI_CATEGORY: 'Computer Equipment',
    DEPRI_METHOD: '2',
    DEPRI_METHOD_NAME: 'Straight Line',
    ASSET_TYPE: '3',
    ASSET_TYPE_NAME: 'Tangible',
    DEPRI_LIFE: '60',
    DEPRI_PERCENTAGE: '20',
    ASSET_OWNER: '1',
    ASSET_OWNER_NAME: 'Human Resources',
    STATUS: '1',
  },
]

export function listDepreciationCategories() {
  return records.map((record) => ({ ...record }))
}

export function getDepreciationCategory(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createDepreciationCategory(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateDepreciationCategory(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getDepreciationCategory(id)
}

export function removeDepreciationCategory(id) {
  records = records.filter((record) => record.ID !== String(id))
}

