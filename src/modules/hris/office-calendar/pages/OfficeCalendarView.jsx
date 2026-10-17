/** @file Read-only Office Calendar details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { officeCalendarsApi } from '../api/officeCalendarApi'
import { mapOfficeCalendarFromApi } from '../data/officeCalendarApiMapper'
import { loadOfficeCalendarReferences } from '../data/officeCalendarReferences'
import { officeCalendarMonthOptions } from '../validation/officeCalendarValidation'

const basePath = '/hris/attendance-settings/office-calendar'
const monthNames = new Map(officeCalendarMonthOptions.map((month) => [month.value, month.label]))

async function loadOfficeCalendar(id) {
  const [record, references] = await Promise.all([
    officeCalendarsApi.get(id),
    loadOfficeCalendarReferences(),
  ])
  return mapOfficeCalendarFromApi(
    record,
    references.businessUnitNames,
    references.eventTypeNames,
  )
}

const viewConfig = {
  title: 'Office Calendar View',
  param: 'officeCalendarId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadOfficeCalendar,
  fields: [
    { label: 'Business Unit', key: 'BUSINESS_UNIT_NAME' },
    { label: 'Year', key: 'YEAR' },
    { label: 'Month', value: (record) => monthNames.get(record.MONTH_ID) || record.MONTH_ID },
    { label: 'Total Days', key: 'TOTAL_DAYS' },
    { label: 'Status', key: 'STATUS', type: 'status' },
    {
      label: 'Calendar Days',
      wide: true,
      value: (record) => record.DAYS
        .map((day) => `${day.CALENDER_DATE}: ${day.EVENT_TYPE_NAME}${day.REMARKS ? ` (${day.REMARKS})` : ''}`)
        .join(', '),
    },
  ],
}

function OfficeCalendarView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default OfficeCalendarView
