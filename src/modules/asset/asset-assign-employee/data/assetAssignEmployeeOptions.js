/** @file Active Asset Item, Employee, and Issue Condition references used by Asset Assign to Employee. */
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'

export const assetConditionOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'DAMAGED', label: 'Damaged' },
]

export function getInitialAssetAssignReferences() {
  return {
    assetItems: [],
    employees: [],
    conditions: assetConditionOptions,
  }
}

function extractList(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

export async function loadAssetAssignReferences(buId) {
  const buIdParam = buId ? Number(buId) : undefined

  try {
    const [rawItems, rawEmployees] = await Promise.all([
      assetItemsApi.list(buIdParam).catch(() => []),
      employeesApi.list(buIdParam).catch(() => []),
    ])

    const assetItems = extractList(rawItems)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const itemCode = r.itemCode || ''
        const itemName = r.itemName || ''
        const label = itemCode ? `${itemCode} - ${itemName}` : itemName || `Item ${id}`
        return {
          id,
          ID: id,
          itemCode,
          itemName,
          ITEM_NAME: itemName,
          label,
        }
      })

    const employees = extractList(rawEmployees)
      .filter((r) => {
        const active = String(r.status ?? 1) === '1'
        if (!active) return false
        if (buIdParam && r.buId != null && Number(r.buId) !== buIdParam) return false
        return true
      })
      .map((r) => {
        const id = String(r.id ?? '')
        const employeeCode = r.employeeCode || ''
        const employeeName = r.employeeName || ''
        const label = employeeCode ? `${employeeCode} - ${employeeName}` : employeeName || `Employee ${id}`
        return {
          id,
          ID: id,
          value: id,
          employeeId: employeeCode,
          employeeCode,
          name: employeeName,
          employeeName,
          label,
        }
      })

    return {
      assetItems,
      employees,
      conditions: assetConditionOptions,
    }
  } catch {
    return {
      assetItems: [],
      employees: [],
      conditions: assetConditionOptions,
    }
  }
}
