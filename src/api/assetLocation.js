/**
 * @file Asset Location endpoint contract and backend-error-to-field mapping.
 * The body is a flat object of numeric ids plus text fields; there is no
 * nested list, so PUT is a plain full update.
 */
import apiClient from './client'
import { createCrudApi, unwrapApiResponse } from './createCrudApi'
import { normalizeApiError } from './errors'

export const assetLocationsApi = {
  ...createCrudApi('/asset-locations'),
  // buId is optional; omit it to list every location of the caller's group.
  list: (buId) => unwrapApiResponse(
    apiClient.get('/asset-locations', { params: buId ? { buId } : undefined }),
  ),
}

// Checked in order; the first match wins (more specific patterns first).
const FIELD_PATTERNS = [
  ['LOCATION_CODE', /location code/],
  ['LOCATION_NAME', /location name/],
  ['ADDRESS', /address/],
  ['SUB_CUSTODIAN_ID', /sub[\s-]*custodian/],
  ['CUSTODIAN_ID', /custodian/],
  ['DEPT_ID', /department/],
  ['BUILDING', /building/],
  ['FLOOR', /floor/],
  ['ROOM', /room/],
]

/**
 * The single place that maps backend messages to form fields (400/409 only).
 * Returns { message, field }; field is null when the message is alert-only.
 */
export function mapAssetLocationApiError(error, fallbackMessage) {
  const { status, message } = normalizeApiError(error, fallbackMessage)
  if (status !== 409 && status !== 400) return { message, field: null }

  const text = String(message).toLowerCase()
  const match = FIELD_PATTERNS.find(([, pattern]) => pattern.test(text))
  return { message, field: match ? match[0] : null }
}
