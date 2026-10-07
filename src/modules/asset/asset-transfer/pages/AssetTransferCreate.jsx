/** @file Create-page controller for Asset Transfer. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetTransferForm from '../components/AssetTransferForm'
import { updateAssetTransferField } from '../data/assetTransferFormState'
import { getAssetTransferReferences } from '../data/assetTransferOptions'
import { createAssetTransfer, listAssetTransfers } from '../data/assetTransferStore'
import { ASSET_TRANSFER_TABLE, createInitialAssetTransferValues, validateAssetTransfer } from '../validation/assetTransferValidation'

const listPath = '/asset/asset-transfer'

function AssetTransferCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(createInitialAssetTransferValues)
  const [errors, setErrors] = useState({})
  const references = getAssetTransferReferences(listAssetTransfers())

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetTransferField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateAssetTransfer(values, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createAssetTransfer(result.values)
    navigate(listPath)
  }
  const handleReset = () => {
    setValues(createInitialAssetTransferValues())
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ASSET_ASSIGNMENT_ID')?.focus())
  }

  return (
    <FormPage title={'Asset Transfer Create'} listTo={listPath} tableName={ASSET_TRANSFER_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetTransferForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetTransferCreate
