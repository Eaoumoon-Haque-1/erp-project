/** @file Edit controller reusing the Asset Receive Register form contract. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetReceiveRegisterForm from '../../asset-receive-register/components/AssetReceiveRegisterForm'
import { updateAssetReceiveField } from '../../asset-receive-register/data/assetReceiveRegisterFormState'
import { getAssetReceiveReferences } from '../../asset-receive-register/data/assetReceiveRegisterOptions'
import { ASSET_RECEIVE_REGISTER_TABLE, validateAssetReceive } from '../../asset-receive-register/validation/assetReceiveRegisterValidation'
import { getBulkAssetReceive, listBulkAssetReceives, updateBulkAssetReceive } from '../data/bulkAssetReceiveStore'

const listPath = '/asset/bulk-asset-receive-for-split'

function BulkAssetReceiveForSplitEdit() {
  const { bulkAssetReceiveId } = useParams()
  const navigate = useNavigate()
  const grnRef = useRef(null)
  const references = getAssetReceiveReferences()
  const record = getBulkAssetReceive(bulkAssetReceiveId)
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
    setValues((current) => ({
      ...current,
      SPECIFICATIONS: current.SPECIFICATIONS.map((row) => (
        row.SPECIFICATION_ID === specificationId ? { ...row, EQUIPMENT_VALUE: value } : row
      )),
    }))
    setErrors((current) => ({
      ...current,
      SPECIFICATIONS: { ...current.SPECIFICATIONS, [specificationId]: undefined },
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const otherRecords = listBulkAssetReceives().filter((item) => item.ID !== record.ID)
    const result = validateAssetReceive(values, otherRecords, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    updateBulkAssetReceive(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => grnRef.current?.focus())
  }

  return (
    <FormPage title={'Bulk Asset Receive for Split Edit'} listTo={listPath} tableName={ASSET_RECEIVE_REGISTER_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetReceiveRegisterForm values={values} errors={errors} references={references} grnRef={grnRef} onChange={handleChange} onSpecificationChange={handleSpecificationChange} />
    </FormPage>
  )
}

export default BulkAssetReceiveForSplitEdit
