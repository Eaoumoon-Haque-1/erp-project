/** @file Edit-page controller for Asset Transfer. */
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetTransferForm from '../components/AssetTransferForm'
import { updateAssetTransferField } from '../data/assetTransferFormState'
import { getAssetTransferReferences } from '../data/assetTransferOptions'
import { getAssetTransfer, listAssetTransfers, updateAssetTransfer } from '../data/assetTransferStore'
import { ASSET_TRANSFER_TABLE, validateAssetTransfer } from '../validation/assetTransferValidation'

const listPath = '/asset/asset-transfer'

function AssetTransferEdit() {
  const { assetTransferId } = useParams()
  const navigate = useNavigate()
  const record = getAssetTransfer(assetTransferId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetTransferReferences(listAssetTransfers(), record?.ID)

  if (!record || !values) return <Navigate to={listPath} replace />

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
    updateAssetTransfer(record.ID, result.values)
    navigate(listPath)
  }
  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ASSET_ASSIGNMENT_ID')?.focus())
  }

  return (
    <FormPage title={'Asset Transfer Edit'} listTo={listPath} tableName={ASSET_TRANSFER_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetTransferForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetTransferEdit
