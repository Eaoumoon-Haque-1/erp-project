/** @file Converts Employment Type API records to and from form field names. */
export function mapEmploymentTypeFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    TYPE_NAME: record.typeName ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapEmploymentTypeToApi(values) {
  return {
    typeName: values.TYPE_NAME,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
