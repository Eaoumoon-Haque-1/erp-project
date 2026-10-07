/** @file Create-page controller for Asset Return from Employee. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetReturnEmployeeForm from '../components/AssetReturnEmployeeForm'
import { updateAssetReturnField } from '../data/assetReturnEmployeeFormState'
import { getAssetReturnReferences } from '../data/assetReturnEmployeeOptions'
import { createAssetReturn, listAssetReturns } from '../data/assetReturnEmployeeStore'
import { ASSET_ITEM_RETURN_TABLE, createInitialAssetReturnValues, validateAssetReturn } from '../validation/assetReturnEmployeeValidation'

const listPath = '/asset/asset-return-from-employee'

function AssetReturnEmployeeCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(createInitialAssetReturnValues)
  const [errors, setErrors] = useState({})
  const references = getAssetReturnReferences()

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetReturnField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateAssetReturn(values, listAssetReturns(), references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createAssetReturn(result.values)
    navigate(listPath)
  }
  const handleReset = () => {
    setValues(createInitialAssetReturnValues())
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ASSET_ASSIGNMENT_ID')?.focus())
  }

  return (
    <FormPage title={'Asset Return from Employee Create'} listTo={listPath} tableName={ASSET_ITEM_RETURN_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetReturnEmployeeForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetReturnEmployeeCreate
