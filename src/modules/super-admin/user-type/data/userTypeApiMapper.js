/**
 * @file User Type API mapping.
 * Swagger currently persists only userType and isActive. Existing HR-specific
 * Group/Short Name/Sort Order fields stay in the form contract but are not
 * represented by the documented backend schema.
 */
export function mapUserTypeFromApi(record = {}, businessGroupId = '') {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? record.businessGroupId ?? businessGroupId),
    TYPE_NAME: record.userType ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder === null || record.sortOrder === undefined
      ? ''
      : String(record.sortOrder),
    STATUS: String(record.isActive ?? 1),
  }
}

export function mapUserTypeToApi(values) {
  return {
    userType: values.TYPE_NAME,
    isActive: Number(values.STATUS),
  }
}
