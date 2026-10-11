/**
 * @file Translates Business Group API camelCase fields to the spreadsheet-style
 * field names used by the existing form components, and back again.
 */
import { fileToDataUrl } from '../../../../utils/imageDataUrl'

export function mapBusinessGroupFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    GROUP_NAME: record.groupName ?? '',
    BG_LOGO: record.bgLogo ?? '',
    STATUS: String(record.status ?? 1),
  }
}

export async function mapBusinessGroupToApi(values) {
  return {
    groupName: values.GROUP_NAME,
    bgLogo: await fileToDataUrl(values.BG_LOGO),
    status: Number(values.STATUS),
  }
}
