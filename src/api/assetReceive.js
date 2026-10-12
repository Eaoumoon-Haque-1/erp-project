/**
 * @file Asset Receive endpoint contract and backend-error-to-field mapping.
 * There is no delete: a record is cancelled/reactivated with PATCH .../status.
 * PUT replaces the whole specs list (id = update, no id = new, saved row not
 * sent = soft-removed by the backend).
 */
import apiClient from './client'
import { unwrapApiResponse } from './createCrudApi'
import { normalizeApiError } from './errors'

export const assetReceivesApi = {
  // buId is optional; omit it to list every receive of the caller's group.
  list: (buId) => unwrapApiResponse(
    apiClient.get('/asset-receives', { params: buId ? { buId } : undefined }),
  ),
  get: (id) => unwrapApiResponse(apiClient.get(`/asset-receives/${id}`)),
  create: (payload) => unwrapApiResponse(apiClient.post('/asset-receives', payload)),
  update: (id, payload) => unwrapApiResponse(apiClient.put(`/asset-receives/${id}`, payload)),
  setStatus: (id, status) => unwrapApiResponse(
    apiClient.patch(`/asset-receives/${id}/status`, null, { params: { status } }),
  ),
}

// Checked in order; the first match wins (more specific patterns first).
const FIELD_PATTERNS = [
  ['WG_PERIOD', /(warranty|guaranty).*period|period.*(warranty|guaranty)/],
  ['WG_TYPE_ID', /(warranty|guaranty).*type/],
  ['WG_START_DATE', /(warranty|guaranty).*start/],
  ['WG_END_DATE', /(warranty|guaranty).*end/],
  ['WG_OTHER_INFO', /(warranty|guaranty).*(other|info)/],
  ['WG_APPLICABLE', /warranty|guaranty/],
  ['ASSET_NO', /asset no/],
  ['GRN_DATE', /grn date/],
  ['PURCHASE_DATE', /purchase date/],
  ['SUB_CUSTODIAN_ID', /sub[\s-]*custodian/],
  ['CUSTODIAN_ID', /custodian/],
  ['SUPPLIER_ID', /supplier/],
  ['ITEM_NAME_ID', /asset item/],
  ['UOM_ID', /uom/],
  ['QTY', /qty/],
  ['UNIT_PRICE', /unit price/],
  ['DISCOUNT', /discount/],
  ['OTHER_CHARGES', /capitalized/],
  ['CURRENCY_ID', /currency/],
  ['LOCATION_ID', /location/],
  ['DEPRI_CATEGORY_ID', /depreciation category/],
  ['DEPRI_METHOD_ID', /depreciation method/],
  ['ASSET_TYPE_ID', /asset type/],
  ['DEPRI_LIFE', /depreciation period/],
  ['DEPRI_PERCENTAGE', /depreciation percentage/],
  ['ASSET_OWNER_ID', /asset owner/],
]

/**
 * The single place that maps backend messages to form fields (400/409 only).
 * Returns { message, field, specRowIds }; both are empty when alert-only.
 *   specRowIds: _ROW_IDs of spec rows whose equipment name appears in a
 *               "duplicate equipment name" message.
 */
export function mapAssetReceiveApiError(error, specRows = [], fallbackMessage) {
  const { status, message } = normalizeApiError(error, fallbackMessage)
  const result = { message, field: null, specRowIds: [] }
  if (status !== 409 && status !== 400) return result

  const text = String(message).toLowerCase()
  if (/duplicate equipment name/.test(text)) {
    result.specRowIds = specRows
      .filter((row) => {
        const name = String(row.EQUIPMENT_NAME ?? '').trim().toLowerCase()
        return name && text.includes(name)
      })
      .map((row) => row._ROW_ID)
    return result
  }

  const match = FIELD_PATTERNS.find(([, pattern]) => pattern.test(text))
  if (match) result.field = match[0]
  return result
}
