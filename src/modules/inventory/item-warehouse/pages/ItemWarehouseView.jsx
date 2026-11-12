/**
 * @file Item Warehouse View (Read-Only) page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemStoreApi } from '../../item-store/api/itemStoreApi'
import { itemWarehouseApi } from '../api/itemWarehouseApi'
import ItemWarehouseForm from '../components/ItemWarehouseForm'
import { mapItemWarehouseFromApi } from '../data/itemWarehouseApiMapper'
import { initialItemWarehouseValues } from '../validation/itemWarehouseValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-warehouse'

function ItemWarehouseView() {
  const { warehouseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-warehouse'
    : defaultListPath

  const [values, setValues] = useState(initialItemWarehouseValues)
  const [storeOptions, setStoreOptions] = useState([])
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      itemWarehouseApi.get(warehouseId),
      itemStoreApi.list().catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([record, stores, users, employees]) => {
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
        const storeMap = new Map(
          (stores || []).map((s) => [String(s.id), s.storeName ? `${s.storeName} (${s.storeCode})` : s.storeCode]),
        )

        setStoreOptions(
          (stores || []).map((s) => ({
            value: String(s.id),
            label: s.storeName ? `${s.storeName} (${s.storeCode})` : s.storeCode,
          })),
        )

        const mapped = mapItemWarehouseFromApi(record, userMap, empMap, storeMap)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load item warehouse.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [warehouseId])

  if (loading) {
    return (
      <FormPage title={'View Item Warehouse'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading warehouse data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Item Warehouse: ${values.WAREHOUSE_NAME || ''}`}
      listTo={listPath}
      hideActions
    >
      <ItemWarehouseForm
        values={values}
        storeOptions={storeOptions}
        assignedEmployees={values.ASSIGNED_EMPLOYEES || []}
        businessUnitName={values.BUSINESS_UNIT}
        auditLog={auditLog}
        readOnly={true}
        onEdit={() => navigate(`${listPath}/${warehouseId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemWarehouseView

