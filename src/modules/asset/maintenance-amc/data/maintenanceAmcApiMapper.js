/** @file Converts Asset Maintenance records between backend API and frontend form fields. */
const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapMaintenanceAmcFromApi(record = {}, references = {}) {
  const itemId = text(record.itemId)
  const vendorId = text(record.vendorId)
  const maintenanceType = text(record.maintenanceType)

  const assetItem = references.assetItems?.find((i) => String(i.id ?? i.ID) === itemId)
  const vendor = references.vendors?.find((v) => String(v.id ?? v.ID) === vendorId)
  const typeOpt = references.maintenanceTypes?.find((t) => String(t.value ?? t.id) === maintenanceType)

  const itemNameLabel = assetItem
    ? `${assetItem.itemCode ? `${assetItem.itemCode} - ` : ''}${assetItem.itemName || assetItem.ITEM_NAME || ''}`
    : (record.itemName || (itemId ? `Item ${itemId}` : ''))

  const vendorName = vendor
    ? (vendor.supplierName || vendor.vendorName || vendor.VENDOR_NAME || '')
    : (record.vendorName || (vendorId ? `Vendor ${vendorId}` : ''))

  const maintenanceTypeName = typeOpt?.label || maintenanceType

  return {
    ID: text(record.id),
    id: record.id,
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ITEM_NAME: itemId,
    ITEM_NAME_LABEL: itemNameLabel,
    MAINTENANCE_TYPE: maintenanceType,
    MAINTENANCE_TYPE_NAME: maintenanceTypeName,
    MAINTENANCE_PRIORITY: text(record.maintenancePriority || 'MEDIUM'),
    VENDOR_ID: vendorId,
    VENDOR_NAME: vendorName,
    START_DATE: text(record.startDate),
    END_DATE: text(record.endDate),
    COST: record.cost != null ? String(record.cost) : '',
    NEXT_DUE_DATE: text(record.nextDueDate),
    REMARK: text(record.remark),
    STATUS: text(record.status ?? 1),

    // Audit fields
    createdUserId: record.createdUserId,
    createdEmpId: record.createdEmpId,
    createdDatetime: record.createdDatetime,
    createdApp: record.createdApp,
    updatedUserId: record.updatedUserId,
    updatedEmpId: record.updatedEmpId,
    updatedDatetime: record.updatedDatetime,
    updatedApp: record.updatedApp,
    status: record.status,
  }
}

export function mapMaintenanceAmcToApi(values = {}, scope = {}) {
  return {
    ...(values.ID ? { id: nullableNumber(values.ID) } : {}),
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    itemId: nullableNumber(values.ITEM_NAME),
    maintenanceType: values.MAINTENANCE_TYPE || null,
    maintenancePriority: values.MAINTENANCE_PRIORITY || null,
    vendorId: nullableNumber(values.VENDOR_ID),
    startDate: values.START_DATE || null,
    endDate: values.END_DATE || null,
    cost: values.COST !== '' && values.COST != null ? Number(values.COST) : null,
    nextDueDate: values.NEXT_DUE_DATE || null,
    remark: values.REMARK || '',
    status: Number(values.STATUS ?? 1),
  }
}

