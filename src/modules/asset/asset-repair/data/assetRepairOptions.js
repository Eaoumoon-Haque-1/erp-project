/** @file Eligible physical assets, service vendors, and support engineers. */
import { reportingOfficerOptions } from '../../../hris/employee-information/data/employeeOptions'
import { listAssetReceives } from '../../asset-receive-register/data/assetReceiveRegisterStore'
import { listBulkAssetReceives } from '../../bulk-asset-receive-for-split/data/bulkAssetReceiveStore'
import { listVendorSuppliers } from '../../vendor-supplier-master/data/vendorSupplierMasterStore'

function toAssetOption(record, source) {
  return { value: `${source}:${record.ID}`, label: `${record.ASSET_NO} - ${record.ITEM_NAME_LABEL}`, source, receiveId: record.ID, record }
}

export function getAssetRepairReferences(existingRecords = [], currentRecord = null) {
  const openAssetKeys = new Set(existingRecords
    .filter((record) => record.STATUS === '1' && !record.DELIVERY_DATE && record.ID !== currentRecord?.ID)
    .map((record) => record.ASSET_RECORD_ID))
  const assets = [
    ...listAssetReceives().filter((record) => record.STATUS === '1' || (currentRecord?.ASSET_SOURCE === 'RECEIVE' && record.ID === currentRecord.ASSET_RECEIVE_ID)).map((record) => toAssetOption(record, 'RECEIVE')),
    ...listBulkAssetReceives().filter((record) => record.STATUS === '1' || (currentRecord?.ASSET_SOURCE === 'BULK' && record.ID === currentRecord.ASSET_RECEIVE_ID)).map((record) => toAssetOption(record, 'BULK')),
  ]
  return {
    eligibleAssets: assets.filter((option) => !openAssetKeys.has(option.value)),
    vendors: listVendorSuppliers().filter((record) => record.STATUS === '1'),
    engineers: reportingOfficerOptions,
  }
}
