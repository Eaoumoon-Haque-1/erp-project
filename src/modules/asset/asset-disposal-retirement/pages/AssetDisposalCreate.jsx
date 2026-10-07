/** @file Create-page controller for Asset Disposal / Retirement. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetDisposalForm from '../components/AssetDisposalForm'
import { updateAssetDisposalField } from '../data/assetDisposalFormState'
import { getAssetDisposalReferences } from '../data/assetDisposalOptions'
import { createAssetDisposal, listAssetDisposals } from '../data/assetDisposalStore'
import { ASSET_DISPOSAL_TABLE, createInitialAssetDisposalValues, validateAssetDisposal } from '../validation/assetDisposalValidation'

const listPath = '/asset/asset-disposal-retirement'

function AssetDisposalCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(createInitialAssetDisposalValues)
  const [errors, setErrors] = useState({})
  const references = getAssetDisposalReferences(listAssetDisposals())
  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => updateAssetDisposalField(current, name, value, references)); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const result = validateAssetDisposal(values, listAssetDisposals(), references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; createAssetDisposal(result.values); navigate(listPath) }
  const handleReset = () => { setValues(createInitialAssetDisposalValues()); setErrors({}); requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus()) }
  return <FormPage title={'Asset Disposal / Retirement Create'} listTo={listPath} tableName={ASSET_DISPOSAL_TABLE} onSubmit={handleSubmit} onReset={handleReset}><AssetDisposalForm values={values} errors={errors} references={references} onChange={handleChange} /></FormPage>
}

export default AssetDisposalCreate
