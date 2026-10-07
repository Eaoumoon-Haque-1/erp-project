/** @file Create-page controller for Maintenance / AMC. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import MaintenanceAmcForm from '../components/MaintenanceAmcForm'
import { updateMaintenanceAmcField } from '../data/maintenanceAmcFormState'
import { getMaintenanceReferences } from '../data/maintenanceAmcOptions'
import { createMaintenanceRecord, listMaintenanceRecords } from '../data/maintenanceAmcStore'
import { ASSET_MAINTENANCE_TABLE, initialMaintenanceAmcValues, validateMaintenanceAmc } from '../validation/maintenanceAmcValidation'

const listPath = '/asset/maintenance-amc'

function MaintenanceAmcCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialMaintenanceAmcValues)
  const [errors, setErrors] = useState({})
  const references = getMaintenanceReferences()

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateMaintenanceAmcField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateMaintenanceAmc(values, listMaintenanceRecords(), references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createMaintenanceRecord(result.values)
    navigate(listPath)
  }
  const handleReset = () => {
    setValues(initialMaintenanceAmcValues)
    setErrors({})
    requestAnimationFrame(() => document.getElementById('ITEM_NAME')?.focus())
  }

  return (
    <FormPage title={'Maintenance / AMC Create'} listTo={listPath} tableName={ASSET_MAINTENANCE_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <MaintenanceAmcForm values={values} errors={errors} references={references} onChange={handleChange} />
    </FormPage>
  )
}

export default MaintenanceAmcCreate
