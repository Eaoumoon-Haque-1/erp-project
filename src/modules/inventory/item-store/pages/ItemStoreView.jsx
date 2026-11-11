/**
 * @file Item Store View (Read-Only) page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemStoreApi } from '../api/itemStoreApi'
import ItemStoreForm from '../components/ItemStoreForm'
import { mapItemStoreFromApi } from '../data/itemStoreApiMapper'
import { initialItemStoreValues } from '../validation/itemStoreValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-store'

function ItemStoreView() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-store'
    : defaultListPath

  const [values, setValues] = useState(initialItemStoreValues)
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      itemStoreApi.get(storeId),
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

        const mapped = mapItemStoreFromApi(record, userMap, empMap)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load item store.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [storeId])

  if (loading) {
    return (
      <FormPage title={'View Item Store'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading store data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Item Store: ${values.STORE_NAME || ''}`}
      listTo={listPath}
      hideActions
    >
      <ItemStoreForm
        values={values}
        auditLog={auditLog}
        assignedEmployees={values.ASSIGNED_EMPLOYEES || []}
        readOnly={true}
        onEdit={() => navigate(`${listPath}/${storeId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemStoreView
