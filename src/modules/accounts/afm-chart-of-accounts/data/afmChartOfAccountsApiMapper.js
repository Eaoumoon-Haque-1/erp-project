/** @file Converts AfmChartOfAccounts API records to and from form field names. */
export function mapAfmChartOfAccountsFromApi(
  record = {},
  groupNames = new Map(),
  unitNames = new Map(),
  accountHeadNames = new Map(),
) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    GROUP_NAME: groupNames.get(String(record.bgId)) || '',
    BU_ID: String(record.buId ?? ''),
    BUSINESS_UNIT: unitNames.get(String(record.buId)) || '',
    ACCOUNT_CODE: record.accountCode ?? '',
    ACCOUNT_HEAD_NAME: record.accountHeadName ?? '',
    LEDGER_HEAD: record.ledgerHead ?? '',
    ACCOUNT_HEAD_TYPE: record.accountHeadType ?? '',
    PARENT_ACCOUNT_HEAD: record.parentAccountHead == null ? '' : String(record.parentAccountHead),
    PARENT_ACCOUNT_HEAD_NAME: accountHeadNames.get(String(record.parentAccountHead)) || '',
    PARENT_ACCOUNT_CODE: record.parentAccountCode ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    ACCOUNT_USAGE: record.accountUsage ?? 'None',
    ACCOUNTS_SOURCE: record.accountsSource ?? 'None',
    IS_COST_CENTER_MANDATORY: String(record.isCostCenterMandatory ?? 0),
    IS_BUDGET_ACC_HEAD: String(record.isBudgetAccHead ?? 0),
    LEVEL: record.level == null ? '' : String(record.level),
    STATUS: String(record.status ?? 1),
  }
}

export function mapAfmChartOfAccountsToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    accountCode: values.ACCOUNT_CODE ? String(values.ACCOUNT_CODE).trim() : '',
    accountHeadName: values.ACCOUNT_HEAD_NAME ? String(values.ACCOUNT_HEAD_NAME).trim() : '',
    ledgerHead: values.LEDGER_HEAD || 'Title Account',
    accountHeadType: values.ACCOUNT_HEAD_TYPE || 'Asset',
    parentAccountHead: values.PARENT_ACCOUNT_HEAD ? Number(values.PARENT_ACCOUNT_HEAD) : null,
    parentAccountCode: values.PARENT_ACCOUNT_CODE || null,
    sortOrder: values.SORT_ORDER === '' || values.SORT_ORDER == null ? null : Number(values.SORT_ORDER),
    accountUsage: values.ACCOUNT_USAGE || 'None',
    accountsSource: values.ACCOUNTS_SOURCE || 'None',
    isCostCenterMandatory: Number(values.IS_COST_CENTER_MANDATORY || 0),
    isBudgetAccHead: Number(values.IS_BUDGET_ACC_HEAD || 0),
    level: values.LEVEL === '' || values.LEVEL == null ? null : Number(values.LEVEL),
    status: Number(values.STATUS ?? 1),
  }
}
