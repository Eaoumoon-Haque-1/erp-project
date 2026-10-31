/**
 * @file Payment Type and Payment Through Mapping Edit page.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { paymentTypeMappingApi } from '../api/paymentTypeMappingApi'
import PaymentTypeMappingForm from '../components/PaymentTypeMappingForm'
import { mapMappingFromApi, mapMappingToApi } from '../data/paymentTypeMappingApiMapper'
import usePaymentTypeMappingForm from '../data/usePaymentTypeMappingForm'
import {
  AFM_P_TYPE_P_THROUGH_MAP_TABLE,
  initialMappingValues,
} from '../validation/paymentTypeMappingValidation'

const listPath = '/accounts/voucher-setup/payment-type-mapping'

function PaymentTypeMappingEdit() {
  const { mappingId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const paymentTypeRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const [auditLog, setAuditLog] = useState(null)
  const [existingMappings, setExistingMappings] = useState([])
  const form = usePaymentTypeMappingForm({
    ...initialMappingValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  })
  const { reset } = form

  // Load record to edit
  useEffect(() => {
    let active = true
    Promise.all([
      paymentTypeMappingApi.get(mappingId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([record, users, employees]) => {
        if (!active) return
        // Map admin_users.id -> admin_users.user_name
        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        // Map hr_employee.id -> "employee_code: employee_name" (e.g. "EMP-000004: Rakib")
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
        const mapped = mapMappingFromApi(
          record,
          new Map(),
          new Map(),
          userMap,
          empMap,
        )
        const loaded = {
          ID: mapped.ID,
          BG_ID: sessionGroupId || mapped.BG_ID,
          BU_ID: sessionBusinessUnitId || mapped.BU_ID,
          PAYMENT_TYPE_ID: mapped.PAYMENT_TYPE_ID,
          PAYMENT_THROUGH_ID: mapped.PAYMENT_THROUGH_ID,
          STATUS: mapped.STATUS,
        }
        setOriginal(loaded)
        setAuditLog({
          CREATED_USER_ID: mapped.CREATED_USER_ID,
          CREATED_USER_NAME: mapped.CREATED_USER_NAME,
          CREATED_EMP_ID: mapped.CREATED_EMP_ID,
          CREATED_EMP_NAME: mapped.CREATED_EMP_NAME,
          CREATED_DATETIME: mapped.CREATED_DATETIME,
          CREATED_APP: mapped.CREATED_APP,
          UPDATED_USER_ID: mapped.UPDATED_USER_ID,
          UPDATED_USER_NAME: mapped.UPDATED_USER_NAME,
          UPDATED_EMP_ID: mapped.UPDATED_EMP_ID,
          UPDATED_EMP_NAME: mapped.UPDATED_EMP_NAME,
          UPDATED_DATETIME: mapped.UPDATED_DATETIME,
          UPDATED_APP: mapped.UPDATED_APP,
          STATUS: mapped.STATUS,
        })
        reset(loaded)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Payment Type Mapping.')
        navigate(listPath, { replace: true })
      })

    return () => {
      active = false
    }
  }, [mappingId, navigate, reset, sessionBusinessUnitId, sessionGroupId])

  // Load existing mappings for duplicate check
  useEffect(() => {
    let active = true
    paymentTypeMappingApi
      .list()
      .then((records) => {
        if (!active) return
        setExistingMappings(records || [])
      })
      .catch(() => {
        if (!active) return
        setExistingMappings([])
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate(existingMappings, mappingId, {
      BG_ID: sessionGroupId || form.values.BG_ID,
      BU_ID: sessionBusinessUnitId || form.values.BU_ID,
    })
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await paymentTypeMappingApi.update(mappingId, mapMappingToApi(result.values))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Payment Type Mapping.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) {
      form.reset({
        ...original,
        BG_ID: sessionGroupId || original.BG_ID,
        BU_ID: sessionBusinessUnitId || original.BU_ID,
      })
    }
    requestAnimationFrame(() => paymentTypeRef.current?.focus())
  }

  return (
    <FormPage
      title={'Payment Type and Payment Through Mapping Edit'}
      listTo={listPath}
      tableName={AFM_P_TYPE_P_THROUGH_MAP_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={() =>
        form.validate(existingMappings, mappingId, {
          BG_ID: sessionGroupId || form.values.BG_ID,
          BU_ID: sessionBusinessUnitId || form.values.BU_ID,
        }).isValid
      }
      onReset={handleReset}
      submitting={submitting}
    >
      <PaymentTypeMappingForm
        values={form.values}
        errors={form.errors}
        paymentTypeOptions={form.paymentTypeOptions}
        paymentThroughOptions={form.paymentThroughOptions}
        lookupsLoading={form.lookupsLoading}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        paymentTypeRef={paymentTypeRef}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default PaymentTypeMappingEdit
