/**
 * @file Custodian endpoint contract and backend-error-to-field mapping.
 * PUT replaces the whole sub custodian list: rows sent with an id are updated,
 * rows without an id are created, saved rows that are not sent become Inactive.
 */
import apiClient from './client'
import { createCrudApi, unwrapApiResponse } from './createCrudApi'
import { normalizeApiError } from './errors'

const crud = createCrudApi('/custodians')

export const custodiansApi = {
  ...crud,
  // buId is optional; omit it to list every custodian of the caller's group.
  list: (buId) => unwrapApiResponse(
    apiClient.get('/custodians', { params: buId ? { buId } : undefined }),
  ),
}

/**
 * The single place that maps backend messages to form fields (409/400 only).
 * Returns { message, field, subRowIds } - everything else is alert-only.
 *   field:         'CUSTODIAN_NAME' when the message is about the parent name
 *   subRowIds:     _ROW_IDs of sub rows whose name appears in the message
 */
export function mapCustodianApiError(error, rows = [], fallbackMessage) {
  const { status, message } = normalizeApiError(error, fallbackMessage)
  const result = { message, field: null, subRowIds: [] }
  if (status !== 409 && status !== 400) return result

  const text = String(message).toLowerCase()
  if (/sub[\s-]*custodian/.test(text)) {
    result.subRowIds = rows
      .filter((row) => {
        const name = String(row.SUB_CUSTODIAN_NAME ?? '').trim().toLowerCase()
        return name && text.includes(name)
      })
      .map((row) => row._ROW_ID)
  } else if (/custodian/.test(text)) {
    result.field = 'CUSTODIAN_NAME'
  }

  return result
}
