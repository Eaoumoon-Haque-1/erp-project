/** @file Selection population and live disposal financial calculations. */
import { calculateDisposalFinancials, valuesFromAssetOption } from './assetDisposalCalculations'

export function updateAssetDisposalField(current, name, value, references) {
  let next = { ...current, [name]: value }
  if (name === 'ASSET_RECORD_ID') {
    const option = references.eligibleAssets.find((record) => record.value === value)
    next = { ...next, ...valuesFromAssetOption(option), DISPOSAL_DATE: current.DISPOSAL_DATE, DISPOSAL_VALUE: current.DISPOSAL_VALUE }
  }
  if (name === 'DISPOSAL_TYPE') next.DISPOSAL_TYPE_NAME = references.disposalTypes.find((option) => option.value === value)?.label || ''
  if (name === 'REASON') next.REASON_NAME = references.reasons.find((option) => option.value === value)?.label || ''
  if (name === 'APPROVED_BY') {
    const approver = references.approvers.find((record) => record.value === value)
    next.APPROVED_BY_NAME = approver ? `${approver.employeeId} - ${approver.name}` : ''
  }
  if (['ASSET_RECORD_ID', 'DISPOSAL_DATE', 'DISPOSAL_VALUE'].includes(name)) Object.assign(next, calculateDisposalFinancials(next))
  return next
}
