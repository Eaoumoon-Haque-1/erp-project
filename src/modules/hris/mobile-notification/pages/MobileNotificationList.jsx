/** @file API-backed Mobile Notification list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { mobileNotificationsApi } from '../api/mobileNotificationApi'
import { mapMobileNotificationFromApi, mapMobileNotificationUpdateToApi } from '../data/mobileNotificationApiMapper'
import { loadMobileNotificationReferences } from '../data/mobileNotificationReferences'

const basePath = '/hris/hris-forms/mobile-notification'
const statusBadge = (value) => <span className={[
  'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
  String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
].join(' ')}>{String(value) === '1' ? 'Active' : 'Inactive'}</span>

const columns = [
  { key: 'BUSINESS_UNITS', label: 'Business Unit' },
  { key: 'DEPARTMENTS', label: 'Department Name' },
  { key: 'EMPLOYEES', label: 'Employee Name' },
  { key: 'NOTIFICATION_TYPE_LABEL', label: 'Notification Type' },
  { key: 'TITLE', label: 'Title' },
  { key: 'STATUS', label: 'Status', render: statusBadge },
]

function MobileNotificationList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([mobileNotificationsApi.list(), loadMobileNotificationReferences()])
      .then(([records, loaded]) => {
        if (!active) return
        setReferences(loaded)
        setRows(records.map((record) => mapMobileNotificationFromApi(record, loaded)))
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Mobile Notifications.'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BU_ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--',
      options: references?.businessUnits.map((item) => ({ value: String(item.id), label: item.businessUnit })) || [],
      matches: (row, value) => row.BU_ID.includes(value) },
    { key: 'DEPT_ID', label: 'Search by Department', placeholder: '--Search by Department--',
      searchable: true,
      options: references?.departments
        .filter((item) => rows.some((row) => row.DEPT_ID.includes(String(item.id))))
        .map((item) => ({ value: String(item.id), label: item.departmentName })) || [],
      matches: (row, value) => row.DEPT_ID.includes(value) },
    { key: 'NOTIFICATION_TYPE', label: 'Search by Notification Type', placeholder: '--Search by Notification Type--',
      options: references?.notificationTypes.map((item) => ({ value: String(item.id), label: item.value })) || [] },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [
      { label: 'Active', value: '1' }, { label: 'Inactive', value: '0' },
    ] },
  ], [references, rows])

  const handleDelete = async (row) => {
    await mobileNotificationsApi.remove(row.ID)
    setRows((current) => current.filter((item) => item.ID !== row.ID))
  }
  const handleStatusChange = async (row) => {
    const updated = await mobileNotificationsApi.update(row.ID, mapMobileNotificationUpdateToApi({
      ...row, STATUS: row.STATUS === '1' ? '0' : '1',
    }))
    setRows((current) => current.map((item) => item.ID === row.ID
      ? mapMobileNotificationFromApi(updated, references) : item))
  }

  return <ListPage title={'Mobile Notification List'} createLabel={'New'} createTo={`${basePath}/create`}
    filters={filters} columns={columns} rows={rows} rowKey={'ID'} loading={loading}
    renderActions={(row) => <ListRowActions row={row} entityName={'Mobile Notification'}
      onView={() => navigate(`${basePath}/${row.ID}/view`)}
      onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete}
      onStatusChange={handleStatusChange} />} />
}

export default MobileNotificationList
