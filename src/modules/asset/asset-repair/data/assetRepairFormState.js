/** @file Selection-driven label population for Asset Repair. */
export function updateAssetRepairField(current, name, value, references) {
  const next = { ...current, [name]: value }
  if (name === 'ASSET_RECORD_ID') {
    const option = references.eligibleAssets.find((record) => record.value === value)
    next.ASSET_SOURCE = option?.source || ''
    next.ASSET_RECEIVE_ID = option?.receiveId || ''
    next.ASSET_NO = option?.record.ASSET_NO || ''
    next.ITEM_NAME = option?.record.ITEM_NAME || ''
    next.ITEM_NAME_LABEL = option?.record.ITEM_NAME_LABEL || ''
  }
  if (name === 'RECEIVE_ID') next.RECEIVE_BY_NAME = references.vendors.find((record) => record.ID === value)?.VENDOR_NAME || ''
  if (name === 'SUPPORT_ENGINEER') {
    const engineer = references.engineers.find((record) => record.value === value)
    next.SUPPORT_ENGINEER_NAME = engineer ? `${engineer.employeeId} - ${engineer.name}` : ''
  }
  return next
}
