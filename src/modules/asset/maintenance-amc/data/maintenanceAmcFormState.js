/** @file Selection-driven label population for Maintenance / AMC. */
export function updateMaintenanceAmcField(current, name, value, references) {
  const next = { ...current, [name]: value }
  if (name === 'ITEM_NAME') {
    next.ITEM_NAME_LABEL = references.assetItems?.find((record) => String(record.id ?? record.ID) === String(value))?.label || ''
  }
  if (name === 'MAINTENANCE_TYPE') {
    next.MAINTENANCE_TYPE_NAME = references.maintenanceTypes?.find((option) => option.value === value)?.label || ''
  }
  if (name === 'VENDOR_ID') {
    next.VENDOR_NAME = references.vendors?.find((record) => String(record.id ?? record.ID) === String(value))?.supplierName || ''
  }
  return next
}
