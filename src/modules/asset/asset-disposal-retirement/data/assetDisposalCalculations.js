/** @file Receive-derived disposal information and straight-line calculations. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat.js'

function money(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

export function calculateDisposalFinancials(values) {
  const purchasePrice = money(values.PURCHASE_PRICE)
  const disposalValue = money(values.DISPOSAL_VALUE)
  const startDate = parseIsoDate(values.DEPRI_START_DATE)
  const disposalDate = parseIsoDate(values.DISPOSAL_DATE)
  const depreciationEndDate = parseIsoDate(values.DEPRI_END_DATE)
  const calculationEnd = disposalDate && depreciationEndDate && disposalDate > depreciationEndDate ? depreciationEndDate : disposalDate
  let annualRate = money(values.DEPRI_PERCENTAGE) / 100
  if (!annualRate && Number(values.DEPRI_LIFE) > 0) annualRate = 12 / Number(values.DEPRI_LIFE)

  let accumulated = 0
  if (startDate && calculationEnd && calculationEnd > startDate && annualRate > 0) {
    const elapsedDays = (calculationEnd - startDate) / 86400000
    accumulated = Math.min(purchasePrice, purchasePrice * annualRate * (elapsedDays / 365))
  }
  const writtenDown = Math.max(0, purchasePrice - accumulated)
  const difference = disposalValue - writtenDown
  return {
    TOTAL_DEPRECIATION_VALUE: accumulated.toFixed(2),
    WRITTEN_DOWN_VALUE: writtenDown.toFixed(2),
    GAIN_ON_DISPOSAL: Math.max(0, difference).toFixed(2),
    LOSS_ON_DISPOSAL: Math.max(0, -difference).toFixed(2),
  }
}

export function valuesFromAssetOption(option) {
  const record = option?.record
  if (!record) return {}
  const purchasePrice = money(record.CAPITALIZED_COST || record.UNIT_PRICE).toFixed(2)
  const base = {
    ASSET_RECORD_ID: option.value, ASSET_SOURCE: option.source, ASSET_RECEIVE_ID: option.receiveId,
    ASSET_NO: record.ASSET_NO || '', ITEM_NAME: record.ITEM_NAME || '', ITEM_NAME_LABEL: record.ITEM_NAME_LABEL || '',
    PURCHASE_DATE: record.PURCHASE_DATE || record.GRN_DATE || '', PURCHASE_PRICE: purchasePrice, GL_DATE: record.GRN_DATE || '',
    DEPRI_START_DATE: record.DEPRI_START_DATE || '', DEPRI_END_DATE: record.DEPRI_END_DATE || '',
    DEPRI_PERCENTAGE: record.DEPRI_PERCENTAGE || '', DEPRI_LIFE: record.DEPRI_LIFE || '',
  }
  return { ...base, ...calculateDisposalFinancials(base) }
}

export function todayIso() {
  return formatIsoDate(new Date())
}
