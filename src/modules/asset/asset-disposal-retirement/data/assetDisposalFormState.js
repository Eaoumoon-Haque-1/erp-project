/** @file Selection population and live disposal financial calculations. */

export function calculateDisposalFinancials(disposalValueStr, writtenDownValueStr) {
  const disposalValue = Number(disposalValueStr || 0)
  const writtenDownValue = Number(writtenDownValueStr || 0)

  if (Number.isNaN(disposalValue) || Number.isNaN(writtenDownValue)) {
    return { GAIN_ON_DISPOSAL: '0.00', LOSS_ON_DISPOSAL: '0.00' }
  }

  const diff = disposalValue - writtenDownValue
  if (diff > 0) {
    return {
      GAIN_ON_DISPOSAL: diff.toFixed(2),
      LOSS_ON_DISPOSAL: '0.00',
    }
  }

  if (diff < 0) {
    return {
      GAIN_ON_DISPOSAL: '0.00',
      LOSS_ON_DISPOSAL: Math.abs(diff).toFixed(2),
    }
  }

  return {
    GAIN_ON_DISPOSAL: '0.00',
    LOSS_ON_DISPOSAL: '0.00',
  }
}

export function updateAssetDisposalField(current, name, value, references = {}) {
  const next = { ...current, [name]: value }

  if (name === 'ASSET_RECORD_ID') {
    const list = references.eligibleAssets || references.assetItems || []
    const selected = list.find((item) => String(item.id) === String(value) || String(item.value) === String(value))
    next.ITEM_NAME_LABEL = selected?.label || ''
  }

  if (name === 'DISPOSAL_TYPE') {
    const selected = references.disposalTypes?.find((type) => type.value === value)
    next.DISPOSAL_TYPE_NAME = selected?.label || value
  }

  if (name === 'REASON') {
    const selected = references.reasons?.find((r) => r.value === value)
    next.REASON_NAME = selected?.label || value
  }

  if (name === 'APPROVED_BY') {
    const selected = references.approvers?.find(
      (emp) => String(emp.id) === String(value) || String(emp.value) === String(value),
    )
    next.APPROVED_BY_NAME = selected?.label || ''
  }

  if (name === 'DISPOSAL_VALUE' || name === 'WRITTEN_DOWN_VALUE') {
    const financials = calculateDisposalFinancials(
      name === 'DISPOSAL_VALUE' ? value : next.DISPOSAL_VALUE,
      name === 'WRITTEN_DOWN_VALUE' ? value : next.WRITTEN_DOWN_VALUE,
    )
    Object.assign(next, financials)
  }

  return next
}
