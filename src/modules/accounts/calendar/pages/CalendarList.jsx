/**
 * @file Accounting Calendar List page.
 * Displays all calendars for the active Business Unit with filtering and actions.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { calendarApi } from '../api/calendarApi'
import { mapCalendarFromApi, mapCalendarToApi } from '../data/calendarApiMapper'
import { CALENDAR_TYPE_OPTIONS } from '../validation/calendarValidation'

const listPath = '/accounts/voucher-setup/calendar'
const createPath = '/accounts/voucher-setup/calendar/create'

function formatDateDisplay(value) {
  if (!value) return '-'
  const str = String(value).trim()
  const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (match) {
    const [, y, m, d] = match
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`
  }
  const date = new Date(str)
  if (Number.isNaN(date.getTime())) return str
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const columns = [
  {
    key: 'CALENDAR_YEAR',
    label: 'Account Year',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'CALENDAR_TYPE',
    label: 'Calendar Type',
    render: (value) => (
      <span className={'px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700'}>
        {value || 'Calendar Year'}
      </span>
    ),
  },
  {
    key: 'FROM_DATE',
    label: 'From Date (dd-mm-yyyy)',
    render: (value) => formatDateDisplay(value),
  },
  {
    key: 'TO_DATE',
    label: 'To Date (dd-mm-yyyy)',
    render: (value) => formatDateDisplay(value),
  },
  {
    key: 'PERIOD',
    label: 'Period',
    render: (value, row) => (
      <span className={'font-mono text-xs font-semibold text-teal-700'}>
        {value || (row.CALENDAR_MONTHS ? String(row.CALENDAR_MONTHS.length) : '12')}
      </span>
    ),
  },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[6px] py-[3px] text-xs font-bold leading-none text-white shadow-xs',
          String(value) === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function CalendarList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBusinessUnitId))

  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined

    let active = true

    calendarApi
      .list({ buId: sessionBusinessUnitId, bgId: sessionGroupId || undefined })
      .then((data) => {
        if (!active) return
        const scopedData = (data || []).filter((item) => {
          if (sessionBusinessUnitId && item.buId && String(item.buId) !== sessionBusinessUnitId) {
            return false
          }
          const itemBgId = String(item.bgId ?? '')
          if (sessionGroupId && itemBgId && itemBgId !== sessionGroupId) {
            return false
          }
          return true
        })
        setRows(scopedData.map(mapCalendarFromApi))
      })
      .catch((err) => {
        if (active) showError(err?.message || 'Unable to load Accounting Calendars.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  const handleDelete = async (row) => {
    const confirmed = await confirmAction({
      action: 'delete',
      entityName: 'Accounting Calendar',
      title: `Delete Accounting Calendar for Year ${row.CALENDAR_YEAR}?`,
    })

    if (!confirmed) return

    try {
      await calendarApi.remove(row.ID)
      await showSuccess('Accounting Calendar deleted successfully.')
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (err) {
      await showError(err?.response?.data?.message || err?.message || 'Unable to delete.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const nextStatus = String(row.STATUS) === '1' ? '0' : '1'
      const updated = await calendarApi.update(
        row.ID,
        mapCalendarToApi({ ...row, STATUS: nextStatus }, row.CALENDAR_MONTHS || []),
      )
      const resolvedStatus = String(updated?.status ?? nextStatus)
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID ? { ...item, STATUS: resolvedStatus } : item,
        ),
      )
    } catch (error) {
      await showError(error?.response?.data?.message || error?.message || 'Unable to update status.')
      return false
    }
  }

  // Distinct Calendar Type options
  const calendarTypeOptions = useMemo(() => {
    const map = new Map()
    CALENDAR_TYPE_OPTIONS.forEach((opt) => {
      map.set(opt.value.toLowerCase(), opt)
    })
    rows.forEach((r) => {
      const type = String(r.CALENDAR_TYPE || '').trim()
      if (type && !map.has(type.toLowerCase())) {
        map.set(type.toLowerCase(), { value: type, label: type })
      }
    })
    return Array.from(map.values())
  }, [rows])

  const filters = useMemo(
    () => [
      {
        key: 'CALENDAR_TYPE',
        label: 'Search by Calendar Type',
        placeholder: '--Search by Calendar Type--',
        options: calendarTypeOptions,
        searchable: true,
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return String(row.CALENDAR_TYPE ?? '').trim().toLowerCase() === query
        },
      },
      {
        key: 'CALENDAR_YEAR',
        label: 'Search by Accounts Year',
        placeholder: 'Search by Accounts Year',
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return String(row.CALENDAR_YEAR ?? '').toLowerCase().includes(query)
        },
      },
    ],
    [calendarTypeOptions],
  )

  return (
    <ListPage
      title={'Accounting Calendar List'}
      createLabel={'Create New'}
      createTo={createPath}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`${listPath}/${row.ID}/view`)}
          onEdit={() => navigate(`${listPath}/${row.ID}/edit`)}
          onDelete={() => handleDelete(row)}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default CalendarList

