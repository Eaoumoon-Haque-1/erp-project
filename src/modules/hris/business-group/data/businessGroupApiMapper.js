/**
 * @file Translates Business Group API camelCase fields to the spreadsheet-style
 * field names used by the existing form components, and back again.
 */
export function mapBusinessGroupFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    GROUP_NAME: record.groupName ?? '',
    BG_LOGO: record.bgLogo ?? '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapBusinessGroupToApi(values) {
  return {
    groupName: values.GROUP_NAME,
    bgLogo: typeof values.BG_LOGO === 'string' ? values.BG_LOGO : '',
    status: Number(values.STATUS),
  }
}
