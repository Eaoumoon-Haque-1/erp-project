/** @file Selection population and live financial calculations for Asset Audit. */
import { updateAssetDisposalField } from '../../asset-disposal-retirement/data/assetDisposalFormState'

export function updateAssetAuditField(current, name, value, references) {
  return updateAssetDisposalField(current, name, value, references)
}
