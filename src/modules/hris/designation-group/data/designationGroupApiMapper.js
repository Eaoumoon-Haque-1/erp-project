/** @file Converts Designation Group API records to and from UI field names. */
export function mapDesignationGroupFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    BU_ID: String(record.buId ?? ''),
    DESIG_ID: String(record.desigId ?? ''),
    STATUS: String(record.status ?? 1),
  }
}

export function mapDesignationGroupToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    desigId: Number(values.DESIG_ID),
    status: Number(values.STATUS),
  }
}
