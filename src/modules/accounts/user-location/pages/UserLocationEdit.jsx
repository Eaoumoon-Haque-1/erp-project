/**
 * @file User Location Edit page.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { userLocationApi } from '../api/userLocationApi'
import UserLocationForm from '../components/UserLocationForm'
import { mapUserLocationFromApi, mapUserLocationToApi } from '../data/userLocationApiMapper'
import {
  initialUserLocationValues,
  validateUserLocation,
} from '../validation/userLocationValidation'

const listPath = '/accounts/voucher-setup/user-location'

function UserLocationEdit() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [values, setValues] = useState(initialUserLocationValues)
  const [auditLog, setAuditLog] = useState(null)
  const [originalRecord, setOriginalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      userLocationApi.get(locationId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([record, users, employees]) => {
        if (!active) return
        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display =
              code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        setOriginalRecord(record)
        const mapped = mapUserLocationFromApi(record, userMap, empMap)
        setValues({
          ...mapped,
          BG_ID: sessionGroupId || mapped.BG_ID,
          BU_ID: sessionBuId || mapped.BU_ID,
        })
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load user location.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [locationId, sessionGroupId, sessionBuId])

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const handleValidate = () => {
    const validation = validateUserLocation(values)
    if (!validation.isValid) {
      setErrors(validation.errors)
      showError('Please correct the highlighted form errors.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()

    if (!handleValidate()) return

    let submitBgId = sessionGroupId || values.BG_ID
    const submitBuId = sessionBuId || values.BU_ID

    if (!submitBgId && submitBuId) {
      try {
        const bu = await businessUnitsApi.get(submitBuId)
        if (bu?.bgId) {
          submitBgId = String(bu.bgId)
        }
      } catch {
        // proceed
      }
    }

    const submitValues = {
      ...values,
      BG_ID: submitBgId,
      BU_ID: submitBuId,
    }

    setSubmitting(true)
    try {
      const payload = mapUserLocationToApi(submitValues, originalRecord)
      await userLocationApi.update(locationId, payload)
      showSuccess('User Location updated successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to update user location.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalRecord) {
      const mapped = mapUserLocationFromApi(originalRecord)
      setValues({
        ...mapped,
        BG_ID: sessionGroupId || mapped.BG_ID,
        BU_ID: sessionBuId || mapped.BU_ID,
      })
    }
    setErrors({})
  }

  if (loading) {
    return (
      <FormPage title={'Edit User Location'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading location data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Edit User Location: ${values.LOCATION || ''}`}
      listTo={listPath}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <UserLocationForm
        values={values}
        errors={errors}
        auditLog={auditLog}
        isEdit={true}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default UserLocationEdit
