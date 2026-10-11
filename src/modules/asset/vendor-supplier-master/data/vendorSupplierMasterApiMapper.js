/**
 * @file Converts between the Supplier API schema (camelCase, numeric ids/status)
 * and the UPPER_SNAKE form state (string ids, '1'/'0' flags).
 */
const idToString = (value) => (value === null || value === undefined ? '' : String(value))

export function mapSupplierFromApi(record = {}) {
  return {
    ID: idToString(record.id),
    BG_ID: idToString(record.bgId),
    BU_ID: idToString(record.buId),
    SUPPLIER_NAME: record.supplierName ?? '',
    SUPPLIER_CODE: record.supplierCode ?? '',
    CONTACT_PERSON: record.contactPerson ?? '',
    PHONE: record.phone ?? '',
    EMAIL: record.email ?? '',
    ADDRESS: record.address ?? '',
    COMPANY_TYPE: record.companyType ?? '',
    TAX_ID: record.taxId ?? '',
    STATUS: String(record.status ?? 1),
  }
}

// Company Type is optional: an empty value is sent as null.
export function mapSupplierToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    supplierName: values.SUPPLIER_NAME,
    supplierCode: values.SUPPLIER_CODE,
    contactPerson: values.CONTACT_PERSON,
    phone: values.PHONE,
    email: values.EMAIL,
    address: values.ADDRESS,
    companyType: values.COMPANY_TYPE || null,
    taxId: values.TAX_ID,
    status: Number(values.STATUS),
  }
}
