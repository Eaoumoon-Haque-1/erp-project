/**
 * @file Item Attribute Edit page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemAttributeApi } from '../api/itemAttributeApi'
import ItemAttributeForm from '../components/ItemAttributeForm'
import { mapItemAttributeFromApi, mapItemAttributeToApi } from '../data/itemAttributeApiMapper'
import {
  initialItemAttributeValues,
  validateItemAttribute,
} from '../validation/itemAttributeValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-attribute'

function ItemAttributeEdit() {
  const { attributeId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-attribute'
    : defaultListPath
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [values, setValues] = useState(initialItemAttributeValues)
  const [auditLog, setAuditLog] = useState(null)
  const [originalRecord, setOriginalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

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

        setOriginalRecord(record)
        const mapped = mapItemAttributeFromApi(record, userMap, empMap)
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
          showError(getApiErrorMessage(err, 'Unable to load item attribute.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [attributeId, sessionGroupId, sessionBuId])

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
    const validation = validateItemAttribute(values, { isEdit: true })
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
    }

    setSubmitting(true)
    try {
      const payload = mapItemAttributeToApi(submitValues, originalRecord)
      await itemAttributeApi.update(attributeId, payload)
      showSuccess('Item Attribute updated successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to update item attribute.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalRecord) {
      const mapped = mapItemAttributeFromApi(originalRecord)
      setValues({
        ...mapped,
        BG_ID: sessionGroupId || mapped.BG_ID,
        BU_ID: sessionBuId || mapped.BU_ID,
      })
      setAuditLog(mapped.AUDIT_LOG)
    }
    setErrors({})
  }

  if (loading) {
    return (
      <FormPage title={'Edit Item Attribute'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading attribute data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Edit Item Attribute: ${values.ATTRIBUTE_NAME || ''}`}
      listTo={listPath}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <ItemAttributeForm
        values={values}
        errors={errors}
        auditLog={auditLog}
        submitting={submitting}
        isEdit={true}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemAttributeEdit

