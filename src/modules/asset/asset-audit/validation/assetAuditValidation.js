/** @file ASSET_AUDIT defaults and validation rules; aligned with the workbook's Disposal rules. */
import { createInitialAssetDisposalValues, validateAssetDisposal } from '../../asset-disposal-retirement/validation/assetDisposalValidation'

export const ASSET_AUDIT_TABLE = 'ASSET_AUDIT'

export function createInitialAssetAuditValues() {
  return createInitialAssetDisposalValues()
}

export function validateAssetAudit(values, existingRecords = [], references = {}) {
  return validateAssetDisposal(values, existingRecords, references)
}
