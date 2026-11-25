/** @file Reference loaders and dropdown options for Asset Book Register. */
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { depreciationCategoriesApi } from '../../depreciation-category/api/depreciationCategoryApi'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { departmentGroupsApi } from '../../../hris/department-group/api/departmentGroupApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'

export const ASSET_UNIT_OPTIONS = [
  { value: 'Piece', label: 'Piece' },
  { value: 'Set', label: 'Set' },
]

export const ALLOCATION_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Departmental', label: 'Departmental' },
  { value: 'Project', label: 'Project' },
  { value: 'Common/Shared', label: 'Common/Shared' },
]

export const USAGES_STATUS_OPTIONS = [
  { value: 'In Use', label: 'In Use' },
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Under Maintenance', label: 'Under Maintenance' },
  { value: 'Disposed', label: 'Disposed' },
  { value: 'Idle', label: 'Idle' },
]

export const ASSET_CONDITION_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Scrap', label: 'Scrap' },
]

export const ASSET_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Allocated', label: 'Allocated' },
  { value: 'Transferred', label: 'Transferred' },
]

export async function loadAssetBookRegisterReferences(buId, bgId) {
  const buIdParam = buId ? Number(buId) : undefined

  const [rawItems, rawCategories, departments, departmentGroups, employees] =
    await Promise.all([
      assetItemsApi.list(buIdParam).catch(() => []),
      depreciationCategoriesApi.list(buIdParam).catch(() => []),
      departmentsApi.listByGroup(bgId).catch(() => []),
      departmentGroupsApi.list().catch(() => []),
      employeesApi.list(buIdParam).catch(() => []),
    ])

  const itemOptions = (Array.isArray(rawItems) ? rawItems : rawItems?.data || [])
    .filter((r) => String(r.status ?? 1) === '1')
    .map((r) => {
      const id = String(r.id ?? r.ID ?? '')
      const code = r.itemCode || r.item_code || ''
      const name = r.itemName || r.item_name || ''
      return {
        value: id,
        label: code ? `${code} - ${name}` : name || id,
        raw: r,
      }
    })

  const categoryOptions = (Array.isArray(rawCategories) ? rawCategories : rawCategories?.data || [])
    .filter((r) => String(r.status ?? 1) === '1')
    .map((r) => {
      const id = String(r.id ?? r.ID ?? '')
      const name = r.depriCategory || r.depri_category || id
      return {
        value: id,
        label: name,
        raw: r,
      }
    })

  const departmentOptions = (departments || [])
    .filter((department) => {
      const activeDept = String(department.status ?? 1) === '1'
      const mappedToBu = (departmentGroups || []).some(
        (m) =>
          String(m.buId) === String(buId) &&
          String(m.deptId) === String(department.id) &&
          String(m.status ?? 1) === '1',
      )
      return activeDept && (buId ? mappedToBu : true)
    })
    .map((department) => ({
      value: String(department.id),
      label: department.departmentName || department.deptName || String(department.id),
    }))

  const employeeOptions = (employees || [])
    .filter((e) => String(e.status ?? 1) === '1')
    .map((e) => {
      const id = String(e.id ?? e.ID ?? '')
      const code = (e.employeeCode || e.employee_code || '').trim()
      const name = (e.employeeName || e.employee_name || '').trim()
      const display = code && name ? `${code}: ${name}` : code || name || id
      return {
        value: id,
        label: display,
        code,
        name,
      }
    })

  return {
    itemOptions,
    categoryOptions,
    departmentOptions,
    employeeOptions,
    unitOptions: ASSET_UNIT_OPTIONS,
    allocationTypeOptions: ALLOCATION_TYPE_OPTIONS,
    usageStatusOptions: USAGES_STATUS_OPTIONS,
    conditionOptions: ASSET_CONDITION_OPTIONS,
    assetStatusOptions: ASSET_STATUS_OPTIONS,
  }
}
