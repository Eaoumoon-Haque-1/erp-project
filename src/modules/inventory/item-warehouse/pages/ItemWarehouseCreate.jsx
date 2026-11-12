/**
 * @file Item Warehouse Create page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { itemStoreApi } from '../../item-store/api/itemStoreApi'
import { itemWarehouseApi } from '../api/itemWarehouseApi'
import ItemWarehouseForm from '../components/ItemWarehouseForm'
import { mapItemWarehouseToApi } from '../data/itemWarehouseApiMapper'
import {
  initialItemWarehouseValues,
  validateItemWarehouse,
} from '../validation/itemWarehouseValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-warehouse'

function ItemWarehouseCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-warehouse'
    : defaultListPath
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupName = session?.groupName || session?.businessGroupName || ''
  const sessionBuName = session?.businessUnitName || session?.buName || ''

  const [values, setValues] = useState(() => ({
    ...initialItemWarehouseValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBuId,
    GROUP_NAME: sessionGroupName,
    BUSINESS_UNIT: sessionBuName,
  }))

  const [storeOptions, setStoreOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [assignedEmployees, setAssignedEmployees] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Ensure BG_ID is populated even if only buId is present in session
  useEffect(() => {
    if (!sessionGroupId && sessionBuId) {
      businessUnitsApi
        .get(sessionBuId)
        .then((bu) => {
          if (bu?.bgId) {
            setValues((prev) => ({
              ...prev,
              BG_ID: String(bu.bgId),
              GROUP_NAME: bu.groupName || prev.GROUP_NAME,
            }))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBuId])

  // Fetch active stores for the store dropdown
  useEffect(() => {
    if (sessionBuId) {
      itemStoreApi
        .list({ buId: sessionBuId, status: 1 })
        .then((stores) => {
          setStoreOptions(
            (stores || []).map((s) => ({
              value: String(s.id),
              label: s.storeName ? `${s.storeName} (${s.storeCode})` : s.storeCode,
              code: s.storeCode,
            })),
          )
        })
        .catch(() => {})

      employeesApi
        .list({ buId: sessionBuId, status: 1 })
        .then((employees) => {
          const activeList = (employees || []).filter((e) => {
            const isActive =
              e.status === undefined || e.status === null || Number(e.status) === 1
            const matchesBu =
              !sessionBuId || String(e.buId || '') === String(sessionBuId)
            const matchesBg =
              !sessionGroupId ||
              !e.bgId ||
              String(e.bgId || '') === String(sessionGroupId)
            return isActive && matchesBu && matchesBg
          })
          setEmployeeOptions(
            activeList.map((e) => {
              const code = e.employeeCode ? ` (${e.employeeCode})` : ''
              return {
                value: String(e.id),
                label: `${e.employeeName || 'Unnamed'}${code}`,
                name: e.employeeName,
                code: e.employeeCode,
                buName: sessionBuName,
              }
            }),
          )
        })
        .catch(() => {})
    }
  }, [sessionBuId, sessionGroupId, sessionBuName])

  // Try fetching the next available warehouse code as preview
  useEffect(() => {
    if (sessionBuId) {
      itemWarehouseApi
        .getNextCode(sessionBuId)
        .then((res) => {
          if (res?.warehouseCode) {
            setValues((prev) => (prev.WAREHOUSE_CODE ? prev : { ...prev, WAREHOUSE_CODE: res.warehouseCode }))
          }
        })
        .catch(() => {})
    }
  }, [sessionBuId])

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
    const validation = validateItemWarehouse(values, { isEdit: false })
    if (!validation.isValid) {
      setErrors(validation.errors)
      showError('Please correct the highlighted form errors.')
      return false
    }
    return true
  }

  const handleAddEmployees = async (newEmployees, newIds) => {
    // If the warehouse name is already entered, submit and create warehouse & employee assignment in database
    if (values.WAREHOUSE_NAME && values.WAREHOUSE_NAME.trim()) {
      try {
        setSubmitting(true)
        let submitBgId = sessionGroupId || values.BG_ID
        const submitBuId = sessionBuId || values.BU_ID
        if (!submitBgId && submitBuId) {
          try {
            const bu = await businessUnitsApi.get(submitBuId)
            if (bu?.bgId) submitBgId = String(bu.bgId)
          } catch {
            // proceed
          }
        }

        const combinedEmpList = [...assignedEmployees]
        const existingIds = new Set(
          combinedEmpList.map((e) => String(e.employeeId || e.id)),
        )
        newEmployees.forEach((e) => {
          if (!existingIds.has(String(e.employeeId || e.id))) {
            combinedEmpList.push(e)
          }
        })

        const combinedIds = combinedEmpList
          .map((e) => Number(e.employeeId || e.id))
          .filter(Boolean)

        const submitValues = {
          ...values,
          BG_ID: submitBgId,
          BU_ID: submitBuId,
          EMPLOYEE_IDS: combinedIds,
          ASSIGNED_EMPLOYEES: combinedEmpList,
        }

        const payload = mapItemWarehouseToApi(submitValues)
        const saved = await itemWarehouseApi.create(payload)
        showSuccess('Warehouse and assigned employees saved to database!')
        const newId = saved?.id || saved?.ID
        if (newId) {
          navigate(`${listPath}/${newId}/edit`, { replace: true })
        } else {
          setAssignedEmployees(combinedEmpList)
        }
        return
      } catch (err) {
        showError(
          getApiErrorMessage(
            err,
            'Unable to save warehouse employee assignment.',
          ),
        )
      } finally {
        setSubmitting(false)
      }
    }

    // Otherwise keep in local state until form Save
    setAssignedEmployees((prev) => {
      const existingIds = new Set(
        prev.map((e) => String(e.employeeId || e.id)),
      )
      const toAdd = newEmployees.filter(
        (e) => !existingIds.has(String(e.employeeId || e.id)),
      )
      return [...prev, ...toAdd]
    })
  }

  const handleRemoveEmployee = async (empId, emp) => {
    const employeeName = emp?.employeeName || emp?.employeeDisplay || 'this employee'
    const confirmed = await confirmAction({
      title: 'Do you want to remove Assigned Employee?',
      text: `Are you sure you want to remove "${employeeName}" from this warehouse?`,
      action: 'delete',
    })
    if (!confirmed) return

    setAssignedEmployees((prev) =>
      prev.filter((e) => String(e.employeeId || e.id) !== String(empId)),
    )
    showSuccess('Employee removed from list.')
  }

  const handleToggleStatus = async (empId, emp) => {
    const currentStatus = emp?.status !== undefined && emp?.status !== null ? Number(emp.status) : 1
    const nextStatus = currentStatus === 1 ? 0 : 1
    const actionLabel = nextStatus === 1 ? 'Active' : 'Inactive'
    const employeeName = emp?.employeeName || emp?.employeeDisplay || 'this employee'

    const confirmed = await confirmAction({
      title: 'Do you want to change status?',
      text: `Change status of "${employeeName}" to ${actionLabel}?`,
      action: 'update',
    })
    if (!confirmed) return

    setAssignedEmployees((prev) =>
      prev.map((e) => {
        if (String(e.employeeId || e.id) === String(empId)) {
          return { ...e, status: nextStatus }
        }
        return e
      }),
    )
    showSuccess(`Employee status changed to ${actionLabel}.`)
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
      ASSIGNED_EMPLOYEES: assignedEmployees,
      EMPLOYEE_IDS: assignedEmployees.map((e) => Number(e.employeeId || e.id)).filter(Boolean),
    }

    setSubmitting(true)
    try {
      const payload = mapItemWarehouseToApi(submitValues)
      await itemWarehouseApi.create(payload)
      showSuccess('Item Warehouse created successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create item warehouse.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialItemWarehouseValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBuId,
    })
    setAssignedEmployees([])
    setErrors({})
  }

  return (
    <FormPage
      title={'New Item Warehouse'}
      listTo={listPath}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <ItemWarehouseForm
        values={values}
        storeOptions={storeOptions}
        employeeOptions={employeeOptions}
        assignedEmployees={assignedEmployees}
        businessUnitName={sessionBuName || values.BUSINESS_UNIT}
        errors={errors}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onAddEmployees={handleAddEmployees}
        onRemoveEmployee={handleRemoveEmployee}
        onToggleStatus={handleToggleStatus}
        onReset={handleReset}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemWarehouseCreate

