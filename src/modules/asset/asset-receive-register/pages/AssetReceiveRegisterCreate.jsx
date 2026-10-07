/** @file Create-page controller for Asset Receive Register. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetReceiveRegisterForm from '../components/AssetReceiveRegisterForm'
import { updateAssetReceiveField } from '../data/assetReceiveRegisterFormState'
import { getAssetReceiveReferences } from '../data/assetReceiveRegisterOptions'
import { createAssetReceive, createReceiveNumbers, listAssetReceives } from '../data/assetReceiveRegisterStore'
import { ASSET_RECEIVE_REGISTER_TABLE, createInitialAssetReceiveValues, validateAssetReceive } from '../validation/assetReceiveRegisterValidation'

const listPath = '/asset/asset-receive-register'

function AssetReceiveRegisterCreate() {
  const navigate = useNavigate()
  const grnRef = useRef(null)
  const references = getAssetReceiveReferences()
  const [values, setValues] = useState(() => createInitialAssetReceiveValues(createReceiveNumbers()))
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
    const result = validateAssetReceive(values, listAssetReceives(), references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createAssetReceive(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(createInitialAssetReceiveValues(createReceiveNumbers()))
    setErrors({})
    requestAnimationFrame(() => grnRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Receive Register Create'} listTo={listPath} tableName={ASSET_RECEIVE_REGISTER_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetReceiveRegisterForm values={values} errors={errors} references={references} grnRef={grnRef} onChange={handleChange} onSpecificationChange={handleSpecificationChange} />
    </FormPage>
  )
}

export default AssetReceiveRegisterCreate
