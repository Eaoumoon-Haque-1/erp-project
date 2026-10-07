/** @file Edit-page controller for Asset Disposal / Retirement. */
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetDisposalForm from '../components/AssetDisposalForm'
import { updateAssetDisposalField } from '../data/assetDisposalFormState'
import { getAssetDisposalReferences } from '../data/assetDisposalOptions'
import { getAssetDisposal, listAssetDisposals, updateAssetDisposal } from '../data/assetDisposalStore'
import { ASSET_DISPOSAL_TABLE, validateAssetDisposal } from '../validation/assetDisposalValidation'

const listPath = '/asset/asset-disposal-retirement'

function AssetDisposalEdit() {
  const { disposalId } = useParams()
  const navigate = useNavigate()
  const record = getAssetDisposal(disposalId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetDisposalReferences(listAssetDisposals(), record)
  if (!record || !values) return <Navigate to={listPath} replace />
  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => updateAssetDisposalField(current, name, value, references)); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const others = listAssetDisposals().filter((item) => item.ID !== record.ID); const result = validateAssetDisposal(values, others, references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; updateAssetDisposal(record.ID, result.values); navigate(listPath) }
  const handleReset = () => { setValues(record); setErrors({}); requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus()) }
  return <FormPage title={'Asset Disposal / Retirement Edit'} listTo={listPath} tableName={ASSET_DISPOSAL_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}><AssetDisposalForm values={values} errors={errors} references={references} onChange={handleChange} /></FormPage>
}

export default AssetDisposalEdit
