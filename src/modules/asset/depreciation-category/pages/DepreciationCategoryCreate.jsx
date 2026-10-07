/** @file Create controller for Depreciation Category. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import { departmentOptions } from '../../../hris/employee-information/data/employeeOptions'
import DepreciationCategoryForm from '../components/DepreciationCategoryForm'
import { getAssetTypeOptions, getDepreciationMethodOptions } from '../data/depreciationCategoryOptions'
import { createDepreciationCategory, listDepreciationCategories } from '../data/depreciationCategoryStore'
import { DEPRECIATION_CATEGORY_TABLE, initialDepreciationCategoryValues, validateDepreciationCategory } from '../validation/depreciationCategoryValidation'

const listPath = '/asset/depreciation-category'

function DepreciationCategoryCreate() {
  const navigate = useNavigate(); const categoryRef = useRef(null)
  const [values, setValues] = useState(initialDepreciationCategoryValues); const [errors, setErrors] = useState({})
  const methodOptions = getDepreciationMethodOptions(); const assetTypeOptions = getAssetTypeOptions()
  const change = (event) => { const { name, type, value, checked } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value, ...(name === 'DEPRI_METHOD' ? { DEPRI_METHOD_NAME: methodOptions.find((option) => option.value === value)?.label || '' } : {}), ...(name === 'ASSET_TYPE' ? { ASSET_TYPE_NAME: assetTypeOptions.find((option) => option.value === value)?.label || '' } : {}), ...(name === 'ASSET_OWNER' ? { ASSET_OWNER_NAME: departmentOptions.find((option) => option.value === value)?.label || '' } : {}) })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const submit = (event) => { event.preventDefault(); const result = validateDepreciationCategory(values, listDepreciationCategories()); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus()); return } createDepreciationCategory(result.values); navigate(listPath) }
  const reset = () => { setValues(initialDepreciationCategoryValues); setErrors({}); requestAnimationFrame(() => categoryRef.current?.focus()) }
  return <FormPage title={'Depreciation Category Create'} listTo={listPath} tableName={DEPRECIATION_CATEGORY_TABLE} onSubmit={submit} onReset={reset}><DepreciationCategoryForm values={values} errors={errors} methodOptions={methodOptions} assetTypeOptions={assetTypeOptions} departmentOptions={departmentOptions} categoryRef={categoryRef} onChange={change} /></FormPage>
}

export default DepreciationCategoryCreate

