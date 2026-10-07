/**
 * @file Backend-facing data contract and client validation for User Creation From Employee.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const USER_CREATION_FROM_EMPLOYEE_TABLE = 'SEC_USERS'

export const mockRoleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'HR_MANAGER', label: 'HR Manager' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'EMPLOYEE', label: 'Employee' },
]

export const mockUserTypeOptions = [
  { value: 'INTERNAL', label: 'Internal User' },
  { value: 'EXTERNAL', label: 'External User' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
]

export const sampleEmployeesMap = {
  '1': {
    EMPLOYEE_ID: 'EMP-0101',
    EMPLOYEE_NAME: 'Samira Rahman',
    BUSINESS_UNIT_NAME: 'Head Office',
    BUSINESS_UNIT_ID: '1',
    SUGGESTED_USERNAME: 'srahman',
  },
  '2': {
    EMPLOYEE_ID: 'EMP-0102',
    EMPLOYEE_NAME: 'Tanvir Hasan',
    BUSINESS_UNIT_NAME: 'Head Office',
    BUSINESS_UNIT_ID: '1',
    SUGGESTED_USERNAME: 'thasan',
  },
  '3': {
    EMPLOYEE_ID: 'EMP-0103',
    EMPLOYEE_NAME: 'Md. Eaoumoon Haque',
    BUSINESS_UNIT_NAME: 'Factory Unit',
    BUSINESS_UNIT_ID: '2',
    SUGGESTED_USERNAME: 'ehaque',
  },
}

export const initialUserCreationFromEmployeeValues = {
  EMPLOYEE_ID: '',
  EMPLOYEE_NAME: '',
  BUSINESS_UNIT_NAME: '',
  USER_NAME: '',
  USER_ROLE: '',
  USER_TYPE: '',
  PASSWORD: '',
  CONFIRM_PASSWORD: '',
  VALID_FROM_DATE: '',
  VALID_TO_DATE: '',
  IS_ANDROID_ID_FIXED: '0',
  IS_ACTIVE: '1',
}

export function validateUserCreationFromEmployee(values, { requirePassword = true } = {}) {
  const errors = {}

  if (!values.USER_NAME || !values.USER_NAME.trim()) {
    errors.USER_NAME = 'User Name is required.'
  } else if (values.USER_NAME.trim().length < 2) {
    errors.USER_NAME = 'User Name must be at least 2 characters.'
  } else if (values.USER_NAME.trim().length > 20) {
    errors.USER_NAME = 'User Name must not exceed 20 characters.'
  }

  if (!values.USER_ROLE) {
    errors.USER_ROLE = 'User Role is required.'
  }

  if (!values.USER_TYPE) {
    errors.USER_TYPE = 'User Type is required.'
  }

  if (requirePassword && !values.PASSWORD) {
    errors.PASSWORD = 'Password is required.'
  } else if (values.PASSWORD && values.PASSWORD.length < 8) {
    errors.PASSWORD = 'Password must be at least 8 characters long.'
  } else if (values.PASSWORD && values.PASSWORD.length > 64) {
    errors.PASSWORD = 'Password cannot exceed 64 characters.'
  } else if (values.PASSWORD) {
    const hasUpper = /[A-Z]/.test(values.PASSWORD)
    const hasLower = /[a-z]/.test(values.PASSWORD)
    const hasNumber = /[0-9]/.test(values.PASSWORD)
    const hasSpecial = /[^A-Za-z0-9]/.test(values.PASSWORD)
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      errors.PASSWORD = 'Password must contain uppercase, lowercase, number, and special character.'
    }
  }

  if (requirePassword && !values.CONFIRM_PASSWORD) {
    errors.CONFIRM_PASSWORD = 'Confirm Password is required.'
  } else if (values.PASSWORD && values.PASSWORD !== values.CONFIRM_PASSWORD) {
    errors.CONFIRM_PASSWORD = 'Passwords do not match.'
  }

  if (values.VALID_FROM_DATE && values.VALID_TO_DATE) {
    if (new Date(values.VALID_FROM_DATE) > new Date(values.VALID_TO_DATE)) {
      errors.VALID_TO_DATE = 'Valid To Date must be on or after Valid From Date.'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      ...values,
      USER_NAME: values.USER_NAME ? values.USER_NAME.trim() : '',
    },
  }
}
