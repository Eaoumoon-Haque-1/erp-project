/** @file Converts Office Calendar API records to and from form field names. */
const text = (value) => value == null ? '' : String(value)

export const officeCalendarFieldMap = {
  buId: 'BU_ID', buIds: 'BU_ID', year: 'YEAR', monthId: 'MONTH_ID',
  status: 'STATUS', days: 'DETAILS', eventTypeId: 'DETAILS',
}

export function mapOfficeCalendarDayFromApi(day = {}) {
  return {
    ID: text(day.id),
    CALENDER_DATE: text(day.calendarDate),
    CALENDER_DAY: day.calendarDay ?? '',
    EVENT_TYPE_ID: text(day.eventTypeId),
    REMARKS: day.remarks ?? '',
    STATUS: text(day.status ?? 1),
  }
}

export function mapOfficeCalendarFromApi(
  record = {},
  businessUnitNames = new Map(),
  eventTypeNames = new Map(),
) {
  const businessUnitIds = Array.isArray(record.buIds) && record.buIds.length
    ? record.buIds.map(text)
    : record.buId == null ? [] : [text(record.buId)]
  const rows = (record.days ?? []).map((day) => ({
    ...mapOfficeCalendarDayFromApi(day),
    EVENT_TYPE_NAME: eventTypeNames.get(text(day.eventTypeId)) || text(day.eventTypeId),
  }))

  return {
    ID: text(record.id),
    BU_ID: businessUnitIds,
    BUSINESS_UNIT_NAME: businessUnitIds
      .map((id) => businessUnitNames.get(id) || id)
      .join(', '),
    YEAR: text(record.year),
    MONTH_ID: text(record.monthId),
    TOTAL_DAYS: text(rows.length),
    STATUS: text(record.status ?? 1),
    DAYS: rows,
  }
}

export function mapOfficeCalendarToApi(values, rows) {
  const businessUnitIds = values.BU_ID.map(Number)
  return {
    ...(values.ID ? { id: Number(values.ID) } : {}),
    buId: businessUnitIds.length === 1 ? businessUnitIds[0] : null,
    buIds: businessUnitIds,
    year: Number(values.YEAR),
    monthId: Number(values.MONTH_ID),
    status: Number(values.STATUS),
    days: rows.map((row) => ({
      id: row.ID ? Number(row.ID) : null,
      calendarDate: row.CALENDER_DATE,
      calendarDay: row.CALENDER_DAY,
      eventTypeId: Number(row.EVENT_TYPE_ID),
      remarks: row.REMARKS || null,
      status: Number(row.STATUS ?? values.STATUS),
    })),
  }
}
