/**
 * @file Item Attribute View (Read-Only) page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemAttributeApi } from '../api/itemAttributeApi'
import ItemAttributeForm from '../components/ItemAttributeForm'
import { mapItemAttributeFromApi } from '../data/itemAttributeApiMapper'
import { initialItemAttributeValues } from '../validation/itemAttributeValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-attribute'

function ItemAttributeView() {
  const { attributeId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-attribute'
    : defaultListPath

  const [values, setValues] = useState(initialItemAttributeValues)
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      itemAttributeApi.get(attributeId),
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

        const mapped = mapItemAttributeFromApi(record, userMap, empMap)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load item attribute.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [attributeId])

  if (loading) {
    return (
      <FormPage title={'View Item Attribute'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading attribute data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Item Attribute: ${values.ATTRIBUTE_NAME || ''}`}
      listTo={listPath}
      hideActions
    >
      <ItemAttributeForm
        values={values}
        auditLog={auditLog}
        readOnly={true}
        onEdit={() => navigate(`${listPath}/${attributeId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemAttributeView

