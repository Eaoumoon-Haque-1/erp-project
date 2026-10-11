/** @file API-backed Chart of Accounts edit page. */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { chartOfAccountsApi } from '../api/chartOfAccountsApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import ChartOfAccountsForm from '../components/ChartOfAccountsForm'
import { mapChartOfAccountFromApi, mapChartOfAccountToApi } from '../data/chartOfAccountsApiMapper'
import { CHART_OF_ACCOUNTS_TABLE, initialChartOfAccountsValues, validateChartOfAccounts } from '../validation/chartOfAccountsValidation'

const listPath = '/accounts/chart-of-accounts'

function ChartOfAccountsEdit() {
  const { accountId } = useParams(); const navigate = useNavigate()
  const [values, setValues] = useState(initialChartOfAccountsValues); const [original, setOriginal] = useState({}); const [resetValues, setResetValues] = useState(initialChartOfAccountsValues)
  const [errors, setErrors] = useState({}); const [parentOptions, setParentOptions] = useState([]); const [message, setMessage] = useState(''); const [submitting, setSubmitting] = useState(false)
  useEffect(() => { let active = true; Promise.all([chartOfAccountsApi.get(accountId), chartOfAccountsApi.list()]).then(([record, rows]) => { if (!active) return; const mapped = mapChartOfAccountFromApi(record); setValues(mapped); setResetValues(mapped); setOriginal(record); setParentOptions(rows.filter((row) => String(row.id) !== String(accountId)).map((row) => ({ value: String(row.id), label: `${row.accountCode} - ${row.accountHead}` }))) }).catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load account.')) }); return () => { active = false } }, [accountId])
  const change = (event) => { const { name, type, checked, value } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const submit = async (event) => { event.preventDefault(); const result = validateChartOfAccounts(values); setValues(result.values); setErrors(result.errors); if (!result.isValid) return; setSubmitting(true); try { await chartOfAccountsApi.update(accountId, mapChartOfAccountToApi(result.values, original)); navigate(listPath) } catch (error) { setMessage(applyApiFormErrors(error, setErrors, 'Unable to update account.')) } finally { setSubmitting(false) } }
  return <FormPage title={'Chart of Accounts Edit'} listTo={listPath} tableName={CHART_OF_ACCOUNTS_TABLE} onSubmit={submit} onReset={() => { setValues(resetValues); setErrors({}); setMessage('') }} submitLabel={'Update'} submitting={submitting} message={message}><ChartOfAccountsForm values={values} errors={errors} parentOptions={parentOptions} onChange={change} /></FormPage>
}

export default ChartOfAccountsEdit
