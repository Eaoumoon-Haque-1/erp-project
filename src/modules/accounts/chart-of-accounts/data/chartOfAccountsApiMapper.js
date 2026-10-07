/** @file Maps the `/coa` API contract to the uppercase form/list convention. */
export function mapChartOfAccountFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    SL_NO: String(record.slNo ?? ''),
    COMPANY_ID: String(record.companyId ?? ''),
    ACCOUNT_CODE: record.accountCode ?? '',
    ACCOUNT_HEAD: record.accountHead ?? '',
    LEDGER_HEAD_TYPE: record.ledgerHeadType ?? '',
    ACCOUNT_TYPE: record.accountType ?? '',
    PARENT_ACCOUNT_HEAD_ID: String(record.parentAccountHeadId ?? ''),
    ACCOUNT_USAGE: record.accountUsage ?? '',
    IS_COST_CENTER_MANDATORY: String(record.isCostCenterMandatory ?? 0),
    IS_BUDGET_HEAD: String(record.isBudgetHead ?? 0),
    OPENING_DATE: record.openingDate ? String(record.openingDate).slice(0, 10) : '',
    OPENING_BALANCE: String(record.openingBalance ?? 0),
    BALANCE_DR: String(record.balanceDr ?? 0),
    BALANCE_CR: String(record.balanceCr ?? 0),
    CURRENT_DR: String(record.currentDr ?? 0),
    CURRENT_CR: String(record.currentCr ?? 0),
    STATUS: String(record.status ?? 1),
    API_RECORD: record,
  }
}

function optionalNumber(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

export function mapChartOfAccountToApi(values, originalRecord = {}) {
  return {
    ...originalRecord,
    slNo: Number(values.SL_NO),
    companyId: Number(values.COMPANY_ID),
    accountCode: values.ACCOUNT_CODE,
    accountHead: values.ACCOUNT_HEAD,
    ledgerHeadType: values.LEDGER_HEAD_TYPE,
    accountType: values.ACCOUNT_TYPE,
    parentAccountHeadId: optionalNumber(values.PARENT_ACCOUNT_HEAD_ID),
    accountUsage: values.ACCOUNT_USAGE,
    isCostCenterMandatory: Number(values.IS_COST_CENTER_MANDATORY),
    isBudgetHead: Number(values.IS_BUDGET_HEAD),
    openingDate: values.OPENING_DATE || null,
    openingBalance: Number(values.OPENING_BALANCE || 0),
    balanceDr: Number(values.BALANCE_DR || 0),
    balanceCr: Number(values.BALANCE_CR || 0),
    currentDr: Number(values.CURRENT_DR || 0),
    currentCr: Number(values.CURRENT_CR || 0),
    status: Number(values.STATUS),
  }
}
