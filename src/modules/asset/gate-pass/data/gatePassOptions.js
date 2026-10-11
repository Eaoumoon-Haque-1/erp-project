/** @file Active Supplier, Custodian, and Asset Item references used by Gate Pass. */
import { listAssetItems } from '../../asset-item-information/data/assetItemInformationStore'
import { listCustodians } from '../../custodian/data/custodianStore'
import { listVendorSuppliers } from '../../vendor-supplier-master/data/vendorSupplierMasterStore'

export function getGatePassReferences() {
  return {
    vendors: listVendorSuppliers().filter((record) => record.STATUS === '1'),
    custodians: listCustodians().filter((record) => record.STATUS === '1'),
    assetItems: listAssetItems().filter((record) => record.STATUS === '1'),
  }
}
