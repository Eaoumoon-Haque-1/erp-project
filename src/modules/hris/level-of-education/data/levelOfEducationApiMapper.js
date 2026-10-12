/** @file Converts Level of Education records between API and form field names. */
export function mapLevelOfEducationFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    LEVEL_OF_EDU: record.levelOfEdu ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapLevelOfEducationToApi(values) {
  return {
    levelOfEdu: values.LEVEL_OF_EDU,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
