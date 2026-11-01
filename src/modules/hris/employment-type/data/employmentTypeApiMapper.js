/** @file Converts Employment Type API records to and from form field names. */
export function mapEmploymentTypeFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    TYPE_NAME: record.typeName ?? '',
    SHORT_NAME: record.shortName ?? '',
    IS_DEFAULT: String(record.isDefault ?? 0),
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    IS_DATE_FIELD_REQUIRED: String(record.isDateFieldRequired ?? 0),
    DATE_FIELD_LABEL: record.dateFieldLabel ?? '',
    CATEGORY: record.category ?? '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapEmploymentTypeToApi(values) {
  return {
    typeName: values.TYPE_NAME,
    shortName: values.SHORT_NAME || null,
    isDefault: Number(values.IS_DEFAULT),
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    isDateFieldRequired: Number(values.IS_DATE_FIELD_REQUIRED),
    dateFieldLabel: values.IS_DATE_FIELD_REQUIRED === '1'
      ? values.DATE_FIELD_LABEL || null
      : null,
    category: values.CATEGORY || null,
    status: Number(values.STATUS),
  }
}
