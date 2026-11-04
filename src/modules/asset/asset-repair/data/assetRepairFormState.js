/** @file Selection-driven label population for Asset Repair. */
export function updateAssetRepairField(current, name, value, references = {}) {
  const next = { ...current, [name]: value }

  if (name === 'ASSET_RECORD_ID') {
    const option = references.assetItems?.find((record) => String(record.id) === String(value))
    next.ITEM_NAME_LABEL = option?.label || ''
  }

  if (name === 'RECEIVE_ID') {
    const vendor = references.vendors?.find((record) => String(record.id) === String(value))
    next.RECEIVE_BY_NAME = vendor?.label || vendor?.supplierName || ''
  }

  if (name === 'SUPPORT_ENGINEER') {
    const engineer = references.engineers?.find(
      (record) => String(record.value) === String(value) || String(record.id) === String(value),
    )
    next.SUPPORT_ENGINEER_NAME = engineer?.label || value || ''
  }

  return next
}
