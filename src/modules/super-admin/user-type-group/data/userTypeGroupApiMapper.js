/** @file Mapping between the User Type Group bulk DTO and form rows. */
export function normalizeUserTypeGroupStatus(value, fallback = '1') {
  if (value === null || value === undefined || value === '') return fallback
  if (value === true) return '1'
  if (value === false) return '0'
  return ['1', 'true', 'active'].includes(String(value).trim().toLowerCase()) ? '1' : '0'
}

export function mapUserTypeGroupFromApi(record = {}, businessUnitNames = new Map()) {
  return {
    USER_TYPE_ID: String(record.userTypeId ?? ''),
    BG_ID: String(record.bgId ?? ''),
    rows: (record.businessUnits || []).map((row, index) => ({
      ID: row.id == null ? `new-${row.buId}-${index}` : `saved-${row.id}`,
      MAPPING_ID: row.id == null ? null : Number(row.id),
      BU_ID: String(row.buId ?? ''),
      BUSINESS_UNIT_NAME: businessUnitNames.get(String(row.buId)) || `Business Unit #${row.buId}`,
      STATUS: normalizeUserTypeGroupStatus(row.status),
    })),
  }
}

export function mapUserTypeGroupToApi(values, rows) {
  return {
    userTypeId: Number(values.USER_TYPE_ID),
    bgId: Number(values.BG_ID),
    businessUnits: rows.map((row) => ({
      id: row.MAPPING_ID == null ? null : Number(row.MAPPING_ID),
      buId: Number(row.BU_ID),
      status: Number(normalizeUserTypeGroupStatus(row.STATUS)),
    })),
  }
}
