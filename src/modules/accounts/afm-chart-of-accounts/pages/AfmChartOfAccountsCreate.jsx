/** @file API-backed AFM Chart of Accounts create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
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
  const [values, setValues] = useState(initialAfmChartOfAccountsValues)
  const [existingAccounts, setExistingAccounts] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, businessUnitOptions, groupsLoading, unitsLoading } = useBusinessOptions(values.BG_ID, {
    loadUnits: true,
  })

  // Load existing accounts for validation and parent dropdown
  useEffect(() => {
    let active = true
    afmChartOfAccountsApi.list()
      .then((records) => {
        if (active) setExistingAccounts(records)
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Chart of Accounts.')
      })
    return () => {
      active = false
    }
  }, [])

  // Filter available parents by selected BU and ensure they are Title or Control accounts
  const parentAccountOptions = existingAccounts
    .filter((acc) =>
      String(acc.buId) === String(values.BU_ID) &&
      acc.ledgerHead !== 'Active Account' &&
      String(acc.status ?? 1) === '1',
    )
    .map((acc) => ({
      value: String(acc.id),
      label: `[${acc.accountCode}] ${acc.accountHeadName} (${acc.ledgerHead})`,
      code: acc.accountCode,
      level: acc.level || 1,
    }))

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'BG_ID') {
        next.BU_ID = ''
        next.PARENT_ACCOUNT_HEAD = ''
        next.PARENT_ACCOUNT_CODE = ''
      }
      if (name === 'BU_ID') {
        next.PARENT_ACCOUNT_HEAD = ''
        next.PARENT_ACCOUNT_CODE = ''
      }
      return next
    })
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
    const result = validateAfmChartOfAccounts(values, existingAccounts)
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
    setValues(initialAfmChartOfAccountsValues)
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
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        parentAccountOptions={parentAccountOptions}
        onChange={handleChange}
        onParentChange={handleParentChange}
        accountCodeRef={accountCodeRef}
      />
    </FormPage>
  )
}

export default AfmChartOfAccountsCreate
