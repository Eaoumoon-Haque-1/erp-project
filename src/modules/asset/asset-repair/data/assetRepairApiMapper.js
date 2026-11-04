/** @file Two-way mapper between backend AssetRepair entity and frontend form state. */
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapAssetRepairFromApi(record = {}, references = {}) {
  const itemId = String(record.itemId ?? '')
  const itemOption = references.assetItems?.find((item) => String(item.id) === itemId)

  const receiveId = String(record.receiveId ?? '')
  const vendorOption = references.vendors?.find((v) => String(v.id) === receiveId)

  const engineerVal = String(record.supportEngineer ?? '').trim()
  const engineerOption = references.engineers?.find(
    (e) => String(e.id) === engineerVal ||
      e.name === engineerVal ||
      e.value === engineerVal ||
      e.label === engineerVal,
  )

  const supportEngineerResolved = engineerOption ? engineerOption.value : engineerVal
  const supportEngineerName = engineerOption?.label || engineerOption?.name || engineerVal || 'N/A'

  return {
    id: record.id,
    ID: record.id ? String(record.id) : '',
    bgId: record.bgId,
    BG_ID: record.bgId ? String(record.bgId) : '',
    buId: record.buId,
    BU_ID: record.buId ? String(record.buId) : '',
    itemId: record.itemId,
    ASSET_RECORD_ID: itemId,
    ITEM_NAME_LABEL: itemOption?.label || (itemId ? `Item ${itemId}` : ''),
    RECEIVE_DATE: record.receiveDate || '',
    RECEIVE_ID: receiveId,
    RECEIVE_BY_NAME: vendorOption?.label || vendorOption?.supplierName || (receiveId ? `Vendor ${receiveId}` : ''),
    PROB_SPEC: record.probSpec || '',
    SUPPORT_ENGINEER: supportEngineerResolved,
    SUPPORT_ENGINEER_NAME: supportEngineerName,
    START_DATE: record.startDate || '',
    FINISH_DATE: record.finishDate || '',
    DELIVERY_DATE: record.deliveryDate || '',
    REMARK: record.remark || '',
    STATUS: String(record.status ?? 1),

    // Audit fields
    createdUserId: record.createdUserId,
    createdEmpId: record.createdEmpId,
    createdDatetime: record.createdDatetime,
    updatedUserId: record.updatedUserId,
    updatedEmpId: record.updatedEmpId,
    updatedDatetime: record.updatedDatetime,
    createdApp: record.createdApp,
    updatedApp: record.updatedApp,
  }
}

export function mapAssetRepairToApi(values = {}, scope = {}, references = {}) {
  const recordId = scope.id ?? values.id ?? values.ID
  const itemId = values.ASSET_RECORD_ID ?? values.itemId ?? values.ITEM_ID
  const receiveId = values.RECEIVE_ID ?? values.receiveId

  let supportEngineer = values.SUPPORT_ENGINEER ? String(values.SUPPORT_ENGINEER).trim() : null
  if (supportEngineer) {
    // If an ID was stored (e.g. "2" which fails min=2 chars), resolve to the engineer's name
    if (supportEngineer.length < 2) {
      const matched = references.engineers?.find(
        (e) => String(e.id) === supportEngineer || e.value === supportEngineer,
      )
      if (matched?.name) {
        supportEngineer = matched.name
      } else {
        supportEngineer = `Engineer ${supportEngineer}`
      }
    }
    // Backend @Size(max = 100)
    if (supportEngineer.length > 100) {
      supportEngineer = supportEngineer.slice(0, 100)
    }
  }

  const payload = {
    ...(recordId != null && recordId !== '' ? { id: nullableNumber(recordId) } : {}),
    bgId: nullableNumber(scope.bgId ?? values.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.buId ?? values.BU_ID),
    itemId: nullableNumber(itemId),
    receiveDate: values.RECEIVE_DATE || null,
    receiveId: nullableNumber(receiveId),
    probSpec: values.PROB_SPEC ? String(values.PROB_SPEC).trim() : null,
    supportEngineer,
    startDate: values.START_DATE || null,
    finishDate: values.FINISH_DATE || null,
    deliveryDate: values.DELIVERY_DATE || null,
    remark: values.REMARK ? String(values.REMARK).trim() : '',
    status: Number(values.STATUS ?? 1),
  }

  // Preserve creation audit timestamps on update if present
  if (values.createdUserId != null) payload.createdUserId = nullableNumber(values.createdUserId)
  if (values.createdEmpId != null) payload.createdEmpId = nullableNumber(values.createdEmpId)
  if (values.createdDatetime) payload.createdDatetime = values.createdDatetime
  if (values.createdApp) payload.createdApp = values.createdApp

  return payload
}
