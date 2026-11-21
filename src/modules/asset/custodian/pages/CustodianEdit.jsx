/**
 * @file Edit-page controller for Custodian and its Sub Custodian rows.
 * Note: Group Name (bgId) and Business Unit (buId) are hidden from the UI
 * and automatically retrieved from the logged-in user's session data.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { custodiansApi } from '../../../../api/custodian'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import CustodianForm from '../components/CustodianForm'
import {
  createSubCustodianRow,
  mapCustodianFromApi,
  mapCustodianToApi,
} from '../data/custodianApiMapper'
import useCustodianForm from '../data/useCustodianForm'
import { ASSET_CUSTODIAN_TABLE, createInitialCustodianValues } from '../validation/custodianValidation'

const listPath = '/asset/custodian'

function CustodianEdit() {
  const { custodianId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const custodianNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const [auditLog, setAuditLog] = useState(null)
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)
  const form = useCustodianForm(createInitialCustodianValues())
  const { reset } = form

  // Resolve BG_ID if only buId is in the session
  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setResolvedGroupId(String(bu.bgId))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  useEffect(() => {
    let active = true

    Promise.all([
      custodiansApi.get(custodianId),
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
            const display = code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        const mapped = mapCustodianFromApi(record, userMap, empMap)
        const loaded = {
          values: {
            BG_ID: resolvedGroupId || sessionGroupId || mapped.BG_ID,
            BU_ID: sessionBusinessUnitId || mapped.BU_ID,
            CUSTODIAN_NAME: mapped.CUSTODIAN_NAME,
            STATUS: mapped.STATUS,
          },
          rows: mapped.SUB_CUSTODIANS.map(createSubCustodianRow),
        }
        setOriginal(loaded)
        reset(loaded.values, loaded.rows)
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
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Custodian.')
        navigate(listPath, { replace: true })
      })

    return () => {
      active = false
    }
  }, [custodianId, navigate, reset, resolvedGroupId, sessionBusinessUnitId, sessionGroupId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await custodiansApi.update(
        custodianId,
        mapCustodianToApi(result.values, result.rows, {
          bgId: resolvedGroupId || sessionGroupId || result.values.BG_ID,
          buId: sessionBusinessUnitId || result.values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Custodian.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original.values, original.rows)
    requestAnimationFrame(() => custodianNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Custodian Edit'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      createTo={`${listPath}/create`}
      createLabel={'Create New'}
      tableName={ASSET_CUSTODIAN_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <CustodianForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        custodianNameRef={custodianNameRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default CustodianEdit
