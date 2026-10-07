/** @file Edit-page controller for Maintenance / AMC. */
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import MaintenanceAmcForm from '../components/MaintenanceAmcForm'
import { updateMaintenanceAmcField } from '../data/maintenanceAmcFormState'
import { getMaintenanceReferences } from '../data/maintenanceAmcOptions'
import { getMaintenanceRecord, listMaintenanceRecords, updateMaintenanceRecord } from '../data/maintenanceAmcStore'
import { ASSET_MAINTENANCE_TABLE, validateMaintenanceAmc } from '../validation/maintenanceAmcValidation'

const listPath = '/asset/maintenance-amc'

function MaintenanceAmcEdit() {
  const { maintenanceId } = useParams()
  const navigate = useNavigate()
  const record = getMaintenanceRecord(maintenanceId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getMaintenanceReferences()

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateMaintenanceAmcField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const otherRecords = listMaintenanceRecords().filter((item) => item.ID !== record.ID)
    const result = validateMaintenanceAmc(values, otherRecords, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    updateMaintenanceRecord(record.ID, result.values)
    navigate(listPath)
  }
  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ITEM_NAME')?.focus())
  }

  return (
    <FormPage title={'Maintenance / AMC Edit'} listTo={listPath} tableName={ASSET_MAINTENANCE_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <MaintenanceAmcForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default MaintenanceAmcEdit
