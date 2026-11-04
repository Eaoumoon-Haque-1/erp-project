/** @file Active Asset Items, Vendors, and configured Maintenance Types for Maintenance / AMC. */
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { suppliersApi } from '../../../../api/supplier'
import { assetLookupValuesApi } from '../../asset-lookup-value/api/assetLookupValueApi'

export const fallbackMaintenanceTypes = [
  { value: 'PREVENTIVE_MAINTENANCE', label: 'Preventive Maintenance' },
  { value: 'CORRECTIVE_MAINTENANCE', label: 'Corrective Maintenance' },
  { value: 'AMC', label: 'AMC' },
  { value: 'WARRANTY_SERVICE', label: 'Warranty Service' },
]

export const maintenancePriorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

export function getInitialMaintenanceReferences() {
  return {
    assetItems: [],
    vendors: [],
    maintenanceTypes: fallbackMaintenanceTypes,
    priorities: maintenancePriorityOptions,
  }
}

function extractList(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

export async function loadMaintenanceReferences(buId) {
  const buIdParam = buId ? Number(buId) : undefined

  try {
    const [rawItems, rawSuppliers, rawLookupValues] = await Promise.all([
      assetItemsApi.list(buIdParam).catch(() => []),
      suppliersApi.list(buIdParam).catch(() => []),
      assetLookupValuesApi.list({ businessUnitId: buIdParam }).catch(() => []),
    ])

    const assetItems = extractList(rawItems)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const itemCode = r.itemCode || ''
        const itemName = r.itemName || ''
        const label = itemCode ? `${itemCode} - ${itemName}` : itemName || `Item ${id}`
        return { id, ID: id, value: id, itemCode, itemName, ITEM_NAME: itemName, label }
      })

    const vendors = extractList(rawSuppliers)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const supplierCode = r.supplierCode || r.vendorCode || ''
        const supplierName = r.supplierName || r.vendorName || ''
        const label = supplierCode ? `${supplierCode} - ${supplierName}` : supplierName || `Vendor ${id}`
        return {
          id,
          ID: id,
          value: id,
          supplierCode,
          VENDOR_CODE: supplierCode,
          supplierName,
          VENDOR_NAME: supplierName,
          label,
        }
      })

    const lookupList = extractList(rawLookupValues)
    const configuredTypes = lookupList
      .filter((r) => String(r.status ?? 1) === '1' && String(r.typeName || r.TYPE_NAME || '').trim().toLowerCase() === 'maintenance type')
      .sort((a, b) => Number(a.sortOrder || a.SORT_ORDER || 0) - Number(b.sortOrder || b.SORT_ORDER || 0))
      .map((r) => {
        const val = String(r.lookupValue || r.VALUE || r.value || '')
        return {
          value: val.toUpperCase().replace(/[\s-]+/g, '_'),
          label: val,
          configured: true,
        }
      })

    return {
      assetItems,
      vendors,
      maintenanceTypes: configuredTypes.length > 0 ? configuredTypes : fallbackMaintenanceTypes,
      priorities: maintenancePriorityOptions,
    }
  } catch {
    return {
      assetItems: [],
      vendors: [],
      maintenanceTypes: fallbackMaintenanceTypes,
      priorities: maintenancePriorityOptions,
    }
  }
}

export function maintenanceTypeRules(value, references = {}) {
  const typeList = references.maintenanceTypes || fallbackMaintenanceTypes
  const label = typeList.find((option) => option.value === value)?.label.trim().toLowerCase() || String(value || '').toLowerCase()
  return {
    requiresEndDate: label === 'amc' || label.includes('annual maintenance contract'),
    requiresNextDueDate: label === 'amc' || label.includes('annual maintenance contract') || label.includes('preventive'),
  }
}
