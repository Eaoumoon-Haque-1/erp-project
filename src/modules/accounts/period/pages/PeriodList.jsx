/**
 * @file Accounting Period Open List page.
 * Displays all opened accounting periods with filters, search, and row actions.
 * Note: Group Name and Business Unit are excluded from display as requested.
 * Header buttons: "New Accounting Period Open", "New Accounting Period Close".
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { periodApi } from '../api/periodApi'
import { mapPeriodFromApi } from '../data/periodApiMapper'
import { AFM_PERIOD_TABLE, PERIOD_STATUS_OPTIONS } from '../validation/periodValidation'

const listPath = '/accounts/voucher-setup/period'
const openCreatePath = '/accounts/voucher-setup/period/open/create'
const closeCreatePath = '/accounts/voucher-setup/period/close/create'

const columns = [
  {
    key: 'PERIOD_YEAR',
    label: 'Year',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'PERIOD_NAME',
    label: 'Period Name',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'PERIOD_STATUS',
    label: 'Period Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none',
          value === 'Open' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
        ].join(' ')}
      >
        {value || 'Open'}
      </span>
    ),
  },
]

function PeriodList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBusinessUnitId))

  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    periodApi
      .list({ buId: sessionBusinessUnitId })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map(mapPeriodFromApi) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(err?.message || 'Unable to load Accounting Periods.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId])

  // Distinct Years inserted in AFM_PERIOD table
  const distinctYears = useMemo(() => {
    return Array.from(
      new Set(
        rows
          .map((r) => String(r.PERIOD_YEAR ?? '').trim())
          .filter(Boolean),
      ),
    ).sort()
  }, [rows])

  // Individual Search filters:
  // 1. Year (Distinct values from AFM_PERIOD table column PERIOD_YEAR)
  // 2. Period Name (Cascaded according to selected Year)
  // 3. Period Status (Open / Close)
  const filters = useMemo(
    () => [
      {
        key: 'PERIOD_YEAR',
        label: 'Year',
        placeholder: '--Select Year--',
        options: distinctYears.map((yr) => ({
          value: yr,
          label: yr,
        })),
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.PERIOD_YEAR ?? '').trim().toLowerCase() === q
        },
      },
      {
        key: 'PERIOD_NAME',
        label: 'Period Name',
        dependsOn: 'PERIOD_YEAR',
        disabled: (filterValues) => !filterValues.PERIOD_YEAR,
        disabledPlaceholder: '--Select Year First--',
        placeholder: (filterValues, disabled) =>
          disabled ? '--Select Year First--' : '--Select Period Name--',
        options: (filterValues) => {
          if (!filterValues.PERIOD_YEAR) return []
          const selectedYear = String(filterValues.PERIOD_YEAR).trim().toLowerCase()
          const matchingRows = rows.filter(
            (r) => String(r.PERIOD_YEAR ?? '').trim().toLowerCase() === selectedYear,
          )
          const distinctNames = Array.from(
            new Set(matchingRows.map((r) => String(r.PERIOD_NAME ?? '').trim()).filter(Boolean)),
          ).sort()
          return distinctNames.map((p) => ({
            value: p,
            label: p,
          }))
        },
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.PERIOD_NAME ?? '').trim().toLowerCase() === q
        },
      },
      {
        key: 'PERIOD_STATUS',
        label: 'Period Status',
        placeholder: '--Select Period Status--',
        options: PERIOD_STATUS_OPTIONS,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.PERIOD_STATUS ?? '').trim().toLowerCase() === q
        },
      },
    ],
    [distinctYears, rows],
  )

  return (
    <ListPage
      title={'Acc. Period Open/Close'}
      tableName={AFM_PERIOD_TABLE}
      actions={[
        {
          label: 'New Accounting Period Open',
          to: openCreatePath,
        },
        {
          label: 'New Accounting Period Close',
          to: closeCreatePath,
        },
      ]}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          showUnavailable={false}
          onView={() => navigate(`${listPath}/${row.ID}/view`)}
          onEdit={() => navigate(`${listPath}/${row.ID}/edit`)}
        />
      )}
    />
  )
}

export default PeriodList
