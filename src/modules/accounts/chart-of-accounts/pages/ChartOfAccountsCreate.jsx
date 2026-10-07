/** @file API-backed Chart of Accounts create page. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chartOfAccountsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import ChartOfAccountsForm from '../components/ChartOfAccountsForm'
import { mapChartOfAccountToApi } from '../data/chartOfAccountsApiMapper'
import { CHART_OF_ACCOUNTS_TABLE, initialChartOfAccountsValues, validateChartOfAccounts } from '../validation/chartOfAccountsValidation'

const listPath = '/accounts/chart-of-accounts'

function ChartOfAccountsCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialChartOfAccountsValues)
  const [errors, setErrors] = useState({})
  const [parentOptions, setParentOptions] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { chartOfAccountsApi.list().then((rows) => setParentOptions(rows.map((row) => ({ value: String(row.id), label: `${row.accountCode} - ${row.accountHead}` })))).catch((error) => setMessage(getApiErrorMessage(error, 'Unable to load parent accounts.'))) }, [])
  const change = (event) => { const { name, type, checked, value } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const submit = async (event) => { event.preventDefault(); const result = validateChartOfAccounts(values); setValues(result.values); setErrors(result.errors); if (!result.isValid) return; setSubmitting(true); try { await chartOfAccountsApi.create(mapChartOfAccountToApi(result.values)); navigate(listPath) } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to create account.')) } finally { setSubmitting(false) } }
  return <FormPage title={'Chart of Accounts Create'} listTo={listPath} tableName={CHART_OF_ACCOUNTS_TABLE} onSubmit={submit} onReset={() => { setValues(initialChartOfAccountsValues); setErrors({}); setMessage('') }} submitting={submitting} message={message}><ChartOfAccountsForm values={values} errors={errors} parentOptions={parentOptions} onChange={change} /></FormPage>
}

export default ChartOfAccountsCreate
