/**
 * @file Supplier endpoint contract and backend-error-to-field mapping.
 * The body is a flat object (numeric bgId/buId/status plus text fields).
 */
import apiClient from './client'
import { createCrudApi, unwrapApiResponse } from './createCrudApi'
import { normalizeApiError } from './errors'

export const suppliersApi = {
  ...createCrudApi('/suppliers'),
  // buId is optional; omit it to list every supplier of the caller's group.
  list: (buId) => unwrapApiResponse(
    apiClient.get('/suppliers', { params: buId ? { buId } : undefined }),
  ),
}

// Checked in order; the first match wins.
const FIELD_PATTERNS = [
  ['TAX_ID', /tax id|\bbin\b/],
  ['SUPPLIER_CODE', /supplier code/],
  ['SUPPLIER_NAME', /supplier name/],
  ['CONTACT_PERSON', /contact person/],
  ['PHONE', /phone/],
  ['EMAIL', /email/],
  ['ADDRESS', /address/],
  ['COMPANY_TYPE', /company type/],
]

/**
 * The single place that maps backend messages to form fields (400/409 only).
 * Returns { message, field }; field is null when the message is alert-only.
 */
export function mapSupplierApiError(error, fallbackMessage) {
  const { status, message } = normalizeApiError(error, fallbackMessage)
  if (status !== 409 && status !== 400) return { message, field: null }

  const text = String(message).toLowerCase()
  const match = FIELD_PATTERNS.find(([, pattern]) => pattern.test(text))
  return { message, field: match ? match[0] : null }
}
