/** @file API-backed Office Notice list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { officeNoticesApi } from '../api/officeNoticeApi'
import { mapOfficeNoticeFromApi, mapOfficeNoticeToApi } from '../data/officeNoticeApiMapper'

const basePath = '/hris/hris-forms/office-notice'
const columns = [
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'TITLE', label: 'Title' },
  { key: 'PUBLISH_DATE', label: 'Publish Date', render: formatDateForDisplay },
  { key: 'EXPIRE_DATE', label: 'Expire Date', render: formatDateForDisplay },
  { key: 'IS_IMPORTANT', label: 'Important', render: (value) => value === '1' ? 'Yes' : 'No' },
  { key: 'STATUS', label: 'Status', render: (value) => (
    <span className={[
      'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
      value === '1' ? 'bg-action-success' : 'bg-action-danger',
    ].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>
  ) },
]

function OfficeNoticeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [businessUnitNames, setBusinessUnitNames] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([officeNoticesApi.list(), businessUnitsApi.list()])
      .then(([records, businessUnits]) => {
        if (!active) return
        const names = new Map(businessUnits.map((unit) => [String(unit.id), unit.businessUnit]))
        setBusinessUnitNames(names)
        setRows(records.map((record) => mapOfficeNoticeFromApi(record, names)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Office Notices.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BU_ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--',
      options: [...businessUnitNames].map(([value, label]) => ({ value, label })) },
    { key: 'IS_IMPORTANT', label: 'Search by Importance', placeholder: '--Search by Importance--',
      options: [{ label: 'Important', value: '1' }, { label: 'Regular', value: '0' }] },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [businessUnitNames])

  const handleDelete = async (row) => {
    try {
      await officeNoticesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Office Notice.'))
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await officeNoticesApi.update(
        row.ID,
        mapOfficeNoticeToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) => item.ID === row.ID
        ? mapOfficeNoticeFromApi(updated, businessUnitNames) : item))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Office Notice status.'))
      return false
    }
  }

  return (
    <ListPage title={'Office Notice List'} createLabel={'New'} createTo={`${basePath}/create`}
      filters={filters} columns={columns} rows={rows} rowKey={'ID'} loading={loading} message={message}
      renderActions={(row) => (
        <ListRowActions row={row} entityName={'Office Notice'}
          onView={() => navigate(`${basePath}/${row.ID}/view`)}
          onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
          onDelete={handleDelete} onStatusChange={handleStatusChange} />
      )} />
  )
}

export default OfficeNoticeList
