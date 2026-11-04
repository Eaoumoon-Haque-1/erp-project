/** @file Reference options for Asset Disposal (Asset Items, Employees/Approvers, Disposal Types & Reasons). */
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { assetLookupValuesApi } from '../../asset-lookup-value/api/assetLookupValueApi'

export const fallbackDisposalTypes = [
  { value: 'SALE', label: 'Sale' },
  { value: 'SCRAP', label: 'Scrap' },
  { value: 'DONATION', label: 'Donation' },
  { value: 'WRITE_OFF', label: 'Write-off' },
  { value: 'LOST', label: 'Lost' },
  { value: 'RETIREMENT', label: 'Retirement' },
]

export const fallbackReasons = [
  { value: 'OBSOLETE', label: 'Obsolete' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'BEYOND_REPAIR', label: 'Beyond Repair' },
  { value: 'END_OF_USEFUL_LIFE', label: 'End of Useful Life' },
  { value: 'LOST', label: 'Lost' },
  { value: 'REPLACEMENT', label: 'Replacement' },
]

export const disposalStatusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
]

export function getInitialAssetDisposalReferences() {
  return {
    eligibleAssets: [],
    assetItems: [],
    approvers: [],
    disposalTypes: fallbackDisposalTypes,
    reasons: fallbackReasons,
    statuses: disposalStatusOptions,
  }
}

function extractList(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

function configuredOptions(lookupValues, typeName, fallback) {
  const configured = lookupValues
    .filter((record) => String(record.status ?? record.STATUS ?? 1) === '1' && String(record.typeName || record.TYPE_NAME || '').trim().toLowerCase() === typeName.toLowerCase())
    .sort((left, right) => Number(left.sortOrder || left.SORT_ORDER || 0) - Number(right.sortOrder || right.SORT_ORDER || 0))
    .map((record) => {
      const val = record.lookupValue || record.value || record.VALUE || ''
      return {
        value: record.lookupCode || record.code || val.toUpperCase().replace(/[\s-]+/g, '_'),
        label: val,
      }
    })

  return configured.length > 0 ? configured : fallback
}

export async function loadAssetDisposalReferences(buId) {
  const buIdParam = buId ? Number(buId) : undefined

  try {
    const [rawItems, rawEmployees, rawLookupValues] = await Promise.all([
      assetItemsApi.list(buIdParam).catch(() => []),
      employeesApi.list(buIdParam).catch(() => []),
      assetLookupValuesApi.list({ businessUnitId: buIdParam }).catch(() => []),
    ])

    const eligibleAssets = extractList(rawItems)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const itemCode = r.itemCode || ''
        const itemName = r.itemName || ''
        const label = itemCode ? `${itemCode} - ${itemName}` : itemName || `Item ${id}`
        return {
          id,
          ID: id,
          value: id,
          itemCode,
          itemName,
          ITEM_NAME: itemName,
          label,
        }
      })

    const approvers = extractList(rawEmployees)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const code = r.employeeCode || ''
        const name = r.fullName || r.employeeName || ''
        const label = code ? `${code} - ${name}` : name || `Employee ${id}`
        return {
          id,
          ID: id,
          value: id,
          employeeCode: code,
          employeeName: name,
          name,
          label,
        }
      })

    const lookups = extractList(rawLookupValues)
    const disposalTypes = configuredOptions(lookups, 'Disposal Type', fallbackDisposalTypes)
    const reasons = configuredOptions(lookups, 'Disposal Reason', fallbackReasons)

    return {
      eligibleAssets,
      assetItems: eligibleAssets,
      approvers,
      disposalTypes,
      reasons,
      statuses: disposalStatusOptions,
    }
  } catch {
    return getInitialAssetDisposalReferences()
  }
}
