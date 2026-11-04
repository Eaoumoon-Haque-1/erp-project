/** @file Active Assigned Assets, Asset Items, Employees, and Return Conditions for Asset Return from Employee. */
import { assetAssignmentApi } from '../../asset-assign-employee/api/assetAssignmentApi'
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'

export const assetReturnConditionOptions = [
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'LOST', label: 'Lost' },
  { value: 'BEYOND_REPAIR', label: 'Beyond Repair' },
]

export function getInitialAssetReturnReferences() {
  return {
    assignedAssets: [],
    assetItems: [],
    employees: [],
    conditions: assetReturnConditionOptions,
  }
}

function extractList(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

export async function loadAssetReturnReferences(buId, currentAssignmentId = '') {
  const buIdParam = buId ? Number(buId) : undefined

  try {
    const [rawAssignments, rawItems, rawEmployees] = await Promise.all([
      assetAssignmentApi.list(buIdParam).catch(() => []),
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
        return { id, ID: id, itemCode, itemName, ITEM_NAME: itemName, label }
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

    const assignedAssets = extractList(rawAssignments)
      .filter((record) => (
        String(record.status ?? 1) === '1'
        && (!record.actualReturnDate || String(record.id) === String(currentAssignmentId))
      ))
      .map((record) => {
        const id = String(record.id ?? '')
        const itemId = String(record.itemId ?? '')
        const emplId = String(record.emplId ?? '')
        const item = assetItems.find((i) => i.id === itemId)
        const emp = employees.find((e) => e.id === emplId)

        const itemLabel = item?.label || (itemId ? `Item ${itemId}` : 'N/A')
        const empLabel = emp?.name || (emplId ? `Employee ${emplId}` : 'N/A')
        const label = `Assign #${id} - ${itemLabel} (${empLabel})`

        return {
          value: id,
          id,
          label,
          assignment: {
            ID: id,
            ASSET_ASSIGNMENT_ID: id,
            ITEM_ID: itemId,
            ITEM_NAME_LABEL: item?.label || itemLabel,
            HR_EMPL_ID: emplId,
            EMPLOYEE_NAME: emp?.name || empLabel,
            EMPLOYEE_ID: emp?.employeeId || '',
            ASSET_DATE: record.assetDate || '',
            EXPECTED_RETURN_DATE: record.expectedReturnDate || '',
          },
        }
      })

    return {
      assignedAssets,
      assetItems,
      employees,
      conditions: assetReturnConditionOptions,
    }
  } catch {
    return {
      assignedAssets: [],
      assetItems: [],
      employees: [],
      conditions: assetReturnConditionOptions,
    }
  }
}
