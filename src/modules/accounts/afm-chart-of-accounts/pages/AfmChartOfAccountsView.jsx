/** @file Read-only AFM Chart of Accounts details view. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { afmChartOfAccountsApi } from '../api/afmChartOfAccountsApi'
import { mapAfmChartOfAccountsFromApi } from '../data/afmChartOfAccountsApiMapper'

const basePath = '/accounts/voucher-setup/chart-of-accounts'

async function loadAccount(id) {
  const [account, groups, units, allAccounts] = await Promise.all([
    afmChartOfAccountsApi.get(id),
    businessGroupsApi.list(),
    businessUnitsApi.list(),
    afmChartOfAccountsApi.list(),
  ])
  const groupNames = new Map(groups.map((g) => [String(g.id), g.groupName]))
  const unitNames = new Map(units.map((u) => [String(u.id), u.businessUnit]))
  const headNames = new Map(allAccounts.map((a) => [String(a.id), a.accountHeadName]))
  return mapAfmChartOfAccountsFromApi(account, groupNames, unitNames, headNames)
}

const viewConfig = {
  title: 'Chart of Accounts View',
  param: 'accountId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadAccount,
  fields: [
    { label: 'Group Name', key: 'GROUP_NAME' },
    { label: 'Business Unit', key: 'BUSINESS_UNIT' },
    { label: 'Account Code', key: 'ACCOUNT_CODE' },
    { label: 'Account Head', key: 'ACCOUNT_HEAD_NAME' },
    { label: 'Ledger Head', key: 'LEDGER_HEAD' },
    { label: 'Account Type', key: 'ACCOUNT_HEAD_TYPE' },
    { label: 'Parent Account Head', key: 'PARENT_ACCOUNT_HEAD_NAME' },
    { label: 'Parent Account Code', key: 'PARENT_ACCOUNT_CODE' },
    { label: 'Sort Order', key: 'SORT_ORDER' },
    { label: 'Account Usage', key: 'ACCOUNT_USAGE' },
    { label: 'Account Source', key: 'ACCOUNTS_SOURCE' },
    {
      label: 'Cost Center Mandatory ?',
      value: (record) => (record.IS_COST_CENTER_MANDATORY === '1' ? 'Yes' : 'No'),
    },
    {
      label: 'Is Budget Account Head',
      value: (record) => (record.IS_BUDGET_ACC_HEAD === '1' ? 'Yes' : 'No'),
    },
    { label: 'Level', key: 'LEVEL' },
    { label: 'Status', value: (record) => record.STATUS, type: 'status' },
  ],
}

function AfmChartOfAccountsView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default AfmChartOfAccountsView
