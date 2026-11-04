/** @file Reference options for Asset Repair (Asset Items, Vendors, Support Engineers). */
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { suppliersApi } from '../../../../api/supplier'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'

export function getInitialAssetRepairReferences() {
  return {
    assetItems: [],
    vendors: [],
    engineers: [],
  }
}

function extractList(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

export async function loadAssetRepairReferences(buId) {
  const buIdParam = buId ? Number(buId) : undefined

  try {
    const [rawItems, rawSuppliers, rawEmployees] = await Promise.all([
      assetItemsApi.list(buIdParam).catch(() => []),
      suppliersApi.list(buIdParam).catch(() => []),
      employeesApi.list(buIdParam).catch(() => []),
    ])

    const assetItems = extractList(rawItems)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const itemCode = r.itemCode || ''
        const itemName = r.itemName || ''
        const label = itemCode ? `${itemCode} - ${itemName}` : itemName || `Item ${id}`
        return {
          id,
          ID: id,
          value: id,
          itemCode,
          itemName,
          ITEM_NAME: itemName,
          label,
        }
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

    const engineers = extractList(rawEmployees)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const code = r.employeeCode || ''
        const name = r.fullName || r.employeeName || ''
        const label = code ? `${code} - ${name}` : name || `Employee ${id}`
        const engineerName = name || label || (id ? `Employee ${id}` : '')
        return {
          id,
          ID: id,
          value: engineerName,
          employeeCode: code,
          employeeName: name,
          name: engineerName,
          label,
        }
      })

    return {
      assetItems,
      vendors,
      engineers,
    }
  } catch {
    return getInitialAssetRepairReferences()
  }
}
