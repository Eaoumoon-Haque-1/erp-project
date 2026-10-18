/** @file Read-only Mobile Notification details with audit information. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { mobileNotificationsApi } from '../api/mobileNotificationApi'
import { mapMobileNotificationFromApi } from '../data/mobileNotificationApiMapper'
import { loadMobileNotificationReferences } from '../data/mobileNotificationReferences'

const basePath = '/hris/hris-forms/mobile-notification'
const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
}

async function loadRecord(id) {
  const [record, references] = await Promise.all([
    mobileNotificationsApi.get(id), loadMobileNotificationReferences(),
  ])
  return mapMobileNotificationFromApi(record, references)
}

const fields = [
  { label: 'Business Unit', key: 'BUSINESS_UNITS' },
  { label: 'Department Name', key: 'DEPARTMENTS' },
  { label: 'Employee Name', key: 'EMPLOYEES' },
  { label: 'Notification Type', key: 'NOTIFICATION_TYPE_LABEL' },
  { label: 'Title', key: 'TITLE' },
  { label: 'Body', key: 'BODY', wide: true },
  { label: 'Status', key: 'STATUS', type: 'status' },
]
const auditFields = [
  { label: 'Created By', key: 'CREATED_BY' },
  { label: 'Created At', value: (record) => formatDateTime(record.CREATED_AT) },
  { label: 'Updated By', key: 'UPDATED_BY' },
  { label: 'Updated At', value: (record) => formatDateTime(record.UPDATED_AT) },
]

function MobileNotificationView() {
  return <ApiRecordViewPage title={'Mobile Notification View'} param={'mobileNotificationId'}
    listTo={basePath} editTo={(id) => `${basePath}/${id}/edit`} loader={loadRecord}
    fields={fields} auditFields={auditFields} />
}

export default MobileNotificationView
