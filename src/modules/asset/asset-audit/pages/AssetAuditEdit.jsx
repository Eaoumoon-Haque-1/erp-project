/** @file Edit-page controller for Asset Audit. */
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetAuditForm from '../components/AssetAuditForm'
import { updateAssetAuditField } from '../data/assetAuditFormState'
import { getAssetAuditReferences } from '../data/assetAuditOptions'
import { getAssetAudit, listAssetAudits, updateAssetAudit } from '../data/assetAuditStore'
import { ASSET_AUDIT_TABLE, validateAssetAudit } from '../validation/assetAuditValidation'

const listPath = '/asset/asset-audit'

function AssetAuditEdit() {
  const { assetAuditId } = useParams()
  const navigate = useNavigate()
  const record = getAssetAudit(assetAuditId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetAuditReferences(listAssetAudits(), record)
  if (!record || !values) return <Navigate to={listPath} replace />
  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => updateAssetAuditField(current, name, value, references)); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const others = listAssetAudits().filter((item) => item.ID !== record.ID); const result = validateAssetAudit(values, others, references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; updateAssetAudit(record.ID, result.values); navigate(listPath) }
  const handleReset = () => { setValues(record); setErrors({}); requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus()) }
  return <FormPage title={'Asset Audit Edit'} listTo={listPath} tableName={ASSET_AUDIT_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}><AssetAuditForm values={values} errors={errors} references={references} onChange={handleChange} /></FormPage>
}

export default AssetAuditEdit
