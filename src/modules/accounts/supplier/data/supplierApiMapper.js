/**
 * @file Inbound and outbound data mappers between AFM_SUPPLIER_INFO API and UI state.
 */

function formatAuditDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `${day}/${month}/${year} ${time}`
}

export function mapSupplierFromApi(record = {}) {
  if (!record) return null

  const createdUserId = record.createdUserId != null ? String(record.createdUserId) : ''
  const createdEmpId = record.createdEmpId != null ? String(record.createdEmpId) : ''
  const updatedUserId = record.updatedUserId != null ? String(record.updatedUserId) : ''
  const updatedEmpId = record.updatedEmpId != null ? String(record.updatedEmpId) : ''

  return {
    ID: record.id != null ? String(record.id) : '',
    BG_ID: record.bgId != null ? String(record.bgId) : '',
    BU_ID: record.buId != null ? String(record.buId) : '',
    GROUP_NAME: record.groupName || '',
    BUSINESS_UNIT: record.businessUnitName || '',

    SUPPLIER_CODE: record.supplierCode || '',
    SUPPLIER_NAME: record.supplierName || '',
    SUPPLIER_TYPE: record.supplierType || '',
    BUSINESS_TYPE: record.businessType || '',

    CONTACT_PERSON: record.contactPerson || '',
    DESIGNATION: record.designation || '',
    PHONE: record.phone || '',
    ALTERNATE_PHONE: record.alternatePhone || '',
    EMAIL: record.email || '',
    WEBSITE: record.website || '',

    COUNTRY_ID: record.countryId != null ? String(record.countryId) : '',
    DIVISION: record.division || '',
    DISTRICT: record.district || '',
    ADDRESS: record.address || '',
    POSTAL_CODE: record.postalCode || '',

    TAX_REGISTRATION_NO: record.taxRegistrationNo || '',
    TIN_NUMBER: record.tinNumber || '',
    TRADE_LICENSE_NO: record.tradeLicenseNo || '',

    BANK_NAME: record.bankName || '',
    BANK_BRANCH: record.bankBranch || '',
    BANK_ACCOUNT_NAME: record.bankAccountName || '',
    BANK_ACCOUNT_NO: record.bankAccountNo || '',
    ROUTING_NUMBER: record.routingNumber || '',

    PAYMENT_TERMS: record.paymentTerms || '',
    CREDIT_LIMIT: record.creditLimit != null ? String(record.creditLimit) : '0.00',
    CREDIT_DAYS: record.creditDays != null ? String(record.creditDays) : '0',
    CURRENCY_CODE: record.currencyCode || 'BDT',
    OPENING_BALANCE: record.openingBalance != null ? String(record.openingBalance) : '0.00',
    BALANCE_TYPE: record.balanceType || '',

    REMARKS: record.remarks || '',
    STATUS: record.status != null ? String(record.status) : '1',

    // Audit Info
    CREATED_USER_ID: createdUserId,
    CREATED_USER_NAME: record.createdUserName || createdUserId || '-',
    CREATED_EMP_ID: createdEmpId,
    CREATED_EMP_NAME: record.createdEmpName || createdEmpId || '-',
    CREATED_DATETIME: record.createdDatetime || null,
    CREATED_APP: record.createdApp || '-',

    UPDATED_USER_ID: updatedUserId,
    UPDATED_USER_NAME: record.updatedUserName || updatedUserId || '-',
    UPDATED_EMP_ID: updatedEmpId,
    UPDATED_EMP_NAME: record.updatedEmpName || updatedEmpId || '-',
    UPDATED_DATETIME: record.updatedDatetime || null,
    UPDATED_APP: record.updatedApp || '-',

    AUDIT_LOG: {
      STATUS: record.status != null ? String(record.status) : '1',
      CREATED_USER_ID: createdUserId,
      CREATED_USER_NAME: record.createdUserName || createdUserId || '-',
      CREATED_EMP_ID: createdEmpId,
      CREATED_EMP_NAME: record.createdEmpName || createdEmpId || '-',
      CREATED_DATETIME: record.createdDatetime || null,
      CREATED_APP: record.createdApp || '-',

      UPDATED_USER_ID: updatedUserId,
      UPDATED_USER_NAME: record.updatedUserName || updatedUserId || '-',
      UPDATED_EMP_ID: updatedEmpId,
      UPDATED_EMP_NAME: record.updatedEmpName || updatedEmpId || '-',
      UPDATED_DATETIME: record.updatedDatetime || null,
      UPDATED_APP: record.updatedApp || '-',
    },
  }
}

export function mapSupplierToApi(values = {}) {
  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : null,
    buId: values.BU_ID ? Number(values.BU_ID) : null,

    supplierCode: values.SUPPLIER_CODE ? String(values.SUPPLIER_CODE).trim() : null,
    supplierName: values.SUPPLIER_NAME ? String(values.SUPPLIER_NAME).trim() : null,
    supplierType: values.SUPPLIER_TYPE ? String(values.SUPPLIER_TYPE).trim() : null,
    businessType: values.BUSINESS_TYPE ? String(values.BUSINESS_TYPE).trim() : null,

    contactPerson: values.CONTACT_PERSON ? String(values.CONTACT_PERSON).trim() : null,
    designation: values.DESIGNATION ? String(values.DESIGNATION).trim() : null,
    phone: values.PHONE ? String(values.PHONE).trim() : null,
    alternatePhone: values.ALTERNATE_PHONE ? String(values.ALTERNATE_PHONE).trim() : null,
    email: values.EMAIL ? String(values.EMAIL).trim() : null,
    website: values.WEBSITE ? String(values.WEBSITE).trim() : null,

    countryId: values.COUNTRY_ID ? Number(values.COUNTRY_ID) : null,
    division: values.DIVISION ? String(values.DIVISION).trim() : null,
    district: values.DISTRICT ? String(values.DISTRICT).trim() : null,
    address: values.ADDRESS ? String(values.ADDRESS).trim() : null,
    postalCode: values.POSTAL_CODE ? String(values.POSTAL_CODE).trim() : null,

    taxRegistrationNo: values.TAX_REGISTRATION_NO ? String(values.TAX_REGISTRATION_NO).trim() : null,
    tinNumber: values.TIN_NUMBER ? String(values.TIN_NUMBER).trim() : null,
    tradeLicenseNo: values.TRADE_LICENSE_NO ? String(values.TRADE_LICENSE_NO).trim() : null,

    bankName: values.BANK_NAME ? String(values.BANK_NAME).trim() : null,
    bankBranch: values.BANK_BRANCH ? String(values.BANK_BRANCH).trim() : null,
    bankAccountName: values.BANK_ACCOUNT_NAME ? String(values.BANK_ACCOUNT_NAME).trim() : null,
    bankAccountNo: values.BANK_ACCOUNT_NO ? String(values.BANK_ACCOUNT_NO).trim() : null,
    routingNumber: values.ROUTING_NUMBER ? String(values.ROUTING_NUMBER).trim() : null,

    paymentTerms: values.PAYMENT_TERMS ? String(values.PAYMENT_TERMS).trim() : null,
    creditLimit: values.CREDIT_LIMIT !== '' && values.CREDIT_LIMIT != null ? Number(values.CREDIT_LIMIT) : 0,
    creditDays: values.CREDIT_DAYS !== '' && values.CREDIT_DAYS != null ? Number(values.CREDIT_DAYS) : 0,
    currencyCode: values.CURRENCY_CODE ? String(values.CURRENCY_CODE).trim() : 'BDT',
    openingBalance: values.OPENING_BALANCE !== '' && values.OPENING_BALANCE != null ? Number(values.OPENING_BALANCE) : 0,
    balanceType: values.BALANCE_TYPE ? String(values.BALANCE_TYPE).trim() : null,

    remarks: values.REMARKS ? String(values.REMARKS).trim() : null,
    status: values.STATUS !== undefined && values.STATUS !== '' ? Number(values.STATUS) : 1,
  }
}

