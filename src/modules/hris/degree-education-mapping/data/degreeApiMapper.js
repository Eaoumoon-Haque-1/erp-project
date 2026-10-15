/** @file Converts Degree API records to and from form field names. */
export function mapDegreeFromApi(record = {}, levelNames = new Map()) {
  return {
    ID: String(record.id ?? ''),
    LEVEL_OF_EDU_ID: String(record.levelOfEduId ?? ''),
    LEVEL_OF_EDU_NAME: levelNames.get(String(record.levelOfEduId)) || '',
    DEGREE_NAME: record.degreeName ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapDegreeToApi(values) {
  return {
    levelOfEduId: Number(values.LEVEL_OF_EDU_ID),
    degreeName: values.DEGREE_NAME,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
