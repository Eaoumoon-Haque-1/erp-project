/** @file Edit controller for Asset Group temporary records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import { departmentOptions } from '../../../hris/employee-information/data/employeeOptions'
import AssetGroupForm from '../components/AssetGroupForm'
import { getAssetGroup, listAssetGroups, updateAssetGroup } from '../data/assetGroupStore'
import { ASSET_GROUP_TABLE, validateAssetGroup } from '../validation/assetGroupValidation'

const listPath = '/asset/asset-group'

function AssetGroupEdit() {
  const { assetGroupId } = useParams()
  const navigate = useNavigate()
  const assetGroupRef = useRef(null)
  const record = getAssetGroup(assetGroupId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})

  if (!record || !values) return <Navigate to={listPath} replace />

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
    const otherRecords = listAssetGroups().filter((item) => item.ID !== record.ID)
    const result = validateAssetGroup(values, otherRecords)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    updateAssetGroup(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => assetGroupRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Group Edit'} listTo={listPath} tableName={ASSET_GROUP_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetGroupForm values={values} errors={errors} departmentOptions={departmentOptions} assetGroupRef={assetGroupRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetGroupEdit

