/** @file Converts Department API records to and from form field names. */
export function mapDepartmentFromApi(record = {}, groupNames = new Map()) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    GROUP_NAME: groupNames.get(String(record.bgId)) || '',
    DEPARTMENT_NAME: record.departmentName ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: String(record.status ?? 1),
  }
}

export function mapDepartmentToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    departmentName: values.DEPARTMENT_NAME,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
