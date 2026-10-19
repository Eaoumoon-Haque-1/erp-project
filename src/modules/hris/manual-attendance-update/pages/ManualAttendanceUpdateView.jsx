/** @file Read-only Manual Attendance Update details and API audit information. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { manualAttendanceUpdatesApi } from '../api/manualAttendanceUpdateApi'
import { mapManualAttendanceUpdateFromApi } from '../data/manualAttendanceUpdateApiMapper'
import { loadManualAttendanceUpdateReferences } from '../data/manualAttendanceUpdateReferences'

const basePath = '/hris/hris-forms/manual-attendance-update'

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
}

async function loadRecord(id) {
  const [record, references] = await Promise.all([
    manualAttendanceUpdatesApi.get(id), loadManualAttendanceUpdateReferences(),
  ])
  return mapManualAttendanceUpdateFromApi(record, references)
}

const fields = [
  { label: 'Group Name', key: 'GROUP_NAME' },
  { label: 'Business Unit', key: 'BUSINESS_UNIT' },
  { label: 'Department Name', key: 'DEPARTMENT_NAME' },
  { label: 'Designation Name', key: 'DESIGNATION_NAME' },
  { label: 'Shift', key: 'SHIFT_TITLE' },
  { label: 'Attendance Date', value: (record) => formatDateForDisplay(record.ATTEN_DATE) },
  { label: 'In Time', key: 'IN_TIME' },
  { label: 'Out Time', key: 'OUT_TIME' },
  { label: 'Note', key: 'NOTE', wide: true },
  { label: 'Status', key: 'STATUS', type: 'status' },
]

const auditFields = [
  { label: 'Created By', key: 'CREATED_BY' },
  { label: 'Created At', value: (record) => formatDateTime(record.CREATED_AT) },
  { label: 'Updated By', key: 'UPDATED_BY' },
  { label: 'Updated At', value: (record) => formatDateTime(record.UPDATED_AT) },
]

function ManualAttendanceUpdateView() {
  return <ApiRecordViewPage title={'Manual Attendance Update View'} param={'manualAttendanceUpdateId'}
    listTo={basePath} editTo={(id) => `${basePath}/${id}/edit`} loader={loadRecord}
    fields={fields} auditFields={auditFields} />
}

export default ManualAttendanceUpdateView
