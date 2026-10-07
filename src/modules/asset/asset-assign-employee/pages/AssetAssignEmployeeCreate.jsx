/** @file Create-page controller for Asset Assign to Employee. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetAssignEmployeeForm from '../components/AssetAssignEmployeeForm'
import { getAssetAssignReferences } from '../data/assetAssignEmployeeOptions'
import { createAssetAssignment, listAssetAssignments } from '../data/assetAssignEmployeeStore'
import { ASSET_ASSIGN_TO_EMPLOYEE_TABLE, initialAssetAssignmentValues, validateAssetAssignment } from '../validation/assetAssignEmployeeValidation'

const listPath = '/asset/asset-assign-to-employee'

function AssetAssignEmployeeCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialAssetAssignmentValues)
  const [errors, setErrors] = useState({})
  const references = getAssetAssignReferences(listAssetAssignments())

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => {
      if (name === 'ASSET_RECORD_ID') {
        const asset = references.availableAssets.find((option) => option.value === value)
        return {
          ...current,
          ASSET_RECORD_ID: value,
          ASSET_RECEIVE_ID: asset?.receiveId || '',
          ASSET_SOURCE: asset?.source || '',
          ASSET_NO: asset?.assetNo || '',
          ASSET_AVAILABLE_DATE: asset?.availableDate || '',
          ITEM_NAME: asset?.assetItemId || '',
          ITEM_NAME_LABEL: asset?.assetItemName || '',
        }
      }
      if (name === 'HR_EMPL_ID') {
        return {
          ...current,
          HR_EMPL_ID: value,
          EMPLOYEE_NAME: references.employees.find((record) => record.value === value)?.name || '',
        }
      }
      return { ...current, [name]: nextValue }
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateAssetAssignment(values, listAssetAssignments(), references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createAssetAssignment(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(initialAssetAssignmentValues)
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ASSET_DATE')?.focus())
  }

  return (
    <FormPage title={'Asset Assign to Employee Create'} listTo={listPath} tableName={ASSET_ASSIGN_TO_EMPLOYEE_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetAssignEmployeeForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetAssignEmployeeCreate
