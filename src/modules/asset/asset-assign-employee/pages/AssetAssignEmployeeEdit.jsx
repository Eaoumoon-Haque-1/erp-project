/** @file Edit-page controller for temporary Asset assignments. */
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetAssignEmployeeForm from '../components/AssetAssignEmployeeForm'
import { getAssetAssignReferences } from '../data/assetAssignEmployeeOptions'
import { getAssetAssignment, listAssetAssignments, updateAssetAssignment } from '../data/assetAssignEmployeeStore'
import { ASSET_ASSIGN_TO_EMPLOYEE_TABLE, validateAssetAssignment } from '../validation/assetAssignEmployeeValidation'

const listPath = '/asset/asset-assign-to-employee'

function AssetAssignEmployeeEdit() {
  const { assetAssignmentId } = useParams()
  const navigate = useNavigate()
  const record = getAssetAssignment(assetAssignmentId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetAssignReferences(listAssetAssignments(), record?.ID)

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => {
      if (name === 'ASSET_RECORD_ID') {
        const asset = references.availableAssets.find((option) => option.value === value)
        return { ...current, ASSET_RECORD_ID: value, ASSET_RECEIVE_ID: asset?.receiveId || '', ASSET_SOURCE: asset?.source || '', ASSET_NO: asset?.assetNo || '', ASSET_AVAILABLE_DATE: asset?.availableDate || '', ITEM_NAME: asset?.assetItemId || '', ITEM_NAME_LABEL: asset?.assetItemName || '' }
      }
      if (name === 'HR_EMPL_ID') {
        return { ...current, HR_EMPL_ID: value, EMPLOYEE_NAME: references.employees.find((item) => item.value === value)?.name || '' }
      }
      return { ...current, [name]: nextValue }
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const others = listAssetAssignments().filter((item) => item.ID !== record.ID)
    const result = validateAssetAssignment(values, others, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    updateAssetAssignment(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ASSET_DATE')?.focus())
  }

  return (
    <FormPage title={'Asset Assign to Employee Edit'} listTo={listPath} tableName={ASSET_ASSIGN_TO_EMPLOYEE_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetAssignEmployeeForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetAssignEmployeeEdit
