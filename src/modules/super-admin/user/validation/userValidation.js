/**
 * @file Backend-facing data contract and client validation for User.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const USER_TABLE = 'USERS'

function formatDateInput(year, month, day) {
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-')
}

export function getTodayForDateInput() {
  const today = new Date()
  return formatDateInput(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  )
}

export function getUserValidityToDate(fromDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fromDate ?? ''))
  if (!match) return ''

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const targetMonthStart = new Date(Date.UTC(year, monthIndex + 6, 1))
  const targetYear = targetMonthStart.getUTCFullYear()
  const targetMonthIndex = targetMonthStart.getUTCMonth()
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, targetMonthIndex + 1, 0),
  ).getUTCDate()

  return formatDateInput(
    targetYear,
    targetMonthIndex + 1,
    Math.min(day, lastDayOfTargetMonth),
  )
}

export const createInitialUserValues = (businessGroupId) => ({
  ...(() => {
    const fromDate = getTodayForDateInput()
    return {
      FROM_DATE: fromDate,
      TO_DATE: getUserValidityToDate(fromDate),
    }
  })(),
  BG_ID: String(businessGroupId ?? ''),
  BU_ID: '',
  USER_NAME: '',
  FULL_NAME: '',
  EMAIL: '',
  MOBILE_NO: '',
  PASSWORD: '',
  CONFIRM_PASSWORD: '',
  ROLE_ID: '',
  USER_TYPE_ID: '',
  IS_ANDROID_FIXED: '0',
  ANDROID_ID: '',
  STATUS: '1',
})

// const isBangladeshMobile = (value) => /^01[3-9]\d{8}$/.test(text(value));

export function validateUser(
  values,
  existingUserNames = [],
  existingMobileNumbers = [],
  { requirePassword = true } = {},
) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? ''),
    BU_ID: String(values.BU_ID ?? ''),
    USER_NAME: String(values.USER_NAME ?? '').trim(),
    FULL_NAME: String(values.FULL_NAME ?? '').trim(),
    EMAIL: String(values.EMAIL ?? '').trim(),
    MOBILE_NO: String(values.MOBILE_NO ?? '').trim(),
    PASSWORD: String(values.PASSWORD ?? ''),
    CONFIRM_PASSWORD: String(values.CONFIRM_PASSWORD ?? ''),
    FROM_DATE: String(values.FROM_DATE ?? ''),
    TO_DATE: String(values.TO_DATE ?? ''),
    ROLE_ID: String(values.ROLE_ID ?? ''),
    USER_TYPE_ID: String(values.USER_TYPE_ID ?? ''),
    IS_ANDROID_FIXED: String(values.IS_ANDROID_FIXED) === '1' ? '1' : '0',
    ANDROID_ID: String(values.ANDROID_ID ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  ;[
    ['BG_ID', 'Group Name'],
    ['BU_ID', 'Business Unit'],
    ['ROLE_ID', 'User Role'],
    ['USER_TYPE_ID', 'User Type'],
  ].forEach(([key, label]) => {
    if (!normalizedValues[key]) errors[key] = `${label} is required.`
  })

  if (!normalizedValues.USER_NAME) {
    errors.USER_NAME = 'User Name is required.'
  } else if (normalizedValues.USER_NAME.length < 2) {
    errors.USER_NAME = 'User Name must be at least 2 characters.'
  } else if (normalizedValues.USER_NAME.length > 20) {
    errors.USER_NAME = 'User Name must not exceed 20 characters.'
  } else if (existingUserNames.some(
    (name) => String(name).trim().toLowerCase() === normalizedValues.USER_NAME.toLowerCase(),
  )) {
    errors.USER_NAME = 'User Name must be unique.'
  }

  if (!normalizedValues.FULL_NAME) {
    errors.FULL_NAME = 'Full Name is required.'
  } else if (normalizedValues.FULL_NAME.length < 2) {
    errors.FULL_NAME = 'Full Name must be at least 2 characters.'
  } else if (normalizedValues.FULL_NAME.length > 100) {
    errors.FULL_NAME = 'Full Name must not exceed 100 characters.'
  }

  if (normalizedValues.EMAIL) {
    if (normalizedValues.EMAIL.length > 100) {
      errors.EMAIL = 'Email must not exceed 100 characters.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValues.EMAIL)) {
      errors.EMAIL = 'Enter a valid email address.'
    }
  }

  if (normalizedValues.MOBILE_NO) {
    if (!/^01\d{9}$/.test(normalizedValues.MOBILE_NO)) {
      errors.MOBILE_NO = 'Enter a valid 11-digit Bangladesh mobile number.'
    } else if (existingMobileNumbers.some(
      (number) => String(number).trim() === normalizedValues.MOBILE_NO,
    )) {
      errors.MOBILE_NO = 'Mobile No must be unique.'
    }
  }

  if (requirePassword && !normalizedValues.PASSWORD) {
    errors.PASSWORD = 'Password is required.'
  } else if (normalizedValues.PASSWORD && (normalizedValues.PASSWORD.length < 8 || normalizedValues.PASSWORD.length > 64)) {
    errors.PASSWORD = 'Password must be 8 to 64 characters.'
  } else if (normalizedValues.PASSWORD && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(normalizedValues.PASSWORD)) {
    errors.PASSWORD = 'Password must include uppercase, lowercase, number, and special characters.'
  }

  if ((requirePassword || normalizedValues.PASSWORD) && !normalizedValues.CONFIRM_PASSWORD) {
    errors.CONFIRM_PASSWORD = 'Confirm Password is required.'
  } else if (normalizedValues.CONFIRM_PASSWORD && normalizedValues.CONFIRM_PASSWORD !== normalizedValues.PASSWORD) {
    errors.CONFIRM_PASSWORD = 'Confirm Password must match Password.'
  }

  if (normalizedValues.FROM_DATE && normalizedValues.TO_DATE && normalizedValues.TO_DATE < normalizedValues.FROM_DATE) {
    errors.TO_DATE = 'To Date must be on or after From Date.'
  }

  if (normalizedValues.ANDROID_ID.length > 100) {
    errors.ANDROID_ID = 'Android ID cannot exceed 100 characters.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
