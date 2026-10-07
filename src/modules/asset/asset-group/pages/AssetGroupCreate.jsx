/** @file Create controller for Asset Group. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import { departmentOptions } from '../../../hris/employee-information/data/employeeOptions'
import AssetGroupForm from '../components/AssetGroupForm'
import { createAssetGroup, listAssetGroups } from '../data/assetGroupStore'
import {
  ASSET_GROUP_TABLE,
  initialAssetGroupValues,
  validateAssetGroup,
} from '../validation/assetGroupValidation'

const listPath = '/asset/asset-group'

function AssetGroupCreate() {
  const navigate = useNavigate()
  const assetGroupRef = useRef(null)
  const [values, setValues] = useState(initialAssetGroupValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ASSET_OWNER_ID' ? {
        ASSET_OWNER_NAME: departmentOptions.find((option) => option.value === value)?.label || '',
      } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateAssetGroup(values, listAssetGroups())
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    createAssetGroup(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(initialAssetGroupValues)
    setErrors({})
    requestAnimationFrame(() => assetGroupRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Group Create'} listTo={listPath} tableName={ASSET_GROUP_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetGroupForm values={values} errors={errors} departmentOptions={departmentOptions} assetGroupRef={assetGroupRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetGroupCreate

