/** @file Converts Gate Pass records between backend API and frontend form field names. */
const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapGatePassFromApi(record = {}, references = {}) {
  const supplierId = text(record.supplierId)
  const custodianId = text(record.custodianId)

  const supplier = references.vendors?.find((v) => String(v.id ?? v.ID) === supplierId)
  const custodian = references.custodians?.find((c) => String(c.id ?? c.ID) === custodianId)

  const items = Array.isArray(record.items)
    ? record.items.map((item, index) => {
        const itemId = text(item.itemId)
        const assetItem = references.assetItems?.find((a) => String(a.id ?? a.ID) === itemId)
        return {
          ID: text(item.id) || `item-${index + 1}`,
          GATE_PASS_ID: text(record.id),
          ITEM_NAME: itemId,
          ITEM_NAME_LABEL: assetItem ? (assetItem.itemName || assetItem.ITEM_NAME) : (item.itemName || `Item ${itemId}`),
          QUANTITY: text(item.quantity ?? ''),
          STATUS: text(item.status ?? 1),
        }
      })
    : []

  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    GATE_PASS_DATE: text(record.gatePassDate),
    GATE_PASS_NO: text(record.gatePassNo),
    SUPPLIER_ID: supplierId,
    SUPPLIER_NAME: record.supplierName || (supplier ? (supplier.supplierName || supplier.VENDOR_NAME) : ''),
    CUSTODIAN: custodianId,
    CUSTODIAN_NAME: record.custodianName || (custodian ? (custodian.custodianName || custodian.CUSTODIAN_NAME) : ''),
    REMARK: text(record.remark ?? ''),
    STATUS: text(record.status ?? 1),
    ITEMS: items,
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

export function mapGatePassToApi(values, items = [], scope = {}) {
  return {
    ...(values.ID ? { id: nullableNumber(values.ID) } : {}),
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    gatePassDate: values.GATE_PASS_DATE,
    gatePassNo: values.GATE_PASS_NO,
    supplierId: nullableNumber(values.SUPPLIER_ID),
    custodianId: nullableNumber(values.CUSTODIAN),
    remark: values.REMARK || '',
    status: Number(values.STATUS ?? 1),
    items: (items || []).map((row) => {
      const isExistingId = row.ID && !String(row.ID).startsWith('item-') && !String(row.ID).includes('-')
      return {
        ...(isExistingId ? { id: nullableNumber(row.ID) } : {}),
        itemId: nullableNumber(row.ITEM_NAME),
        quantity: nullableNumber(row.QUANTITY),
        status: Number(row.STATUS ?? 1),
      }
    }),
  }
}

