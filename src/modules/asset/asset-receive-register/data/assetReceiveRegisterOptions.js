/** @file Active reference data and dependent option helpers for Asset Receive Register. */
import { reportingOfficerOptions } from '../../../hris/employee-information/data/employeeOptions'
import { listAssetItems } from '../../asset-item-information/data/assetItemInformationStore'
import { listAssetSpecificationMaps } from '../../asset-specification-map/data/assetSpecificationMapStore'
import { listCustodians } from '../../custodian/data/custodianStore'
import { listLocationMasters } from '../../location-master/data/locationMasterStore'
import { listVendorSuppliers } from '../../vendor-supplier-master/data/vendorSupplierMasterStore'
import { listAssetUnitsOfMeasure } from '../../../procure-to-pay/asset-unit-of-measure/data/assetUnitOfMeasureStore'

export const purchaseThroughOptions = [
  { value: 'DIRECT', label: 'Direct Purchase' },
  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
  { value: 'DONATION', label: 'Donation' },
  { value: 'TRANSFER', label: 'Transfer' },
]

export const currencyOptions = [
  { value: 'BDT', label: 'BDT' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

export const warrantyOptions = [
  { value: 'WARRANTY', label: 'Warranty' },
  { value: 'GUARANTY', label: 'Guaranty' },
  { value: 'NA', label: 'N/A' },
]

export function getAssetReceiveReferences() {
  const uomOptions = listAssetUnitsOfMeasure()
    .filter((record) => record.STATUS === '1')
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.UNIT_NAME }))

  return {
    employees: reportingOfficerOptions,
    assetItems: listAssetItems().filter((record) => record.STATUS === '1'),
    vendors: listVendorSuppliers().filter((record) => record.STATUS === '1'),
    custodians: listCustodians().filter((record) => record.STATUS === '1'),
    locations: listLocationMasters().filter((record) => record.STATUS === '1'),
    specificationMaps: listAssetSpecificationMaps().filter((record) => record.STATUS === '1'),
    uomOptions,
    purchaseThroughOptions,
    currencyOptions,
    warrantyOptions,
  }
}

export function getReceiveSubCustodians(custodianId, references) {
  return references.custodians
    .find((record) => record.ID === String(custodianId))
    ?.SUB_CUSTODIANS.filter((record) => record.STATUS === '1') ?? []
}

export function getReceiveLocations(custodianId, subCustodianId, references) {
  return references.locations.filter((record) => (
    record.CUSTODIAN_ID === String(custodianId)
    && record.SUB_CUSTODIAN_ID === String(subCustodianId)
  ))
}

export function getItemSpecificationRows(itemId, references, previousRows = []) {
  const previousValues = new Map(previousRows.map((row) => [row.SPECIFICATION_ID, row.EQUIPMENT_VALUE]))
  return references.specificationMaps
    .filter((record) => record.ITEM_NAME === String(itemId))
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({
      SPECIFICATION_ID: record.SPECIFICATION,
      EQUIPMENT_NAME: record.SPECIFICATION_NAME,
      EQUIPMENT_VALUE: previousValues.get(record.SPECIFICATION) || '',
    }))
}
