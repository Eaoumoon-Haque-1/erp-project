/** @file Active Asset, Vendor, and configured Maintenance Type references. */
import { listAssetItems } from '../../asset-item-information/data/assetItemInformationStore'
import { listAssetLookupValues } from '../../asset-lookup-value/data/assetLookupValueStore'
import { listVendorSuppliers } from '../../vendor-supplier-master/data/vendorSupplierMasterStore'

const fallbackMaintenanceTypes = [
  { value: 'PREVENTIVE_MAINTENANCE', label: 'Preventive Maintenance' },
  { value: 'CORRECTIVE_MAINTENANCE', label: 'Corrective Maintenance' },
  { value: 'AMC', label: 'AMC' },
  { value: 'WARRANTY_SERVICE', label: 'Warranty Service' },
]

export function getMaintenanceReferences() {
  const configuredTypes = listAssetLookupValues()
    .filter((record) => record.STATUS === '1' && record.TYPE_NAME.trim().toLowerCase() === 'maintenance type')
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.VALUE, configured: true }))

  return {
    assetItems: listAssetItems().filter((record) => record.STATUS === '1'),
    vendors: listVendorSuppliers().filter((record) => record.STATUS === '1'),
    maintenanceTypes: configuredTypes.length > 0 ? configuredTypes : fallbackMaintenanceTypes,
  }
}

export function maintenanceTypeRules(value, references) {
  const label = references.maintenanceTypes.find((option) => option.value === value)?.label.trim().toLowerCase() || ''
  return {
    requiresEndDate: label === 'amc' || label.includes('annual maintenance contract'),
    requiresNextDueDate: label === 'amc' || label.includes('annual maintenance contract') || label.includes('preventive'),
  }
}
