/** @file Active Asset Items, Custodians, Locations, Departments, and Conditions for Asset Transfer. */
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { custodiansApi } from '../../../../api/custodian'
import { assetLocationsApi } from '../../../../api/assetLocation'
import { departmentsApi } from '../../../../api/department'

export const transferConditionOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'LOST', label: 'Lost' },
  { value: 'BEYOND_REPAIR', label: 'Beyond Repair' },
]

export function getInitialAssetTransferReferences() {
  return {
    assetItems: [],
    custodians: [],
    locations: [],
    departments: [],
    conditions: transferConditionOptions,
  }
}

function extractList(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

export async function loadAssetTransferReferences(buId, bgId) {
  const buIdParam = buId ? Number(buId) : undefined
  const bgIdParam = bgId ? Number(bgId) : undefined

  try {
    const [rawItems, rawCustodians, rawLocations, rawDepartments] = await Promise.all([
      assetItemsApi.list(buIdParam).catch(() => []),
      custodiansApi.list(buIdParam).catch(() => []),
      assetLocationsApi.list(buIdParam).catch(() => []),
      departmentsApi.list(bgIdParam).catch(() => []),
    ])

    const assetItems = extractList(rawItems)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const itemCode = r.itemCode || ''
        const itemName = r.itemName || ''
        const label = itemCode ? `${itemCode} - ${itemName}` : itemName || `Item ${id}`
        return { id, ID: id, value: id, itemCode, itemName, ITEM_NAME: itemName, label }
      })

    const custodians = extractList(rawCustodians)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const custodianName = r.custodianName || ''
        const subCustodians = (r.subCustodians || r.SUB_CUSTODIANS || [])
          .filter((s) => String(s.status ?? 1) === '1')
          .map((s) => {
            const sid = String(s.id ?? '')
            const sname = s.subCustodianName || ''
            return {
              id: sid,
              ID: sid,
              value: sid,
              subCustodianName: sname,
              SUB_CUSTODIAN_NAME: sname,
              label: sname,
            }
          })

        return {
          id,
          ID: id,
          value: id,
          custodianName,
          CUSTODIAN_NAME: custodianName,
          label: custodianName,
          subCustodians,
          SUB_CUSTODIANS: subCustodians,
        }
      })

    const locations = extractList(rawLocations)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const locationName = r.locationName || ''
        const locationCode = r.locationCode || ''
        const label = locationCode ? `${locationCode} - ${locationName}` : locationName
        return {
          id,
          ID: id,
          value: id,
          locationName,
          LOCATION_NAME: locationName,
          label,
          custodianId: String(r.custodianId ?? ''),
          CUSTODIAN_ID: String(r.custodianId ?? ''),
          subCustodianId: String(r.subCustodianId ?? ''),
          SUB_CUSTODIAN_ID: String(r.subCustodianId ?? ''),
          departmentId: String(r.deptId ?? r.departmentId ?? ''),
          DEPT_ID: String(r.deptId ?? r.departmentId ?? ''),
          building: r.building || '',
          BUILDING: r.building || '',
          floor: r.floor || '',
          FLOOR: r.floor || '',
          room: r.room || '',
          ROOM: r.room || '',
        }
      })

    const departments = extractList(rawDepartments)
      .filter((r) => String(r.status ?? 1) === '1')
      .map((r) => {
        const id = String(r.id ?? '')
        const departmentName = r.departmentName || r.deptName || ''
        return {
          id,
          ID: id,
          value: id,
          departmentName,
          label: departmentName,
        }
      })

    return {
      assetItems,
      custodians,
      locations,
      departments,
      conditions: transferConditionOptions,
    }
  } catch {
    return {
      assetItems: [],
      custodians: [],
      locations: [],
      departments: [],
      conditions: transferConditionOptions,
    }
  }
}

export function getTransferSubCustodians(custodianId, references) {
  const custodian = references.custodians?.find((r) => String(r.id ?? r.ID ?? r.value) === String(custodianId))
  return custodian?.subCustodians ?? custodian?.SUB_CUSTODIANS ?? []
}

export function getTransferLocations(custodianId, subCustodianId, references) {
  return (references.locations || []).filter((r) => (
    String(r.custodianId ?? r.CUSTODIAN_ID) === String(custodianId)
    && String(r.subCustodianId ?? r.SUB_CUSTODIAN_ID) === String(subCustodianId)
  ))
}
