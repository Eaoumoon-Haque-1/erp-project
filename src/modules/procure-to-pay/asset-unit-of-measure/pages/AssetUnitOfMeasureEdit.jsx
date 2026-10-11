/** @file Edit-page controller for Unit of Measure (UOM). */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetUnitOfMeasureForm from '../components/AssetUnitOfMeasureForm'
import { getAssetUnitOfMeasure, listAssetUnitsOfMeasure, updateAssetUnitOfMeasure } from '../data/assetUnitOfMeasureStore'
import { ASSET_UNIT_OF_MEASURE_TABLE, validateAssetUnitOfMeasure } from '../validation/assetUnitOfMeasureValidation'

const listPath = '/procure-to-pay/procurement-settings/asset-unit-of-measure'

function AssetUnitOfMeasureEdit() {
  const { assetUnitOfMeasureId } = useParams()
  const navigate = useNavigate()
  const unitNameRef = useRef(null)
  const record = getAssetUnitOfMeasure(assetUnitOfMeasureId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  if (!record || !values) return <Navigate to={listPath} replace />
  const handleChange = (event) => { const { name, type, value, checked } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const others = listAssetUnitsOfMeasure().filter((item) => item.ID !== record.ID); const result = validateAssetUnitOfMeasure(values, others); setValues({ ...values, ...result.values }); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; updateAssetUnitOfMeasure(record.ID, result.values); navigate(listPath) }
  const handleReset = () => { setValues(record); setErrors({}); requestAnimationFrame(() => unitNameRef.current?.focus()) }
  return <FormPage title={'Unit of Measure (UOM) Edit'} listTo={listPath} tableName={ASSET_UNIT_OF_MEASURE_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}><AssetUnitOfMeasureForm values={values} errors={errors} unitNameRef={unitNameRef} onChange={handleChange} /></FormPage>
}

export default AssetUnitOfMeasureEdit
