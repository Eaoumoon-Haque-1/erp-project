/** @file API-backed Office Calendar list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { officeCalendarsApi } from '../api/officeCalendarApi'
import {
  mapOfficeCalendarFromApi,
  mapOfficeCalendarToApi,
} from '../data/officeCalendarApiMapper'
import { loadOfficeCalendarReferences } from '../data/officeCalendarReferences'
import { officeCalendarMonthOptions } from '../validation/officeCalendarValidation'

const basePath = '/hris/attendance-settings/office-calendar'
const monthNames = new Map(officeCalendarMonthOptions.map((month) => [month.value, month.label]))

const columns = [
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
  { key: 'YEAR', label: 'Year' },
  {
    key: 'MONTH_ID',
    label: 'Month',
    render: (value) => monthNames.get(String(value)) || value,
  },
  { key: 'TOTAL_DAYS', label: 'Total Days' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', String(value) === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function OfficeCalendarList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState({
    businessUnitNames: new Map(),
    eventTypeNames: new Map(),
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([officeCalendarsApi.list(), loadOfficeCalendarReferences()])
      .then(([records, loadedReferences]) => {
        if (!active) return
        setReferences(loadedReferences)
        setRows(records.map((record) => mapOfficeCalendarFromApi(
          record,
          loadedReferences.businessUnitNames,
          loadedReferences.eventTypeNames,
        )))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Office Calendars.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    {
      key: 'BU_ID',
      label: 'Search by Business Unit',
      placeholder: '--Search by Business Unit--',
      options: [...references.businessUnitNames].map(([value, label]) => ({ value, label })),
      matches: (row, value) => row.BU_ID.includes(value),
    },
    { key: 'YEAR', label: 'Search by Year', placeholder: 'Search by Year' },
    {
      key: 'MONTH_ID',
      label: 'Search by Month',
      placeholder: '--Search by Month--',
      options: officeCalendarMonthOptions,
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [references.businessUnitNames])

  const handleDelete = async (row) => {
    try {
      await officeCalendarsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Office Calendar.'))
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await officeCalendarsApi.update(
        row.ID,
        mapOfficeCalendarToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }, row.DAYS),
      )
      const mapped = mapOfficeCalendarFromApi(
        updated,
        references.businessUnitNames,
        references.eventTypeNames,
      )
      setRows((current) => current.map((item) => item.ID === row.ID ? mapped : item))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Office Calendar status.'))
      return false
    }
  }

  return (
    <ListPage
      title={'Office Calendar List'}
      createLabel={'New'}
      createTo={`${basePath}/create`}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      rowKey={'ID'}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`${basePath}/${row.ID}/view`)}
          onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default OfficeCalendarList
