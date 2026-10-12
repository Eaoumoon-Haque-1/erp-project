/** @file Converts HR Lookup Type records between API and form field names. */
export function mapHrLookupTypeFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    TYPE_NAME: record.typeName ?? '',
    CODE: record.code ?? '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapHrLookupTypeToApi(values) {
  return {
    typeName: values.TYPE_NAME,
    code: values.CODE || null,
    status: Number(values.STATUS),
  }
}
