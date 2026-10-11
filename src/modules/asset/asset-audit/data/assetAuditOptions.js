/** @file Asset Audit references; workbook rules match the Asset Disposal workflow. */
import { getAssetDisposalReferences } from '../../asset-disposal-retirement/data/assetDisposalOptions'

export function getAssetAuditReferences(existingRecords = [], currentRecord = null) {
  return getAssetDisposalReferences(existingRecords, currentRecord)
}
