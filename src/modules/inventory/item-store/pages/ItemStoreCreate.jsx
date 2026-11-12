/**
 * @file Item Store Create page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { itemStoreApi } from '../api/itemStoreApi'
import ItemStoreForm from '../components/ItemStoreForm'
import { mapItemStoreToApi } from '../data/itemStoreApiMapper'
import {
  initialItemStoreValues,
  validateItemStore,
} from '../validation/itemStoreValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-store'

function ItemStoreCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-store'
    : defaultListPath
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupName = session?.groupName || session?.businessGroupName || ''
  const sessionBuName = session?.businessUnitName || session?.buName || ''

  const [values, setValues] = useState(() => ({
    ...initialItemStoreValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBuId,
    GROUP_NAME: sessionGroupName,
    BUSINESS_UNIT: sessionBuName,
  }))

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

  // Fetch active employees for employee dropdown
  useEffect(() => {
    if (sessionBuId) {
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
              }
            }),
          )
        })
        .catch(() => {})
    }
  }, [sessionBuId, sessionGroupId])

  // Try fetching the next available store code as preview
  useEffect(() => {
    if (sessionBuId) {
      itemStoreApi
        .getNextCode(sessionBuId)
        .then((res) => {
          if (res?.storeCode) {
            setValues((prev) => (prev.STORE_CODE ? prev : { ...prev, STORE_CODE: res.storeCode }))
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
    const validation = validateItemStore(values, { isEdit: false })
    if (!validation.isValid) {
      setErrors(validation.errors)
      showError('Please correct the highlighted form errors.')
      return false
    }
    return true
  }

  const handleAddEmployees = async (newEmployees, newIds) => {
    // If the store name is already entered, submit and create store & employee assignment in database
    if (values.STORE_NAME && values.STORE_NAME.trim()) {
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

        const payload = mapItemStoreToApi(submitValues)
        const saved = await itemStoreApi.create(payload)
        showSuccess('Store and assigned employees saved to database!')
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
            'Unable to save store employee assignment.',
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
      text: `Are you sure you want to remove "${employeeName}" from this store?`,
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
      const payload = mapItemStoreToApi(submitValues)
      await itemStoreApi.create(payload)
      showSuccess('Item Store created successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create item store.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialItemStoreValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBuId,
    })
    setAssignedEmployees([])
    setErrors({})
  }

  return (
    <FormPage
      title={'New Item Store'}
      listTo={listPath}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <ItemStoreForm
        values={values}
        employeeOptions={employeeOptions}
        assignedEmployees={assignedEmployees}
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

export default ItemStoreCreate
