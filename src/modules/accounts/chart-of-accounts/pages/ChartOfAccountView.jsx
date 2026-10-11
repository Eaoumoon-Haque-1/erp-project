/** @file Read-only Chart of Account details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { chartOfAccountsApi } from '../api/chartOfAccountsApi'

const viewConfig = {
  title: 'Chart of Account View',
  param: 'accountId',
  listTo: '/accounts/chart-of-accounts',
  editTo: (id) => `/accounts/chart-of-accounts/${id}/edit`,
  loader: async (id) => {
    const [account, accounts] = await Promise.all([
      chartOfAccountsApi.get(id),
      chartOfAccountsApi.list(),
    ])
    return {
      ...account,
      parentAccountHead: accounts.find((record) =>
        String(record.id) === String(account.parentAccountHeadId))?.accountHead,
    }
  },
  fields: [
    { label: 'SL No', key: 'slNo' },
    { label: 'Company ID', key: 'companyId' },
    { label: 'Account Code', key: 'accountCode' },
    { label: 'Account Head', key: 'accountHead' },
    { label: 'Ledger Head Type', key: 'ledgerHeadType' },
    { label: 'Account Type', key: 'accountType' },
    { label: 'Parent Account Head', key: 'parentAccountHead' },
    { label: 'Account Usage', key: 'accountUsage' },
    { label: 'Cost Center Mandatory', key: 'isCostCenterMandatory', type: 'boolean' },
    { label: 'Budget Head', key: 'isBudgetHead', type: 'boolean' },
    { label: 'Opening Date', key: 'openingDate' },
    { label: 'Opening Balance', key: 'openingBalance' },
    { label: 'Balance DR', key: 'balanceDr' },
    { label: 'Balance CR', key: 'balanceCr' },
    { label: 'Current DR', key: 'currentDr' },
    { label: 'Current CR', key: 'currentCr' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function ChartOfAccountView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default ChartOfAccountView
