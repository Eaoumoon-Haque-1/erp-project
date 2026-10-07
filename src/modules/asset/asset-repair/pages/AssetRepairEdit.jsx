/** @file Edit-page controller for Asset Repair. */
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetRepairForm from '../components/AssetRepairForm'
import { updateAssetRepairField } from '../data/assetRepairFormState'
import { getAssetRepairReferences } from '../data/assetRepairOptions'
import { getAssetRepair, listAssetRepairs, updateAssetRepair } from '../data/assetRepairStore'
import { ASSET_REPAIR_TABLE, validateAssetRepair } from '../validation/assetRepairValidation'

const listPath = '/asset/asset-repair'

function AssetRepairEdit() {
  const { repairId } = useParams()
  const navigate = useNavigate()
  const record = getAssetRepair(repairId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetRepairReferences(listAssetRepairs(), record)
  if (!record || !values) return <Navigate to={listPath} replace />
  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => updateAssetRepairField(current, name, value, references)); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const others = listAssetRepairs().filter((item) => item.ID !== record.ID); const result = validateAssetRepair(values, others, references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; updateAssetRepair(record.ID, result.values); navigate(listPath) }
  const handleReset = () => { setValues(record); setErrors({}); requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus()) }
  return <FormPage title={'Asset Repair Edit'} listTo={listPath} tableName={ASSET_REPAIR_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}><AssetRepairForm values={values} errors={errors} references={references} onChange={handleChange} /></FormPage>
}

export default AssetRepairEdit
