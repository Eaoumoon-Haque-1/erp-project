/** @file Edit controller for Depreciation Category temporary records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import { departmentOptions } from '../../../hris/employee-information/data/employeeOptions'
import DepreciationCategoryForm from '../components/DepreciationCategoryForm'
import { getAssetTypeOptions, getDepreciationMethodOptions } from '../data/depreciationCategoryOptions'
import { getDepreciationCategory, listDepreciationCategories, updateDepreciationCategory } from '../data/depreciationCategoryStore'
import { DEPRECIATION_CATEGORY_TABLE, validateDepreciationCategory } from '../validation/depreciationCategoryValidation'

const listPath = '/asset/depreciation-category'

function DepreciationCategoryEdit() {
  const { depreciationCategoryId } = useParams(); const navigate = useNavigate(); const categoryRef = useRef(null)
  const record = getDepreciationCategory(depreciationCategoryId); const [values, setValues] = useState(record); const [errors, setErrors] = useState({})
  const methodOptions = getDepreciationMethodOptions(); const assetTypeOptions = getAssetTypeOptions()
  if (!record || !values) return <Navigate to={listPath} replace />
  const change = (event) => { const { name, type, value, checked } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value, ...(name === 'DEPRI_METHOD' ? { DEPRI_METHOD_NAME: methodOptions.find((option) => option.value === value)?.label || '' } : {}), ...(name === 'ASSET_TYPE' ? { ASSET_TYPE_NAME: assetTypeOptions.find((option) => option.value === value)?.label || '' } : {}), ...(name === 'ASSET_OWNER' ? { ASSET_OWNER_NAME: departmentOptions.find((option) => option.value === value)?.label || '' } : {}) })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const submit = (event) => { event.preventDefault(); const others = listDepreciationCategories().filter((item) => item.ID !== record.ID); const result = validateDepreciationCategory(values, others); setValues({ ...values, ...result.values }); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus()); return } updateDepreciationCategory(record.ID, result.values); navigate(listPath) }
  const reset = () => { setValues(record); setErrors({}); requestAnimationFrame(() => categoryRef.current?.focus()) }
  return <FormPage title={'Depreciation Category Edit'} listTo={listPath} tableName={DEPRECIATION_CATEGORY_TABLE} submitLabel={'Update'} onSubmit={submit} onReset={reset}><DepreciationCategoryForm values={values} errors={errors} methodOptions={methodOptions} assetTypeOptions={assetTypeOptions} departmentOptions={departmentOptions} categoryRef={categoryRef} onChange={change} /></FormPage>
}

export default DepreciationCategoryEdit

