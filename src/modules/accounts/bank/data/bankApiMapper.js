/**
 * @file Inbound and outbound data mappers between Bank API and UI state.
 */
import { createInitialBankDetailRow } from '../validation/bankValidation'

/**
 * Maps a single detail row from backend DTO to form state.
 */
export function mapBankDetailFromApi(detail = {}) {
  return createInitialBankDetailRow({
    _ROW_ID: detail.id ? `detail_${detail.id}` : `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ID: detail.id ? String(detail.id) : '',
    BG_ID: detail.bgId != null ? String(detail.bgId) : '',
    BU_ID: detail.buId != null ? String(detail.buId) : '',
    AFM_BANK_ID: detail.afmBankId != null ? String(detail.afmBankId) : '',
    BRANCH_NAME: detail.branchName ?? '',
    ADDRESS: detail.address ?? '',
    ACCOUNT_TYPE: detail.accountType ?? 'Current Account',
    ACCOUNT_NAME: detail.accountName ?? '',
    ACCOUNT_NUMBER: detail.accountNumber ?? '',
    OPENING_DATE: detail.openingDate ?? '',
    OPENING_BALANCE: detail.openingBalance != null ? String(detail.openingBalance) : '0.00',
    STATUS: String(detail.status ?? 1),
  })
}

/**
 * Maps a master AFM_BANK record and its details from API to UI representation.
 */
export function mapBankFromApi(record = {}, groupNames = new Map(), unitNames = new Map()) {
  const details = Array.isArray(record.bankDetails)
    ? record.bankDetails.map(mapBankDetailFromApi)
    : []

  return {
    ID: record.id != null ? String(record.id) : '',
    BG_ID: record.bgId != null ? String(record.bgId) : '',
    BU_ID: record.buId != null ? String(record.buId) : '',
    GROUP_NAME: groupNames.get(String(record.bgId)) || '',
    BUSINESS_UNIT: unitNames.get(String(record.buId)) || '',
    BANK_NAME: record.bankName ?? '',
    SHORT_NAME: record.shortName ?? '',
    STATUS: String(record.status ?? 1),
    BANK_DETAILS: details,
    ACCOUNT_COUNT: details.length,
    ACTIVE_ACCOUNT_COUNT: details.filter((d) => String(d.STATUS) === '1').length,
    CREATED_DATETIME: record.createdDatetime ?? '',
    UPDATED_DATETIME: record.updatedDatetime ?? '',
  }
}

/**
 * Maps UI form state to backend AfmBankRequestDto.
 */
export function mapBankToApi(values = {}, rows = []) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    bankName: String(values.BANK_NAME ?? '').trim(),
    shortName: String(values.SHORT_NAME ?? '').trim() || null,
    status: Number(values.STATUS ?? 1),
    bankDetails: rows.map((row) => ({
      id: row.ID ? Number(row.ID) : null,
      bgId: Number(values.BG_ID),
      buId: Number(values.BU_ID),
      afmBankId: values.ID ? Number(values.ID) : null,
      branchName: String(row.BRANCH_NAME ?? '').trim() || null,
      address: String(row.ADDRESS ?? '').trim() || null,
      accountType: String(row.ACCOUNT_TYPE ?? 'Current Account').trim() || null,
      accountName: String(row.ACCOUNT_NAME ?? '').trim(),
      accountNumber: String(row.ACCOUNT_NUMBER ?? '').trim(),
      openingDate: row.OPENING_DATE || null,
      openingBalance: row.OPENING_BALANCE !== '' ? Number(row.OPENING_BALANCE) : 0,
      status: Number(row.STATUS ?? 1),
    })),
  }
}
