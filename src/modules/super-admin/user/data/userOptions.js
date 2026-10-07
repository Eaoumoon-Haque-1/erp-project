/**
 * @file Reusable option and temporary reference data for User.
 * Sections: exported option collections and lookup records consumed by pages/forms.
 * Replace temporary collections with API-shaped data without changing consumer contracts unnecessarily.
 */
export const businessUnitOptions = [
  { value: '1', label: 'Health Expert Head Office' },
  { value: '2', label: 'Health Expert Operations' },
]

export const departmentOptions = [
  { value: '1', businessUnitId: '1', label: 'Administration' },
  { value: '2', businessUnitId: '1', label: 'Human Resources' },
  { value: '3', businessUnitId: '2', label: 'Operations' },
]

export const designationOptions = [
  { value: '1', departmentId: '1', label: 'Administrator' },
  { value: '2', departmentId: '2', label: 'HR Manager' },
  { value: '3', departmentId: '3', label: 'Operations Executive' },
]

export const roleOptions = [
  { value: '1', label: 'Super Admin' },
  { value: '2', label: 'Administrator' },
]

export const userTypeOptions = [
  { value: '1', label: 'Admin User' },
  { value: '2', label: 'Employee User' },
]
