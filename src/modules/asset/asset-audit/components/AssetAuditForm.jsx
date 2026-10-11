/**
 * @file Asset Audit form.
 * The approved workbook intentionally uses the same fields and layout as Asset Disposal.
 */
import AssetDisposalForm from '../../asset-disposal-retirement/components/AssetDisposalForm'

function AssetAuditForm(props) {
  return <AssetDisposalForm {...props} />
}

export default AssetAuditForm
