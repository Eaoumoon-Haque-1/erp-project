/** @file API-backed Chart of Accounts list with CRUD and status actions. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chartOfAccountsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { mapChartOfAccountFromApi, mapChartOfAccountToApi } from '../data/chartOfAccountsApiMapper'

const columns = [
  { key: 'ACCOUNT_CODE', label: 'Account Code' },
  { key: 'ACCOUNT_HEAD', label: 'Account Head' },
  { key: 'LEDGER_HEAD_TYPE', label: 'Ledger Head Type' },
  { key: 'ACCOUNT_TYPE', label: 'Account Type' },
  { key: 'OPENING_BALANCE', label: 'Opening Balance' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white ${value === '1' ? 'bg-action-success' : 'bg-action-danger'}`}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

const filters = [{ key: 'ACCOUNT_HEAD', label: 'Account Head', placeholder: '--Search by Account Head--', matches: (row, value) => row.ACCOUNT_HEAD.toLowerCase().includes(value.toLowerCase()) }]

function ChartOfAccountsList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadRows = async () => {
    setLoading(true)
    try { setRows((await chartOfAccountsApi.list()).map(mapChartOfAccountFromApi)); setMessage('') }
    catch (error) { setMessage(getApiErrorMessage(error, 'Unable to load Chart of Accounts.')) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    chartOfAccountsApi.list()
      .then((records) => { if (active) { setRows(records.map(mapChartOfAccountFromApi)); setMessage('') } })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Chart of Accounts.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const remove = async (row) => {
    if (!window.confirm(`Delete account "${row.ACCOUNT_HEAD}"?`)) return
    try { await chartOfAccountsApi.remove(row.ID); await loadRows() }
    catch (error) { setMessage(getApiErrorMessage(error, 'Unable to delete account.')) }
  }

  const toggle = async (row) => {
    try { await chartOfAccountsApi.update(row.ID, mapChartOfAccountToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }, row.API_RECORD)); await loadRows() }
    catch (error) { setMessage(getApiErrorMessage(error, 'Unable to change account status.')) }
  }

  return <ListPage title={'Chart of Accounts List'} createLabel={'New'} createTo={'/accounts/chart-of-accounts/create'} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/accounts/chart-of-accounts/${row.ID}/edit`)} onDelete={remove} onStatusChange={toggle} />} />
}

export default ChartOfAccountsList
