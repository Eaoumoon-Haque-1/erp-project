/** @file Cross-field derivation for the Asset Receive Register form. */
import { calculateDepreciationEndDate, calculateReceiveAmounts } from '../validation/assetReceiveRegisterValidation'
import { getItemSpecificationRows, getReceiveSubCustodians } from './assetReceiveRegisterOptions'

export function updateAssetReceiveField(current, field, rawValue, references) {
  let next = { ...current, [field]: rawValue }

  if (field === 'ITEM_NAME') {
    const item = references.assetItems.find((record) => record.ID === rawValue)
    next = {
      ...next,
      ITEM_NAME_LABEL: item?.ITEM_NAME || '',
      ITEM_GROUP: item?.ITEM_GROUP_NAME || '',
      UOM: item?.UOM || '',
      UOM_NAME: item?.UOM_NAME || '',
      DEPRI_METHOD: item?.DEPRI_METHOD || '',
      DEPRI_LIFE: item?.DEPRI_LIFE || '',
      DEPRI_PERCENTAGE: item?.DEPRI_PERCENTAGE || '',
      DEPRI_END_DATE: calculateDepreciationEndDate(next.DEPRI_START_DATE, item?.DEPRI_LIFE),
      SPECIFICATIONS: getItemSpecificationRows(rawValue, references),
    }
  }

  if (field === 'RECEIVED_BY_ID') {
    next.RECEIVED_BY_NAME = references.employees.find((record) => record.value === rawValue)?.name || ''
  }
  if (field === 'SUPPLIER_ID') {
    next.SUPPLIER_NAME = references.vendors.find((record) => record.ID === rawValue)?.VENDOR_NAME || ''
  }
  if (field === 'UOM') {
    next.UOM_NAME = references.uomOptions.find((option) => option.value === rawValue)?.label || ''
  }
  if (field === 'PURCHASE_THROUGH' && rawValue !== 'PURCHASE_ORDER') next.PO_NO = ''

  if (field === 'IS_W_G_APPLICABLE' && rawValue === 'NA') {
    next = { ...next, W_G_PERIOD: '', W_G_START_DATE: '', W_G_END_DATE: '', W_G_OTHER_INFO: '' }
  }

  if (field === 'CUSTODIAN_ID') {
    next = {
      ...next,
      CUSTODIAN_NAME: references.custodians.find((record) => record.ID === rawValue)?.CUSTODIAN_NAME || '',
      SUB_CUSTODIAN_ID: '',
      SUB_CUSTODIAN_NAME: '',
      LOCATION: '',
      LOCATION_NAME: '',
      BUILDING: '',
      FLOOR: '',
      ROOM: '',
    }
  }
  if (field === 'SUB_CUSTODIAN_ID') {
    next = {
      ...next,
      SUB_CUSTODIAN_NAME: getReceiveSubCustodians(current.CUSTODIAN_ID, references)
        .find((record) => record.ID === rawValue)?.SUB_CUSTODIAN_NAME || '',
      LOCATION: '',
      LOCATION_NAME: '',
      BUILDING: '',
      FLOOR: '',
      ROOM: '',
    }
  }
  if (field === 'LOCATION') {
    const location = references.locations.find((record) => record.ID === rawValue)
    next = {
      ...next,
      LOCATION_NAME: location?.LOCATION_NAME || '',
      BUILDING: location?.BUILDING || '',
      FLOOR: location?.FLOOR || '',
      ROOM: location?.ROOM || '',
    }
  }

  if (field === 'DEPRI_START_DATE') {
    next.DEPRI_END_DATE = calculateDepreciationEndDate(rawValue, next.DEPRI_LIFE)
  }
  if (['QTY', 'UNIT_PRICE', 'DISCOUNT', 'VAT_TAX', 'OTHER_CHARGES'].includes(field)) {
    Object.assign(next, calculateReceiveAmounts(next))
  }

  return next
}
