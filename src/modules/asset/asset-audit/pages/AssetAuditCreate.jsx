/** @file Create-page controller for Asset Audit. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetAuditForm from '../components/AssetAuditForm'
import { updateAssetAuditField } from '../data/assetAuditFormState'
import { getAssetAuditReferences } from '../data/assetAuditOptions'
import { createAssetAudit, listAssetAudits } from '../data/assetAuditStore'
import { ASSET_AUDIT_TABLE, createInitialAssetAuditValues, validateAssetAudit } from '../validation/assetAuditValidation'

const listPath = '/asset/asset-audit'

function AssetAuditCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(createInitialAssetAuditValues)
  const [errors, setErrors] = useState({})
  const references = getAssetAuditReferences(listAssetAudits())
  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => updateAssetAuditField(current, name, value, references)); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const result = validateAssetAudit(values, listAssetAudits(), references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; createAssetAudit(result.values); navigate(listPath) }
  const handleReset = () => { setValues(createInitialAssetAuditValues()); setErrors({}); requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus()) }
  return <FormPage title={'Asset Audit Create'} listTo={listPath} tableName={ASSET_AUDIT_TABLE} onSubmit={handleSubmit} onReset={handleReset}><AssetAuditForm values={values} errors={errors} references={references} onChange={handleChange} /></FormPage>
}

export default AssetAuditCreate
