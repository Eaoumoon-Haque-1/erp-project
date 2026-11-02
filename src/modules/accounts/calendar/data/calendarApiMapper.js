/**
 * @file Data mapper for Accounting Calendar between API and UI state.
 */
import { createInitialCalendarDetailRow } from '../validation/calendarValidation'

function resolveAuditActor(id, directDisplay, lookupMap) {
  if (directDisplay) return String(directDisplay)
  if (id == null || id === '') return ''
  const key = String(id)
  return lookupMap?.get?.(key) || key
}

function formatEmployeeAuditDisplay(code, name) {
  const cleanCode = String(code ?? '').trim()
  const cleanName = String(name ?? '').trim()
  if (cleanCode && cleanName) return `${cleanCode}: ${cleanName}`
  return cleanCode || cleanName || ''
}

export function mapCalendarMonthFromApi(dto = {}) {
  return createInitialCalendarDetailRow({
    _ROW_ID: dto.id ? `month_${dto.id}` : `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ID: dto.id ? String(dto.id) : '',
    AFM_CALENDAR_ID: dto.afmCalendarId ? String(dto.afmCalendarId) : '',
    SERIAL_NO: dto.serialNo ?? 1,
    CALENDAR_MONTH: dto.calendarMonth ?? 'January',
    CALENDAR_YEAR: dto.calendarYear ? String(dto.calendarYear) : '',
    CALENDAR_QUATER: dto.calendarQuater ?? '1st Quarter',
    FROM_DATE: dto.fromDate ?? '',
    TO_DATE: dto.toDate ?? '',
    PERIOD_NAME: dto.periodName ?? '',
    IS_ADJUSTMENT_PERIOD: dto.isAdjustmentPeriod ?? 'No',
    PERIOD_STATUS: dto.periodStatus ?? 'Open',
    STATUS: String(dto.status ?? 1),
    CREATED_USER_ID: dto.createdUserId,
    CREATED_EMP_ID: dto.createdEmpId,
    CREATED_DATETIME: dto.createdDatetime,
    UPDATED_USER_ID: dto.updatedUserId,
    UPDATED_EMP_ID: dto.updatedEmpId,
    UPDATED_DATETIME: dto.updatedDatetime,
    CREATED_APP: dto.createdApp,
    UPDATED_APP: dto.updatedApp,
  })
}

export function mapCalendarFromApi(
  item = {},
  userNames = new Map(),
  employeeNames = new Map(),
) {
  if (!item) return null

  const months = Array.isArray(item.calendarMonths)
    ? item.calendarMonths.map(mapCalendarMonthFromApi)
    : []

  const createdUserId =
    item.createdUserId ??
    item.createdByUserId ??
    item.CREATED_USER_ID ??
    ''
  const createdEmpId =
    item.createdEmpId ??
    item.createdEmployeeId ??
    item.CREATED_EMP_ID ??
    ''
  const updatedUserId =
    item.updatedUserId ??
    item.updatedByUserId ??
    item.UPDATED_USER_ID ??
    ''
  const updatedEmpId =
    item.updatedEmpId ??
    item.updatedEmployeeId ??
    item.UPDATED_EMP_ID ??
    ''

  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    item.createdEmployeeCode ?? item.createdEmpCode ?? item.CREATED_EMPLOYEE_CODE,
    item.createdEmployeeName ?? item.createdEmpName ?? item.CREATED_EMPLOYEE_NAME,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    item.updatedEmployeeCode ?? item.updatedEmpCode ?? item.UPDATED_EMPLOYEE_CODE,
    item.updatedEmployeeName ?? item.updatedEmpName ?? item.UPDATED_EMPLOYEE_NAME,
  )

  return {
    ID: item.id != null ? String(item.id) : '',
    BG_ID: item.bgId != null ? String(item.bgId) : '',
    BU_ID: item.buId != null ? String(item.buId) : '',
    GROUP_NAME: item.groupName || item.GROUP_NAME || '',
    BUSINESS_UNIT_NAME:
      item.businessUnitName || item.businessUnit || item.BUSINESS_UNIT_NAME || '',
    CALENDAR_YEAR: item.calendarYear || item.CALENDAR_YEAR || '',
    CALENDAR_TYPE: item.calendarType || item.CALENDAR_TYPE || 'Calendar Year',
    FROM_DATE: item.fromDate || item.FROM_DATE || '',
    TO_DATE: item.toDate || item.TO_DATE || '',
    PERIOD: item.period || String(months.length || '12'),
    STATUS:
      item.status !== undefined && item.status !== null
        ? String(item.status)
        : '1',
    CALENDAR_MONTHS: months,
    MONTH_COUNT: months.length,
    CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
    CREATED_USER_NAME: resolveAuditActor(
      createdUserId,
      item.createdUserName ?? item.createdByUserName ?? item.CREATED_USER_NAME,
      userNames,
    ),
    CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
    CREATED_EMP_NAME: resolveAuditActor(
      createdEmpId,
      directCreatedEmpDisplay,
      employeeNames,
    ),
    CREATED_DATETIME:
      item.createdDatetime ??
      item.createdDateTime ??
      item.createdAt ??
      item.CREATED_DATETIME ??
      '',
    CREATED_APP:
      item.createdApp ?? item.createdFrom ?? item.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
    UPDATED_USER_NAME: resolveAuditActor(
      updatedUserId,
      item.updatedUserName ?? item.updatedByUserName ?? item.UPDATED_USER_NAME,
      userNames,
    ),
    UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
    UPDATED_EMP_NAME: resolveAuditActor(
      updatedEmpId,
      directUpdatedEmpDisplay,
      employeeNames,
    ),
    UPDATED_DATETIME:
      item.updatedDatetime ??
      item.updatedDateTime ??
      item.updatedAt ??
      item.UPDATED_DATETIME ??
      '',
    UPDATED_APP:
      item.updatedApp ?? item.updatedFrom ?? item.UPDATED_APP ?? '',
  }
}

export function mapCalendarToApi(values = {}, rows = []) {
  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : null,
    buId: values.BU_ID ? Number(values.BU_ID) : null,
    calendarYear: String(values.CALENDAR_YEAR ?? '').trim(),
    calendarType: String(values.CALENDAR_TYPE ?? 'Calendar Year').trim(),
    fromDate: values.FROM_DATE || null,
    toDate: values.TO_DATE || null,
    period: values.PERIOD ? String(values.PERIOD).trim() : String(rows.length),
    status: values.STATUS !== undefined && values.STATUS !== null ? Number(values.STATUS) : 1,
    calendarMonths: rows.map((r, index) => ({
      id: r.ID ? Number(r.ID) : null,
      afmCalendarId: values.ID ? Number(values.ID) : null,
      serialNo: Number(r.SERIAL_NO ?? index + 1),
      calendarYear: String(r.CALENDAR_YEAR ?? values.CALENDAR_YEAR).trim(),
      calendarMonth: String(r.CALENDAR_MONTH ?? '').trim(),
      calendarQuater: String(r.CALENDAR_QUATER ?? '1st Quarter').trim(),
      fromDate: r.FROM_DATE || null,
      toDate: r.TO_DATE || null,
      periodName: String(r.PERIOD_NAME ?? '').trim(),
      isAdjustmentPeriod: String(r.IS_ADJUSTMENT_PERIOD ?? 'No').trim(),
      periodStatus: String(r.PERIOD_STATUS ?? 'Open').trim(),
      status: r.STATUS !== undefined && r.STATUS !== null ? Number(r.STATUS) : 1,
    })),
  }
}

