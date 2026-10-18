/** @file Read-only Office Notice details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { officeNoticesApi } from '../api/officeNoticeApi'
import { mapOfficeNoticeFromApi } from '../data/officeNoticeApiMapper'

const basePath = '/hris/hris-forms/office-notice'
const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
}

async function loadOfficeNotice(id) {
  const [record, businessUnits] = await Promise.all([
    officeNoticesApi.get(id),
    businessUnitsApi.list(),
  ])
  return mapOfficeNoticeFromApi(
    record,
    new Map(businessUnits.map((unit) => [String(unit.id), unit.businessUnit])),
  )
}

const fields = [
  { label: 'Business Unit', key: 'BUSINESS_UNIT' },
  { label: 'Title', key: 'TITLE' },
  { label: 'Publish Date', value: (record) => formatDateForDisplay(record.PUBLISH_DATE) },
  { label: 'Expire Date', value: (record) => formatDateForDisplay(record.EXPIRE_DATE) },
  { label: 'Attachment', key: 'ATTACHMENT' },
  { label: 'Important', key: 'IS_IMPORTANT', type: 'boolean' },
  { label: 'Description', key: 'DESCRIPTION', wide: true },
  { label: 'Status', key: 'STATUS', type: 'status' },
]
const auditFields = [
  { label: 'Created By', key: 'CREATED_BY' },
  { label: 'Created At', value: (record) => formatDateTime(record.CREATED_AT) },
  { label: 'Updated By', key: 'UPDATED_BY' },
  { label: 'Updated At', value: (record) => formatDateTime(record.UPDATED_AT) },
]

function OfficeNoticeView() {
  return <ApiRecordViewPage title={'Office Notice View'} param={'officeNoticeId'} listTo={basePath}
    editTo={(id) => `${basePath}/${id}/edit`} loader={loadOfficeNotice}
    fields={fields} auditFields={auditFields} />
}

export default OfficeNoticeView
