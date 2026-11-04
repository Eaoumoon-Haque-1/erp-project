/** @file API-backed create controller for Maintenance / AMC. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import MaintenanceAmcForm from '../components/MaintenanceAmcForm'
import { maintenanceAmcApi } from '../api/maintenanceAmcApi'
import { updateMaintenanceAmcField } from '../data/maintenanceAmcFormState'
import { mapMaintenanceAmcToApi } from '../data/maintenanceAmcApiMapper'
import { getInitialMaintenanceReferences, loadMaintenanceReferences } from '../data/maintenanceAmcOptions'
import {
  ASSET_MAINTENANCE_TABLE,
  initialMaintenanceAmcValues,
  validateMaintenanceAmc,
} from '../validation/maintenanceAmcValidation'

const listPath = '/asset/maintenance-amc'
const fieldMap = {
  itemId: 'ITEM_NAME',
  maintenanceType: 'MAINTENANCE_TYPE',
  maintenancePriority: 'MAINTENANCE_PRIORITY',
  vendorId: 'VENDOR_ID',
  startDate: 'START_DATE',
  endDate: 'END_DATE',
  cost: 'COST',
  nextDueDate: 'NEXT_DUE_DATE',
  remark: 'REMARK',
  status: 'STATUS',
}

function MaintenanceAmcCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(initialMaintenanceAmcValues)
  const [references, setReferences] = useState(getInitialMaintenanceReferences)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    loadMaintenanceReferences(sessionBusinessUnitId)
      .then((refs) => {
        if (active) setReferences(refs)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load references.'))
      })

    return () => { active = false }
  }, [sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateMaintenanceAmcField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateMaintenanceAmc(values, references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapMaintenanceAmcToApi(result.values, {
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      })
      await maintenanceAmcApi.create(payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to create Maintenance / AMC record.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialMaintenanceAmcValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => document.getElementById('ITEM_NAME')?.focus())
  }

  return (
    <FormPage
      title={'Maintenance / AMC Create'}
      listTo={listPath}
      tableName={ASSET_MAINTENANCE_TABLE}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <MaintenanceAmcForm
        values={values}
        errors={errors}
        references={references}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default MaintenanceAmcCreate
