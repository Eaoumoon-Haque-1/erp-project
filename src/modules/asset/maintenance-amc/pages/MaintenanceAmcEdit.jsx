/** @file API-backed edit controller for Maintenance / AMC. */
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import MaintenanceAmcForm from '../components/MaintenanceAmcForm'
import { maintenanceAmcApi } from '../api/maintenanceAmcApi'
import { updateMaintenanceAmcField } from '../data/maintenanceAmcFormState'
import { mapMaintenanceAmcFromApi, mapMaintenanceAmcToApi } from '../data/maintenanceAmcApiMapper'
import { getInitialMaintenanceReferences, loadMaintenanceReferences } from '../data/maintenanceAmcOptions'
import {
  ASSET_MAINTENANCE_TABLE,
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

function MaintenanceAmcEdit() {
  const { maintenanceId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(null)
  const [originalValues, setOriginalValues] = useState(null)
  const [references, setReferences] = useState(getInitialMaintenanceReferences)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      maintenanceAmcApi.get(maintenanceId),
      loadMaintenanceReferences(sessionBusinessUnitId),
    ])
      .then(([record, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapMaintenanceAmcFromApi(record, refs)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 404) {
          setNotFound(true)
        } else {
          setMessage(getApiErrorMessage(error, 'Unable to load Maintenance / AMC record.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [maintenanceId, sessionBusinessUnitId])

  if (notFound) {
    return <Navigate to={listPath} replace />
  }

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
        bgId: originalValues?.BG_ID || sessionGroupId,
        buId: originalValues?.BU_ID || sessionBusinessUnitId,
      })
      await maintenanceAmcApi.update(maintenanceId, payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to update Maintenance / AMC record.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalValues) {
      setValues(originalValues)
      setErrors({})
      setMessage('')
      requestAnimationFrame(() => document.getElementById('ITEM_NAME')?.focus())
    }
  }

  return (
    <FormPage
      title={'Maintenance / AMC Edit'}
      listTo={listPath}
      tableName={ASSET_MAINTENANCE_TABLE}
      submitLabel={'Update'}
      loading={loading}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {values && (
        <MaintenanceAmcForm
          values={values}
          errors={errors}
          references={references}
          onChange={handleChange}
        />
      )}
    </FormPage>
  )
}

export default MaintenanceAmcEdit
