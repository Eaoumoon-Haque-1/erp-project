/**
 * @file Inbound and outbound data mappers between AFM_CUSTOMER_INFO API and UI state.
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

export function mapCustomerFromApi(record = {}) {
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

    CUSTOMER_CODE: record.customerCode || '',
    CUSTOMER_NAME: record.customerName || '',
    CUSTOMER_TYPE: record.customerType || '',
    BUSINESS_TYPE: record.businessType || '',
    CUSTOMER_CATEGORY_ID: record.customerCategoryId != null ? String(record.customerCategoryId) : '',

    CONTACT_PERSON: record.contactPerson || '',
    DESIGNATION: record.designation || '',
    PHONE: record.phone || '',
    ALTERNATE_PHONE: record.alternatePhone || record.whatsappNo || '',
    WHATSAPP_NO: record.alternatePhone || record.whatsappNo || '',
    EMAIL: record.email || '',
    WEBSITE: record.website || '',

    COUNTRY_ID: record.countryId != null ? String(record.countryId) : '',
    DIVISION: record.division || '',
    DISTRICT: record.district || '',
    ADDRESS: record.address || '',
    POSTAL_CODE: record.postalCode || '',
    SHIPPING_ADDRESS: record.shippingAddress || '',

    TAX_REGISTRATION_NO: record.taxRegistrationNo || '',
    TIN_NUMBER: record.tinNumber || '',

    PAYMENT_TERMS: record.paymentTerms || '',
    CREDIT_LOWER_LIMIT: record.creditLowerLimit != null ? String(record.creditLowerLimit) : '0.00',
    CREDIT_UPPER_LIMIT: record.creditUpperLimit != null ? String(record.creditUpperLimit) : '0.00',
    CREDIT_LIMIT: record.creditUpperLimit != null ? String(record.creditUpperLimit) : record.creditLimit != null ? String(record.creditLimit) : '0.00',
    CREDIT_DAYS: record.creditDays != null ? String(record.creditDays) : '0',
    CURRENCY_CODE: record.currencyCode || 'BDT',
    OPENING_BALANCE: record.openingBalance != null ? String(record.openingBalance) : '0.00',
    BALANCE_TYPE: record.balanceType || '',
    AGREEMENT_DATE_FROM: record.agreementDateFrom ? String(record.agreementDateFrom).substring(0, 10) : '',
    AGREEMENT_DATE_TO: record.agreementDateTo ? String(record.agreementDateTo).substring(0, 10) : '',
    FINANCE_STATUS: record.financeStatus || record.financialStatus || 'Draft',
    ACTIVE_AGREEMENT_ID: record.activeAgreementId != null ? String(record.activeAgreementId) : '',

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
      FINANCE_STATUS: record.financeStatus || record.financialStatus || 'Draft',
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

export function mapCustomerToApi(values = {}) {
  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : null,
    buId: values.BU_ID ? Number(values.BU_ID) : null,

    customerCode: values.CUSTOMER_CODE ? String(values.CUSTOMER_CODE).trim() : null,
    customerName: values.CUSTOMER_NAME ? String(values.CUSTOMER_NAME).trim() : null,
    customerType: values.CUSTOMER_TYPE ? String(values.CUSTOMER_TYPE).trim() : null,
    businessType: values.BUSINESS_TYPE ? String(values.BUSINESS_TYPE).trim() : null,
    customerCategoryId: values.CUSTOMER_CATEGORY_ID ? Number(values.CUSTOMER_CATEGORY_ID) : null,

    contactPerson: values.CONTACT_PERSON ? String(values.CONTACT_PERSON).trim() : null,
    designation: values.DESIGNATION ? String(values.DESIGNATION).trim() : null,
    phone: values.PHONE ? String(values.PHONE).trim() : null,
    alternatePhone: values.ALTERNATE_PHONE || values.WHATSAPP_NO ? String(values.ALTERNATE_PHONE || values.WHATSAPP_NO).trim() : null,
    email: values.EMAIL ? String(values.EMAIL).trim() : null,
    website: values.WEBSITE ? String(values.WEBSITE).trim() : null,

    countryId: values.COUNTRY_ID ? Number(values.COUNTRY_ID) : null,
    division: values.DIVISION ? String(values.DIVISION).trim() : null,
    district: values.DISTRICT ? String(values.DISTRICT).trim() : null,
    address: values.ADDRESS ? String(values.ADDRESS).trim() : null,
    postalCode: values.POSTAL_CODE ? String(values.POSTAL_CODE).trim() : null,
    shippingAddress: values.SHIPPING_ADDRESS ? String(values.SHIPPING_ADDRESS).trim() : null,

    taxRegistrationNo: values.TAX_REGISTRATION_NO ? String(values.TAX_REGISTRATION_NO).trim() : null,
    tinNumber: values.TIN_NUMBER ? String(values.TIN_NUMBER).trim() : null,

    paymentTerms: values.PAYMENT_TERMS ? String(values.PAYMENT_TERMS).trim() : null,
    creditLowerLimit: values.CREDIT_LOWER_LIMIT !== '' && values.CREDIT_LOWER_LIMIT != null ? Number(values.CREDIT_LOWER_LIMIT) : null,
    creditUpperLimit: values.CREDIT_UPPER_LIMIT !== '' && values.CREDIT_UPPER_LIMIT != null ? Number(values.CREDIT_UPPER_LIMIT) : null,
    creditDays: values.CREDIT_DAYS !== '' && values.CREDIT_DAYS != null ? Number(values.CREDIT_DAYS) : 0,
    currencyCode: values.CURRENCY_CODE ? String(values.CURRENCY_CODE).trim() : 'BDT',
    openingBalance: values.OPENING_BALANCE !== '' && values.OPENING_BALANCE != null ? Number(values.OPENING_BALANCE) : 0,
    balanceType: values.BALANCE_TYPE ? String(values.BALANCE_TYPE).trim() : null,
    agreementDateFrom: values.AGREEMENT_DATE_FROM ? String(values.AGREEMENT_DATE_FROM).trim() : null,
    agreementDateTo: values.AGREEMENT_DATE_TO ? String(values.AGREEMENT_DATE_TO).trim() : null,
    financeStatus: values.FINANCE_STATUS ? String(values.FINANCE_STATUS).trim() : 'Draft',

    remarks: values.REMARKS ? String(values.REMARKS).trim() : null,
    status: values.STATUS !== undefined && values.STATUS !== '' ? Number(values.STATUS) : 1,
  }
}

