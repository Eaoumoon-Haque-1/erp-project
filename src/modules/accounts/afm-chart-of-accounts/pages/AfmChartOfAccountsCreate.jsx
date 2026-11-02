/** @file API-backed AFM Chart of Accounts create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { afmChartOfAccountsApi } from '../api/afmChartOfAccountsApi'
import AfmChartOfAccountsForm from '../components/AfmChartOfAccountsForm'
import { mapAfmChartOfAccountsToApi } from '../data/afmChartOfAccountsApiMapper'
import {
  AFM_CHART_OF_ACCOUNTS_TABLE,
  initialAfmChartOfAccountsValues,
  validateAfmChartOfAccounts,
} from '../validation/afmChartOfAccountsValidation'

const listPath = '/accounts/voucher-setup/chart-of-accounts'

function AfmChartOfAccountsCreate() {
  const navigate = useNavigate()
  const accountCodeRef = useRef(null)
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const [values, setValues] = useState({
    ...initialAfmChartOfAccountsValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  })
  const [existingAccounts, setExistingAccounts] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Load existing accounts for validation and parent dropdown scoped to session BU
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true
    afmChartOfAccountsApi.listByUnit(sessionBusinessUnitId)
      .then((records) => {
        if (active) setExistingAccounts(records || [])
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Chart of Accounts.')
      })
    return () => {
      active = false
    }
  }, [sessionBusinessUnitId])

  // Filter available parents and ensure they are Title or Control accounts
  const parentAccountOptions = existingAccounts
    .filter((acc) =>
      acc.ledgerHead !== 'Active Account' &&
      String(acc.status ?? 1) === '1',
    )
    .map((acc) => ({
      value: String(acc.id ?? acc.ID),
      label: `[${acc.accountCode}] ${acc.accountHeadName} (${acc.ledgerHead})`,
      code: acc.accountCode,
      level: acc.level || 1,
    }))

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleParentChange = (event) => {
    const parentId = event.target.value
    const selectedParent = parentAccountOptions.find((p) => String(p.value) === String(parentId))

    setValues((current) => ({
      ...current,
      PARENT_ACCOUNT_HEAD: parentId,
      PARENT_ACCOUNT_CODE: selectedParent ? selectedParent.code : '',
      LEVEL: selectedParent ? String(Number(selectedParent.level) + 1) : '1',
    }))
    setErrors((current) => ({
      ...current,
      PARENT_ACCOUNT_HEAD: undefined,
      PARENT_ACCOUNT_CODE: undefined,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payloadValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
    }
    const result = validateAfmChartOfAccounts(payloadValues, existingAccounts)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await afmChartOfAccountsApi.create(mapAfmChartOfAccountsToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Chart of Accounts head.', {
        bgId: 'BG_ID',
        buId: 'BU_ID',
        accountCode: 'ACCOUNT_CODE',
        accountHeadName: 'ACCOUNT_HEAD_NAME',
        ledgerHead: 'LEDGER_HEAD',
        accountHeadType: 'ACCOUNT_HEAD_TYPE',
        parentAccountHead: 'PARENT_ACCOUNT_HEAD',
        sortOrder: 'SORT_ORDER',
        status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialAfmChartOfAccountsValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    setErrors({})
    requestAnimationFrame(() => accountCodeRef.current?.focus())
  }

  return (
    <FormPage
      title={'Chart of Accounts Create'}
      listTo={listPath}
      tableName={AFM_CHART_OF_ACCOUNTS_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <AfmChartOfAccountsForm
        values={values}
        errors={errors}
        parentAccountOptions={parentAccountOptions}
        onChange={handleChange}
        onParentChange={handleParentChange}
        accountCodeRef={accountCodeRef}
      />
    </FormPage>
  )
}

export default AfmChartOfAccountsCreate
