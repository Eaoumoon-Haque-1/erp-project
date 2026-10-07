/**
 * @file Reusable option and temporary reference data for Role.
 * Sections: exported option collections and lookup records consumed by pages/forms.
 * Replace temporary collections with API-shaped data without changing consumer contracts unnecessarily.
 */
export const moduleOptions = [
  { value: '1', label: 'Super Admin' },
  { value: '2', label: 'HRIS' },
]

export const menuOptions = [
  { value: '1', moduleId: '1', label: 'Module' },
  { value: '2', moduleId: '1', label: 'Menu Permission' },
  { value: '3', moduleId: '1', label: 'Menu' },
  { value: '4', moduleId: '1', label: 'Role' },
  { value: '5', moduleId: '2', label: 'HRIS Settings' },
  { value: '6', moduleId: '2', label: 'Employee Informations' },
]

export const permissionOptions = [
  { value: '1', label: 'View' },
  { value: '2', label: 'Create' },
  { value: '3', label: 'Edit' },
  { value: '4', label: 'Delete' },
]

export function getRoleOptionLabels(values) {
  return {
    MODULE_NAME: moduleOptions.find((option) => option.value === values.MODULE_ID)?.label ?? '',
    MENU_NAME: menuOptions.find((option) => option.value === values.MENU_ID)?.label ?? '',
    PERMISSION_NAME: permissionOptions.find((option) => option.value === values.PERMISSION_ID)?.label ?? '',
  }
}
