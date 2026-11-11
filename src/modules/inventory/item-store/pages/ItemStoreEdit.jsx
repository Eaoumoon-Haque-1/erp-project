/**
 * @file Item Store Edit page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemStoreApi } from '../api/itemStoreApi'
import { itemStoreEmployeeMapApi } from '../api/itemStoreEmployeeMapApi'
import ItemStoreForm from '../components/ItemStoreForm'
import { mapItemStoreFromApi, mapItemStoreToApi } from '../data/itemStoreApiMapper'
import {
  initialItemStoreValues,
  validateItemStore,
} from '../validation/itemStoreValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-store'

function ItemStoreEdit() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-store'
    : defaultListPath
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [values, setValues] = useState(initialItemStoreValues)
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [assignedEmployees, setAssignedEmployees] = useState([])
  const [auditLog, setAuditLog] = useState(null)
  const [originalRecord, setOriginalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      itemStoreApi.get(storeId),
      itemStoreEmployeeMapApi.getByStoreId(storeId).catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([record, assignedList, users, employees]) => {
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

        const activeEmpList = (employees || []).filter((e) => {
          const isActive =
            e.status === undefined || e.status === null || Number(e.status) === 1
          const targetBuId = sessionBuId || record?.buId
          const targetBgId = sessionGroupId || record?.bgId
          const matchesBu = !targetBuId || String(e.buId || '') === String(targetBuId)
          const matchesBg = !targetBgId || !e.bgId || String(e.bgId || '') === String(targetBgId)
          return isActive && matchesBu && matchesBg
        })
        setEmployeeOptions(
          activeEmpList.map((e) => {
            const code = e.employeeCode ? ` (${e.employeeCode})` : ''
            return {
              value: String(e.id),
              label: `${e.employeeName || 'Unnamed'}${code}`,
              name: e.employeeName,
              code: e.employeeCode,
            }
          }),
        )

        setOriginalRecord(record)
        const mapped = mapItemStoreFromApi(record, userMap, empMap)

        const rawAssigned = (assignedList && assignedList.length > 0)
          ? assignedList
          : (mapped.ASSIGNED_EMPLOYEES || [])

        const finalAssigned = rawAssigned.map((m) => ({
          id: m.id != null ? String(m.id) : '',
          storeId: m.storeId != null ? String(m.storeId) : '',
          employeeId: m.employeeId != null ? String(m.employeeId) : '',
          employeeDisplay:
            m.employeeDisplay ||
            (m.employeeName ? `${m.employeeName}${m.employeeCode ? ` (${m.employeeCode})` : ''}` : ''),
          employeeName: m.employeeName || '',
          employeeCode: m.employeeCode || '',
          status: m.status !== undefined && m.status !== null ? Number(m.status) : 1,
        }))

        setValues({
          ...mapped,
          ASSIGNED_EMPLOYEES: finalAssigned,
          BG_ID: mapped.BG_ID || sessionGroupId,
          BU_ID: mapped.BU_ID || sessionBuId,
        })
        setAssignedEmployees(finalAssigned)
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
  }, [storeId, sessionGroupId, sessionBuId])

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
    const validation = validateItemStore(values, { isEdit: true })
    if (!validation.isValid) {
      setErrors(validation.errors)
      showError('Please correct the highlighted form errors.')
      return false
    }
    return true
  }

  const handleAddEmployees = async (newEmployees, newIds) => {
    try {
      const targetBgId = Number(sessionGroupId || originalRecord?.bgId || values.BG_ID)
      const targetBuId = Number(sessionBuId || originalRecord?.buId || values.BU_ID)
      const payload = {
        storeId: Number(storeId),
        employeeIds: newIds.map(Number),
        employeeId: newIds.join(','),
        bgId: targetBgId,
        buId: targetBuId,
        status: 1,
      }
      const updatedList = await itemStoreEmployeeMapApi.assignEmployees(payload)
      const mappedList = (updatedList || []).map((m) => ({
        id: m.id != null ? String(m.id) : '',
        storeId: m.storeId != null ? String(m.storeId) : '',
        employeeId: m.employeeId != null ? String(m.employeeId) : '',
        employeeDisplay:
          m.employeeDisplay ||
          (m.employeeName ? `${m.employeeName}${m.employeeCode ? ` (${m.employeeCode})` : ''}` : ''),
        employeeName: m.employeeName || '',
        employeeCode: m.employeeCode || '',
        status: m.status !== undefined && m.status !== null ? Number(m.status) : 1,
      }))
      setAssignedEmployees(mappedList)
      setValues((prev) => ({ ...prev, ASSIGNED_EMPLOYEES: mappedList }))
      showSuccess('Employees assigned to store successfully!')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to assign employees to store.')
      showError(msg)
      throw new Error(msg)
    }
  }

  const handleRemoveEmployee = async (empId, emp) => {
    const employeeName = emp?.employeeName || emp?.employeeDisplay || 'this employee'
    const confirmed = await confirmAction({
      title: 'Do you want to remove Assigned Employee?',
      text: `Are you sure you want to remove "${employeeName}" from this store?`,
      action: 'delete',
    })
    if (!confirmed) return

    try {
      if (emp?.id) {
        await itemStoreEmployeeMapApi.delete(emp.id)
      } else {
        await itemStoreEmployeeMapApi.removeByStoreAndEmployee(storeId, empId)
      }
      setAssignedEmployees((prev) =>
        prev.filter((e) => String(e.employeeId || e.id) !== String(empId) && String(e.id) !== String(emp?.id)),
      )
      setValues((prev) => ({
        ...prev,
        ASSIGNED_EMPLOYEES: (prev.ASSIGNED_EMPLOYEES || []).filter(
          (e) => String(e.employeeId || e.id) !== String(empId) && String(e.id) !== String(emp?.id),
        ),
      }))
      showSuccess('Employee removed from store successfully!')
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to remove employee from store.'))
    }
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

    try {
      if (emp?.id) {
        await itemStoreEmployeeMapApi.updateStatus(emp.id, nextStatus)
      }
      setAssignedEmployees((prev) =>
        prev.map((e) => {
          if (String(e.employeeId || e.id) === String(empId) || String(e.id) === String(emp?.id)) {
            return { ...e, status: nextStatus }
          }
          return e
        }),
      )
      setValues((prev) => ({
        ...prev,
        ASSIGNED_EMPLOYEES: (prev.ASSIGNED_EMPLOYEES || []).map((e) => {
          if (String(e.employeeId || e.id) === String(empId) || String(e.id) === String(emp?.id)) {
            return { ...e, status: nextStatus }
          }
          return e
        }),
      }))
      showSuccess(`Employee status changed to ${actionLabel} successfully!`)
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to update employee status.'))
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()

    if (!handleValidate()) return

    let submitBgId = sessionGroupId || values.BG_ID || originalRecord?.bgId
    const submitBuId = sessionBuId || values.BU_ID || originalRecord?.buId

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
      const payload = mapItemStoreToApi(submitValues, originalRecord)
      await itemStoreApi.update(storeId, payload)
      showSuccess('Item Store updated successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to update item store.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalRecord) {
      const mapped = mapItemStoreFromApi(originalRecord)
      setValues({
        ...mapped,
        BG_ID: sessionGroupId || mapped.BG_ID,
        BU_ID: sessionBuId || mapped.BU_ID,
      })
      setAssignedEmployees(mapped.ASSIGNED_EMPLOYEES || [])
      setAuditLog(mapped.AUDIT_LOG)
    }
    setErrors({})
  }

  if (loading) {
    return (
      <FormPage title={'Edit Item Store'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading store data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Edit Item Store: ${values.STORE_NAME || ''}`}
      listTo={listPath}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <ItemStoreForm
        values={values}
        errors={errors}
        auditLog={auditLog}
        assignedEmployees={assignedEmployees}
        employeeOptions={employeeOptions}
        submitting={submitting}
        isEdit={true}
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

export default ItemStoreEdit
