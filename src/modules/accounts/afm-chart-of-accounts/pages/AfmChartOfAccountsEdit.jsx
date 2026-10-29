/** @file API-backed AFM Chart of Accounts edit page with Sub-Accounts table. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import ActionForm from '../../../../components/shared/ActionForm'
import ListRowActions from '../../../../components/shared/ListRowActions'
import PageHeader from '../../../../components/shared/PageHeader'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { afmChartOfAccountsApi } from '../api/afmChartOfAccountsApi'
import AfmChartOfAccountsForm from '../components/AfmChartOfAccountsForm'
import {
  mapAfmChartOfAccountsFromApi,
  mapAfmChartOfAccountsToApi,
} from '../data/afmChartOfAccountsApiMapper'
import {
  AFM_CHART_OF_ACCOUNTS_TABLE,
  initialAfmChartOfAccountsValues,
  validateAfmChartOfAccounts,
} from '../validation/afmChartOfAccountsValidation'

const listPath = '/accounts/voucher-setup/chart-of-accounts'

function AfmChartOfAccountsEdit() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const accountCodeRef = useRef(null)

  const [record, setRecord] = useState(null)
  const [values, setValues] = useState(initialAfmChartOfAccountsValues)
  const [subAccounts, setSubAccounts] = useState([])
  const [existingAccounts, setExistingAccounts] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { groupOptions, businessUnitOptions, groupsLoading, unitsLoading } = useBusinessOptions(values.BG_ID, {
    loadUnits: true,
  })

  useEffect(() => {
    let active = true

    Promise.all([
      afmChartOfAccountsApi.get(accountId),
      afmChartOfAccountsApi.list(),
      afmChartOfAccountsApi.listByParent(accountId).catch(() => []),
    ])
      .then(([accountData, allAccounts, children]) => {
        if (!active) return
        setRecord(accountData)
        setExistingAccounts(allAccounts)
        setSubAccounts(children || [])
        setValues(mapAfmChartOfAccountsFromApi(accountData))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Chart of Accounts head.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [accountId])

  // Exclude current account and its descendants from parent options
  const parentAccountOptions = existingAccounts
    .filter((acc) =>
      String(acc.id) !== String(accountId) &&
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
    const result = validateAfmChartOfAccounts(values, existingAccounts, accountId)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await afmChartOfAccountsApi.update(accountId, mapAfmChartOfAccountsToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Chart of Accounts head.', {
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

  const handleSubAccountDelete = async (subRow) => {
    try {
      await afmChartOfAccountsApi.remove(subRow.id)
      setSubAccounts((current) => current.filter((item) => item.id !== subRow.id))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete sub-account.')
      return false
    }
  }

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader title={'Chart of Accounts Edit'} actionLabel={'Chart of Accounts List'} actionTo={listPath} />
        <section className={'erp-form-card'}><p>Loading...</p></section>
      </div>
    )
  }

  if (!record) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader title={'Account Not Found'} actionLabel={'Chart of Accounts List'} actionTo={listPath} />
        <section className={'erp-form-card'}><p>No Chart of Accounts head found for this ID.</p></section>
      </div>
    )
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Chart of Accounts Edit'} actionLabel={'Chart of Accounts List'} actionTo={listPath} />

      {/* Main Edit Form */}
      <section className={'erp-form-card'}>
        <ActionForm action={'update'} entityName={'Chart of Accounts'} data-table={AFM_CHART_OF_ACCOUNTS_TABLE} onSubmit={handleSubmit} noValidate>
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
          <div className={'erp-form-actions'}>
            <button type={'submit'} className={'primary-button'} disabled={submitting}>
              {submitting ? 'Saving...' : 'Update'}
            </button>
          </div>
        </ActionForm>
      </section>

      {/* Embedded Sub-Accounts / Children Hierarchy Table */}
      <section className={'erp-form-card'}>
        <div className={'flex items-center justify-between gap-4'}>
          <h2 className={'m-0 text-base font-medium'}>
            Sub-Accounts ({subAccounts.length})
          </h2>
        </div>

        <div className={'erp-table-wrap mt-4'}>
          <table className={'erp-table'}>
            <thead>
              <tr>
                <th className={'erp-number-column'}>#</th>
                <th>Account Code</th>
                <th>Account Head</th>
                <th>Ledger Head</th>
                <th>Account Type</th>
                <th>Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subAccounts.length === 0 ? (
                <tr>
                  <td className={'erp-empty-cell'} colSpan={8}>
                    No sub-accounts exist under this parent account.
                  </td>
                </tr>
              ) : (
                subAccounts.map((sub, index) => (
                  <tr key={sub.id}>
                    <td className={'erp-number-column'}>{index + 1}</td>
                    <td>{sub.accountCode}</td>
                    <td>{sub.accountHeadName}</td>
                    <td>{sub.ledgerHead}</td>
                    <td>{sub.accountHeadType}</td>
                    <td>L{sub.level || 1}</td>
                    <td>
                      <span
                        className={[
                          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
                          String(sub.status) === '1' ? 'bg-action-success' : 'bg-action-danger',
                        ].join(' ')}
                      >
                        {String(sub.status) === '1' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <ListRowActions
                        row={{ ID: String(sub.id) }}
                        entityName={'Sub-Account'}
                        onView={() => navigate(`${listPath}/${sub.id}/view`)}
                        onEdit={() => navigate(`${listPath}/${sub.id}/edit`)}
                        onDelete={() => handleSubAccountDelete(sub)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AfmChartOfAccountsEdit
