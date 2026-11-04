/** @file Active Supplier, Custodian, and Asset Item references used by Gate Pass. */
import { suppliersApi } from '../../../../api/supplier'
import { custodiansApi } from '../../../../api/custodian'
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'

export function getInitialGatePassReferences() {
  return {
    vendors: [],
    custodians: [],
    assetItems: [],
  }
}

export async function loadGatePassReferences(buId) {
  try {
    const [vendors, custodians, assetItems] = await Promise.all([
      suppliersApi.list(buId).catch(() => []),
      custodiansApi.list(buId).catch(() => []),
      assetItemsApi.list(buId).catch(() => []),
    ])

    return {
      vendors: (vendors || [])
        .filter((r) => String(r.status ?? 1) === '1')
        .map((r) => ({
          id: String(r.id),
          ID: String(r.id),
          supplierCode: r.supplierCode || r.vendorCode || '',
          VENDOR_CODE: r.supplierCode || r.vendorCode || '',
          supplierName: r.supplierName || r.vendorName || '',
          VENDOR_NAME: r.supplierName || r.vendorName || '',
        })),
      custodians: (custodians || [])
        .filter((r) => String(r.status ?? 1) === '1')
        .map((r) => ({
          id: String(r.id),
          ID: String(r.id),
          custodianName: r.custodianName || '',
          CUSTODIAN_NAME: r.custodianName || '',
        })),
      assetItems: (assetItems || [])
        .filter((r) => String(r.status ?? 1) === '1')
        .map((r) => ({
          id: String(r.id),
          ID: String(r.id),
          itemName: r.itemName || '',
          ITEM_NAME: r.itemName || '',
        })),
    }
  } catch {
    return { vendors: [], custodians: [], assetItems: [] }
  }
}
