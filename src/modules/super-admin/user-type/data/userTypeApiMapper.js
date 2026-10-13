/** @file User Type API mapping for the BaseEntity-backed contract. */
export function mapUserTypeFromApi(record = {}, businessGroupId = '') {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? record.businessGroupId ?? businessGroupId),
    TYPE_NAME: record.typeName ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder === null || record.sortOrder === undefined
      ? ''
      : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapUserTypeToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    typeName: values.TYPE_NAME,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
