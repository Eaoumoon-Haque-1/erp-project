/**
 * @file Item Brand View (Read-Only) page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemBrandApi } from '../api/itemBrandApi'
import ItemBrandForm from '../components/ItemBrandForm'
import { mapItemBrandFromApi } from '../data/itemBrandApiMapper'
import { initialItemBrandValues } from '../validation/itemBrandValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-brand'

function ItemBrandView() {
  const { brandId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-brand'
    : defaultListPath

  const [values, setValues] = useState(initialItemBrandValues)
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      itemBrandApi.get(brandId),
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

        const mapped = mapItemBrandFromApi(record, userMap, empMap)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load item brand.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [brandId])

  if (loading) {
    return (
      <FormPage title={'View Item Brand'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading brand data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Item Brand: ${values.BRAND_NAME || ''}`}
      listTo={listPath}
      hideActions
    >
      <ItemBrandForm
        values={values}
        auditLog={auditLog}
        readOnly={true}
        onEdit={() => navigate(`${listPath}/${brandId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemBrandView

