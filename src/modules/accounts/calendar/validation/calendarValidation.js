/**
 * @file Validation schema, constants, and auto-generation helpers for Accounting Calendar.
 */

export const AFM_CALENDAR_TABLE = 'AFM_CALENDAR'
export const AFM_CALENDAR_MONTH_TABLE = 'AFM_CALENDAR_MONTH'

export const CALENDAR_TYPE_OPTIONS = [
  { value: 'Calendar Year', label: 'Calendar Year' },
  { value: 'Fiscal Year', label: 'Fiscal Year' },
]

export const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const QUARTER_OPTIONS = [
  '1st Quarter',
  '2nd Quarter',
  '3rd Quarter',
  '4th Quarter',
]

export const PERIOD_STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Close', label: 'Close' },
]

export const initialCalendarValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT_NAME: '',
  CALENDAR_YEAR: String(new Date().getFullYear()),
  CALENDAR_TYPE: 'Calendar Year',
  FROM_DATE: '',
  TO_DATE: '',
  PERIOD: '12',
  STATUS: '1',
}

/**
 * Extracts distinct 4-digit years from Account Year.
 * E.g.: "2026" -> ["2026"]
 *       "2025-2026" -> ["2025", "2026"]
 */
export function extractYears(accountYear) {
  if (!accountYear) return [String(new Date().getFullYear())]
  const str = String(accountYear).trim()
  const matches = str.match(/\d{4}/g)
  if (matches && matches.length > 0) {
    return Array.from(new Set(matches))
  }
  return [str]
}

let rowSequence = 0

export function createInitialCalendarDetailRow(overrides = {}) {
  rowSequence += 1
  return {
    _ROW_ID: `row_${Date.now()}_${rowSequence}`,
    ID: '',
    AFM_CALENDAR_ID: '',
    SERIAL_NO: 1,
    CALENDAR_MONTH: 'January',
    CALENDAR_YEAR: String(new Date().getFullYear()),
    CALENDAR_QUATER: '1st Quarter',
    FROM_DATE: '',
    TO_DATE: '',
    PERIOD_NAME: 'Jan',
    IS_ADJUSTMENT_PERIOD: 'No',
    PERIOD_STATUS: 'Open',
    STATUS: '1',
    ...overrides,
  }
}

function formatDateISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Automatically generates 12 monthly rows when From Date and To Date are entered.
 * E.g., Date (From) = 01-01-2026 and Date (To) = 31-12-2026.
 */
export function generateMonthlyCalendarRows(fromDateStr, toDateStr, accountYear, calendarType = 'Calendar Year') {
  if (!fromDateStr || !toDateStr) return []

  const fromDate = new Date(fromDateStr)
  const toDate = new Date(toDateStr)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return []
  if (toDate < fromDate) return []

  const rows = []
  let curr = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
  const endMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 1)

  let serial = 1
  while (curr <= endMonth && serial <= 24) {
    const monthIndex = curr.getMonth()
    const monthName = MONTH_OPTIONS[monthIndex]
    const yearStr = String(curr.getFullYear())

    // Quarter calculation:
    // If Calendar Year: Jan-Mar = 1st, Apr-Jun = 2nd, Jul-Sep = 3rd, Oct-Dec = 4th
    // If sequential blocks: Math.min(4, Math.floor((serial - 1) / 3) + 1)
    let quarter
    if (calendarType === 'Calendar Year') {
      quarter = QUARTER_OPTIONS[Math.floor(monthIndex / 3)]
    } else {
      quarter = QUARTER_OPTIONS[Math.min(3, Math.floor((serial - 1) / 3))]
    }

    // Determine month start and end dates
    const mStart = new Date(curr.getFullYear(), curr.getMonth(), 1)
    const mEnd = new Date(curr.getFullYear(), curr.getMonth() + 1, 0)

    const rowFrom = serial === 1 && fromDate > mStart ? fromDate : mStart
    const rowTo = curr.getFullYear() === toDate.getFullYear() && curr.getMonth() === toDate.getMonth() && toDate < mEnd ? toDate : mEnd

    const periodName = `${MONTH_ABBR[monthIndex]}-${yearStr}`

    rows.push(
      createInitialCalendarDetailRow({
        SERIAL_NO: serial,
        CALENDAR_MONTH: monthName,
        CALENDAR_YEAR: yearStr,
        CALENDAR_QUATER: quarter,
        FROM_DATE: formatDateISO(rowFrom),
        TO_DATE: formatDateISO(rowTo),
        PERIOD_NAME: periodName,
        PERIOD_STATUS: 'Open',
        IS_ADJUSTMENT_PERIOD: 'No',
        STATUS: '1',
      })
    )

    serial += 1
    curr = new Date(curr.getFullYear(), curr.getMonth() + 1, 1)
  }

  return rows
}

/**
 * Validates the master form and all detail rows.
 * @param {object} values Master form values
 * @param {Array} rows Calendar month detail rows
 * @param {Array} [existingCalendars=[]] List of existing calendars for duplicate check
 * @param {number|string|null} [currentId=null] Excluded ID when editing
 */
export function validateCalendar(values, rows = [], existingCalendars = [], currentId = null) {
  const errors = { subRows: {} }

  if (!values.BG_ID) {
    errors.BG_ID = 'Group Name is required from session.'
  }
  if (!values.BU_ID) {
    errors.BU_ID = 'Business Unit is required from session.'
  }

  const rawYear = String(values.CALENDAR_YEAR ?? '').trim()
  if (!rawYear) {
    errors.CALENDAR_YEAR = 'Account Year is required.'
  } else if (Array.isArray(existingCalendars) && existingCalendars.length > 0) {
    const isDuplicate = existingCalendars.some((c) => {
      const cId = String(c.id ?? c.ID ?? '')
      if (currentId && cId === String(currentId)) return false
      const cYear = String(c.calendarYear ?? c.CALENDAR_YEAR ?? '').trim()
      return cYear.toLowerCase() === rawYear.toLowerCase()
    })
    if (isDuplicate) {
      errors.CALENDAR_YEAR = `Account Year '${rawYear}' already exists for this Business Unit.`
    }
  }

  if (!values.CALENDAR_TYPE || !String(values.CALENDAR_TYPE).trim()) {
    errors.CALENDAR_TYPE = 'Calendar Type is required.'
  }
  if (!values.FROM_DATE) {
    errors.FROM_DATE = 'From Date (dd-Mon-yyyy) is required.'
  }
  if (!values.TO_DATE) {
    errors.TO_DATE = 'To Date (dd-Mon-yyyy) is required.'
  }
  if (values.FROM_DATE && values.TO_DATE && values.TO_DATE < values.FROM_DATE) {
    errors.TO_DATE = 'To Date must be after From Date.'
  }

  if (!rows || rows.length === 0) {
    errors.GENERAL = 'At least one Calendar Month detail row is required. Please provide From Date and To Date to generate month rows, or click "+ Add More".'
  } else {
    rows.forEach((row) => {
      const rowErr = {}
      if (!row.CALENDAR_MONTH) {
        rowErr.CALENDAR_MONTH = 'Month is required.'
      }
      if (!row.CALENDAR_YEAR) {
        rowErr.CALENDAR_YEAR = 'Year is required.'
      }
      if (!row.CALENDAR_QUATER) {
        rowErr.CALENDAR_QUATER = 'Quarter is required.'
      }
      if (!row.FROM_DATE) {
        rowErr.FROM_DATE = 'From Date is required.'
      }
      if (!row.TO_DATE) {
        rowErr.TO_DATE = 'To Date is required.'
      }
      if (row.FROM_DATE && row.TO_DATE && row.TO_DATE < row.FROM_DATE) {
        rowErr.TO_DATE = 'To Date must be after From Date.'
      }
      if (!row.PERIOD_NAME) {
        rowErr.PERIOD_NAME = 'Period Name is required.'
      }

      if (Object.keys(rowErr).length > 0) {
        errors.subRows[row._ROW_ID] = rowErr
      }
    })
  }

  const hasSubErrors = Object.keys(errors.subRows).length > 0
  const topErrors = Object.keys(errors).filter((k) => k !== 'subRows')
  const isValid = topErrors.length === 0 && !hasSubErrors

  return {
    errors,
    isValid,
    values,
    rows,
  }
}

