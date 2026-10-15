/** @file Converts Designation API records to and from form field names. */
export function mapDesignationFromApi(record = {}, groupNames = new Map()) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    GROUP_NAME: groupNames.get(String(record.bgId)) || '',
    DESIGNATION_NAME: record.designationName ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapDesignationToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    designationName: values.DESIGNATION_NAME,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
