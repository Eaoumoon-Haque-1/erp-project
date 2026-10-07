/**
 * @file Temporary in-memory ASSET_VENDOR repository.
 * Replace this boundary when Vendor / Supplier endpoints are documented.
 */
let records = [
  {
    ID: '1',
    VENDOR_NAME: 'Tech Source Bangladesh Ltd.',
    VENDOR_CODE: 'TSBL-001',
    CONTACT_PERSON: 'Mahmud Hasan',
    PHONE: '+880 1712-345678',
    EMAIL: 'sales@techsource.example',
    ADDRESS: 'Banani, Dhaka',
    TAX_ID: 'BIN-001234567',
    STATUS: '1',
  },
]

export function listVendorSuppliers() {
  return records.map((record) => ({ ...record }))
}

export function getVendorSupplier(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createVendorSupplier(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateVendorSupplier(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getVendorSupplier(id)
}

export function removeVendorSupplier(id) {
  records = records.filter((record) => record.ID !== String(id))
}
