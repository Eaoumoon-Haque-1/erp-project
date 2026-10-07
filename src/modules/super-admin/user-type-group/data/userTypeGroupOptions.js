/**
 * @file Reusable option and temporary reference data for User Type Group.
 * Sections: exported option collections and lookup records consumed by pages/forms.
 * Replace temporary collections with API-shaped data without changing consumer contracts unnecessarily.
 */
export const userTypeOptions = [
  { value: '1', label: 'Admin User' },
  { value: '2', label: 'Employee User' },
]

export const businessUnitOptions = [
  { value: '1', label: 'Health Expert Head Office' },
  { value: '2', label: 'Health Expert Operations' },
]

export function getBusinessUnitName(businessUnitId) {
  return businessUnitOptions.find((option) => option.value === businessUnitId)?.label ?? ''
}
