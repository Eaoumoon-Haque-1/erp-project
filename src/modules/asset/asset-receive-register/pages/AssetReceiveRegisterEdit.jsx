/** @file Edit-page controller for temporary Asset Receive Register records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetReceiveRegisterForm from '../components/AssetReceiveRegisterForm'
import { updateAssetReceiveField } from '../data/assetReceiveRegisterFormState'
import { getAssetReceiveReferences } from '../data/assetReceiveRegisterOptions'
import { getAssetReceive, listAssetReceives, updateAssetReceive } from '../data/assetReceiveRegisterStore'
import { ASSET_RECEIVE_REGISTER_TABLE, validateAssetReceive } from '../validation/assetReceiveRegisterValidation'

const listPath = '/asset/asset-receive-register'

function AssetReceiveRegisterEdit() {
  const { assetReceiveId } = useParams()
  const navigate = useNavigate()
  const grnRef = useRef(null)
  const references = getAssetReceiveReferences()
  const record = getAssetReceive(assetReceiveId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => updateAssetReceiveField(current, name, nextValue, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const handleSpecificationChange = (specificationId, value) => {
    setValues((current) => ({ ...current, SPECIFICATIONS: current.SPECIFICATIONS.map((row) => row.SPECIFICATION_ID === specificationId ? { ...row, EQUIPMENT_VALUE: value } : row) }))
    setErrors((current) => ({ ...current, SPECIFICATIONS: { ...current.SPECIFICATIONS, [specificationId]: undefined } }))
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const others = listAssetReceives().filter((item) => item.ID !== record.ID)
    const result = validateAssetReceive(values, others, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    updateAssetReceive(record.ID, result.values)
    navigate(listPath)
  }
  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => grnRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Receive Register Edit'} listTo={listPath} tableName={ASSET_RECEIVE_REGISTER_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetReceiveRegisterForm values={values} errors={errors} references={references} grnRef={grnRef} onChange={handleChange} onSpecificationChange={handleSpecificationChange} />
    </FormPage>
  )
}

export default AssetReceiveRegisterEdit
