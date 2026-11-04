/**
 * @file User Location View (Read-Only) page.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { userLocationApi } from '../api/userLocationApi'
import UserLocationForm from '../components/UserLocationForm'
import { mapUserLocationFromApi } from '../data/userLocationApiMapper'
import { initialUserLocationValues } from '../validation/userLocationValidation'

const listPath = '/accounts/voucher-setup/user-location'

function UserLocationView() {
  const { locationId } = useParams()
  const navigate = useNavigate()

  const [values, setValues] = useState(initialUserLocationValues)
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

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

        const mapped = mapUserLocationFromApi(record, userMap, empMap)
        setValues(mapped)
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
  }, [locationId])

  if (loading) {
    return (
      <FormPage title={'View User Location'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading location data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`User Location: ${values.LOCATION || ''}`}
      listTo={listPath}
      hideActions
    >
      <UserLocationForm
        values={values}
        auditLog={auditLog}
        readOnly={true}
        onEdit={() => navigate(`/accounts/voucher-setup/user-location/${locationId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default UserLocationView
