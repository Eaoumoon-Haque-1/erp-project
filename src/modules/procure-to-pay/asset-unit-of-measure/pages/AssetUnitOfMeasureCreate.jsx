/** @file Create-page controller for Unit of Measure (UOM). */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import AssetUnitOfMeasureForm from '../components/AssetUnitOfMeasureForm'
import { createAssetUnitOfMeasure, listAssetUnitsOfMeasure } from '../data/assetUnitOfMeasureStore'
import { ASSET_UNIT_OF_MEASURE_TABLE, createInitialAssetUnitOfMeasureValues, validateAssetUnitOfMeasure } from '../validation/assetUnitOfMeasureValidation'

const listPath = '/procure-to-pay/procurement-settings/asset-unit-of-measure'

function AssetUnitOfMeasureCreate() {
  const navigate = useNavigate()
  const unitNameRef = useRef(null)
  const [values, setValues] = useState(() => ({ ...createInitialAssetUnitOfMeasureValues(currentUser.businessGroup), SORT_ORDER: getNextSortOrder(listAssetUnitsOfMeasure()) }))
  const [errors, setErrors] = useState({})
  const handleChange = (event) => { const { name, type, value, checked } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleSubmit = (event) => { event.preventDefault(); const result = validateAssetUnitOfMeasure(values, listAssetUnitsOfMeasure()); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; createAssetUnitOfMeasure(result.values); navigate(listPath) }
  const handleReset = () => { setValues({ ...createInitialAssetUnitOfMeasureValues(currentUser.businessGroup), SORT_ORDER: getNextSortOrder(listAssetUnitsOfMeasure()) }); setErrors({}); requestAnimationFrame(() => unitNameRef.current?.focus()) }
  return <FormPage title={'Unit of Measure (UOM) Create'} listTo={listPath} tableName={ASSET_UNIT_OF_MEASURE_TABLE} onSubmit={handleSubmit} onReset={handleReset}><AssetUnitOfMeasureForm values={values} errors={errors} unitNameRef={unitNameRef} onChange={handleChange} /></FormPage>
}

export default AssetUnitOfMeasureCreate
