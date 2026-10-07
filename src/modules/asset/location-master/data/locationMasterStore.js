/**
 * @file Temporary in-memory ASSET_LOCATION repository.
 * Replace this boundary when Location Master endpoints are documented.
 */
let records = [
  {
    ID: '1',
    CUSTODIAN_ID: '1',
    CUSTODIAN_NAME: 'Information Technology',
    SUB_CUSTODIAN_ID: '1',
    SUB_CUSTODIAN_NAME: 'IT Store',
    LOCATION_NAME: 'Head Office IT Store',
    LOCATION_CODE: 'HO-IT-01',
    ADDRESS: 'Head Office, Dhaka',
    BUILDING: 'Main Building',
    FLOOR: '3rd Floor',
    ROOM: 'Room 301',
    STATUS: '1',
  },
]

export function listLocationMasters() {
  return records.map((record) => ({ ...record }))
}

export function getLocationMaster(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createLocationMaster(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  return { ...record }
}

export function updateLocationMaster(id, values) {
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  return getLocationMaster(id)
}

export function removeLocationMaster(id) {
  records = records.filter((record) => record.ID !== String(id))
}
