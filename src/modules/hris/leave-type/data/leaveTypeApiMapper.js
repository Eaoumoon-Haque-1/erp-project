/** @file Converts Leave Type API records to and from form field names. */
export function mapLeaveTypeFromApi(record = {}, groupNames = new Map()) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    GROUP_NAME: groupNames.get(String(record.bgId)) || '',
    TYPE_NAME: record.typeName ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapLeaveTypeToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    typeName: values.TYPE_NAME,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
