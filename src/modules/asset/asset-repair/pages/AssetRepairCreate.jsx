/** @file Create-page controller for Asset Repair. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetRepairForm from '../components/AssetRepairForm'
import { updateAssetRepairField } from '../data/assetRepairFormState'
import { getAssetRepairReferences } from '../data/assetRepairOptions'
import { createAssetRepair, listAssetRepairs } from '../data/assetRepairStore'
import { ASSET_REPAIR_TABLE, createInitialAssetRepairValues, validateAssetRepair } from '../validation/assetRepairValidation'

const listPath = '/asset/asset-repair'

function AssetRepairCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(createInitialAssetRepairValues)
  const [errors, setErrors] = useState({})
  const references = getAssetRepairReferences(listAssetRepairs())
  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => updateAssetRepairField(current, name, value, references)); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const result = validateAssetRepair(values, listAssetRepairs(), references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; createAssetRepair(result.values); navigate(listPath) }
  const handleReset = () => { setValues(createInitialAssetRepairValues()); setErrors({}); requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus()) }
  return <FormPage title={'Asset Repair Create'} listTo={listPath} tableName={ASSET_REPAIR_TABLE} onSubmit={handleSubmit} onReset={handleReset}><AssetRepairForm values={values} errors={errors} references={references} onChange={handleChange} /></FormPage>
}

export default AssetRepairCreate
