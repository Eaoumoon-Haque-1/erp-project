/** @file Two-way mapper between backend AssetAudit entity and frontend form state. */
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapAssetAuditFromApi(record = {}, references = {}) {
  const itemId = String(record.itemId ?? '')
  const itemOption = references.assetItems?.find((item) => String(item.id) === itemId)

  const approvedBy = record.approvedBy ? String(record.approvedBy) : ''
  const approverOption = references.approvers?.find((emp) => String(emp.id) === approvedBy)

  const disposalType = record.disposalType || ''
  const typeOption = references.disposalTypes?.find((type) => type.value === disposalType)

  const reason = record.reason || ''
  const reasonOption = references.reasons?.find((r) => r.value === reason)

  const disposalValue = record.disposalValue != null ? Number(record.disposalValue).toFixed(2) : '0.00'
  const writtenDownValue = record.writtenDownValue != null ? Number(record.writtenDownValue).toFixed(2) : '0.00'
  const gainOnDisposal = record.gainOnDisposal != null ? Number(record.gainOnDisposal).toFixed(2) : '0.00'
  const lossOnDisposal = record.lossOnDisposal != null ? Number(record.lossOnDisposal).toFixed(2) : '0.00'

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
    DISPOSAL_DATE: record.disposalDate || '',
    DISPOSAL_TYPE: disposalType,
    DISPOSAL_TYPE_NAME: typeOption?.label || disposalType,
    DISPOSAL_VALUE: disposalValue,
    WRITTEN_DOWN_VALUE: writtenDownValue,
    GAIN_ON_DISPOSAL: gainOnDisposal,
    LOSS_ON_DISPOSAL: lossOnDisposal,
    APPROVED_BY: approvedBy,
    APPROVED_BY_NAME: approverOption?.label || (approvedBy ? `Employee ${approvedBy}` : ''),
    REASON: reason,
    REASON_NAME: reasonOption?.label || reason,
    REMARK: record.remark || '',
    DISPOSAL_STATUS: record.disposalStatus || 'DRAFT',
    STATUS: String(record.status ?? 1),

    // Audit trail
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

export function mapAssetAuditToApi(values = {}, scope = {}) {
  const recordId = scope.id ?? values.id ?? values.ID
  const itemId = values.ASSET_RECORD_ID ?? values.itemId ?? values.ITEM_ID
  const disposalValue = Number(values.DISPOSAL_VALUE || 0)
  const writtenDownValue = Number(values.WRITTEN_DOWN_VALUE || 0)
  const gainOnDisposal = Number(values.GAIN_ON_DISPOSAL || 0)
  const lossOnDisposal = Number(values.LOSS_ON_DISPOSAL || 0)

  const payload = {
    ...(recordId != null && recordId !== '' ? { id: nullableNumber(recordId) } : {}),
    bgId: nullableNumber(scope.bgId ?? values.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.buId ?? values.BU_ID),
    itemId: nullableNumber(itemId),
    disposalDate: values.DISPOSAL_DATE || null,
    disposalType: values.DISPOSAL_TYPE || null,
    disposalValue,
    writtenDownValue,
    gainOnDisposal,
    lossOnDisposal,
    approvedBy: nullableNumber(values.APPROVED_BY),
    reason: values.REASON || null,
    remark: values.REMARK ? String(values.REMARK).trim() : '',
    disposalStatus: values.DISPOSAL_STATUS || 'DRAFT',
    status: Number(values.STATUS ?? 1),
  }

  // Preserve creation audit timestamps on update if present
  if (values.createdUserId != null) payload.createdUserId = nullableNumber(values.createdUserId)
  if (values.createdEmpId != null) payload.createdEmpId = nullableNumber(values.createdEmpId)
  if (values.createdDatetime) payload.createdDatetime = values.createdDatetime
  if (values.createdApp) payload.createdApp = values.createdApp

  return payload
}
