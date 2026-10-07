/** @file Edit-page controller for Asset Return from Employee. */
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetReturnEmployeeForm from '../components/AssetReturnEmployeeForm'
import { updateAssetReturnField } from '../data/assetReturnEmployeeFormState'
import { getAssetReturnReferences } from '../data/assetReturnEmployeeOptions'
import { getAssetReturn, listAssetReturns, updateAssetReturn } from '../data/assetReturnEmployeeStore'
import { ASSET_ITEM_RETURN_TABLE, validateAssetReturn } from '../validation/assetReturnEmployeeValidation'

const listPath = '/asset/asset-return-from-employee'

function AssetReturnEmployeeEdit() {
  const { assetReturnId } = useParams()
  const navigate = useNavigate()
  const record = getAssetReturn(assetReturnId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetReturnReferences(record?.ASSET_ASSIGNMENT_ID)

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetReturnField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const otherReturns = listAssetReturns().filter((item) => item.ID !== record.ID)
    const result = validateAssetReturn(values, otherReturns, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    updateAssetReturn(record.ID, result.values)
    navigate(listPath)
  }
  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ASSET_ASSIGNMENT_ID')?.focus())
  }

  return (
    <FormPage title={'Asset Return from Employee Edit'} listTo={listPath} tableName={ASSET_ITEM_RETURN_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetReturnEmployeeForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetReturnEmployeeEdit
