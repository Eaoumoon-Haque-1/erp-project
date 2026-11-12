/**
 * @file Item Category View (Read-Only) page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemCategoryApi } from '../api/itemCategoryApi'
import ItemCategoryForm from '../components/ItemCategoryForm'
import { mapItemCategoryFromApi } from '../data/itemCategoryApiMapper'
import { initialItemCategoryValues } from '../validation/itemCategoryValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-category'

function ItemCategoryView() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-category'
    : defaultListPath

  const [values, setValues] = useState(initialItemCategoryValues)
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      itemCategoryApi.get(categoryId),
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

        const mapped = mapItemCategoryFromApi(record, userMap, empMap)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load item category.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [categoryId])

  if (loading) {
    return (
      <FormPage title={'View Item Category'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading category data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Item Category: ${values.CATEGORY_NAME || ''}`}
      listTo={listPath}
      hideActions
    >
      <ItemCategoryForm
        values={values}
        auditLog={auditLog}
        readOnly={true}
        onEdit={() => navigate(`${listPath}/${categoryId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemCategoryView

