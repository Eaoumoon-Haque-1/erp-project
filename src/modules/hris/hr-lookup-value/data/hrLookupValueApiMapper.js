/** @file Converts HR Lookup Value records between API and form field names. */
export function mapHrLookupValueFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    TYPE_ID: String(record.typeId ?? ''),
    VALUE: record.value ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapHrLookupValueToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    typeId: Number(values.TYPE_ID),
    value: values.VALUE,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
