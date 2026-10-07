/** @file Create controller reusing the Asset Receive Register form contract. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetReceiveRegisterForm from '../../asset-receive-register/components/AssetReceiveRegisterForm'
import { updateAssetReceiveField } from '../../asset-receive-register/data/assetReceiveRegisterFormState'
import { getAssetReceiveReferences } from '../../asset-receive-register/data/assetReceiveRegisterOptions'
import { ASSET_RECEIVE_REGISTER_TABLE, createInitialAssetReceiveValues, validateAssetReceive } from '../../asset-receive-register/validation/assetReceiveRegisterValidation'
import { createBulkAssetReceive, createBulkReceiveNumbers, listBulkAssetReceives } from '../data/bulkAssetReceiveStore'

const listPath = '/asset/bulk-asset-receive-for-split'

function BulkAssetReceiveForSplitCreate() {
  const navigate = useNavigate()
  const grnRef = useRef(null)
  const references = getAssetReceiveReferences()
  const [values, setValues] = useState(() => createInitialAssetReceiveValues(createBulkReceiveNumbers()))
  const [errors, setErrors] = useState({})

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
    const result = validateAssetReceive(values, listBulkAssetReceives(), references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createBulkAssetReceive(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(createInitialAssetReceiveValues(createBulkReceiveNumbers()))
    setErrors({})
    requestAnimationFrame(() => grnRef.current?.focus())
  }

  return (
    <FormPage title={'Bulk Asset Receive for Split Create'} listTo={listPath} tableName={ASSET_RECEIVE_REGISTER_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetReceiveRegisterForm values={values} errors={errors} references={references} grnRef={grnRef} onChange={handleChange} onSpecificationChange={handleSpecificationChange} />
    </FormPage>
  )
}

export default BulkAssetReceiveForSplitCreate
