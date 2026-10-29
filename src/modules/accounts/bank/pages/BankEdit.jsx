/**
 * @file Bank Information Edit page.
 * Loads bank master and its detail accounts by ID, allowing edits and row modifications.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { bankApi } from '../api/bankApi'
import BankForm from '../components/BankForm'
import { mapBankFromApi, mapBankToApi } from '../data/bankApiMapper'
import useBankForm from '../data/useBankForm'
import { AFM_BANK_TABLE, initialBankValues } from '../validation/bankValidation'

const listPath = '/accounts/voucher-setup/bank'

function BankEdit() {
  const { bankId } = useParams()
  const navigate = useNavigate()
  const bankNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const [auditLog, setAuditLog] = useState(null)
  const form = useBankForm(initialBankValues, [])
  const { reset } = form

  const { groupOptions, businessUnitOptions, groupsLoading, unitsLoading } =
    useBusinessOptions(form.values.BG_ID, {
      preserveUnitId: form.values.BU_ID,
      loadUnits: true,
    })

  useEffect(() => {
    let active = true
    Promise.all([
      bankApi.get(bankId),
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
        const mapped = mapBankFromApi(record, new Map(), new Map(), userMap, empMap)
        const loaded = {
          values: {
            ID: mapped.ID,
            BG_ID: mapped.BG_ID,
            BU_ID: mapped.BU_ID,
            BANK_NAME: mapped.BANK_NAME,
            SHORT_NAME: mapped.SHORT_NAME,
            STATUS: mapped.STATUS,
          },
          rows: mapped.BANK_DETAILS,
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
        reset(loaded.values, loaded.rows)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Bank Information.')
        navigate(listPath, { replace: true })
      })

    return () => {
      active = false
    }
  }, [bankId, navigate, reset])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await bankApi.update(bankId, mapBankToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Bank Information.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original.values, original.rows)
    requestAnimationFrame(() => bankNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Bank Information Edit'}
      listTo={listPath}
      tableName={AFM_BANK_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <BankForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        bankNameRef={bankNameRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default BankEdit
