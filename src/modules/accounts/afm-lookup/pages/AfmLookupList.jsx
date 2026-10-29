/**
 * @file AFM Lookup Type List page.
 * Displays all lookup types with search filters, lookup value counts, and row actions.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import { failActiveAction } from '../../../../components/shared/actionAlerts'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { afmLookupApi } from '../api/afmLookupApi'
import { mapLookupTypeFromApi, mapLookupTypeToApi } from '../data/afmLookupApiMapper'

const listPath = '/accounts/voucher-setup/lookup'
const createPath = '/accounts/voucher-setup/lookup/create'

const columns = [
  { key: 'TYPE_NAME', label: 'Lookup Type' },
  {
    key: 'TYPE_CODE',
    label: 'Lookup Code',
    render: (value) => (
      <span className={'font-mono text-xs font-semibold text-gray-700'}>
        {value || '-'}
      </span>
    ),
  },
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  {
    key: 'ACTIVE_VALUE_COUNT',
    label: 'Lookup Values',
    render: (value, row) => (
      <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700'}>
        <span className={'w-1.5 h-1.5 rounded-full bg-teal-500'} />
        {value} active / {row.VALUE_COUNT || 0} total
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

function AfmLookupList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [businessUnits, setBusinessUnits] = useState([])

  useEffect(() => {
    let active = true

    Promise.all([
      afmLookupApi.list(),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
    ])
      .then(([types, groups, units]) => {
        if (!active) return
        setBusinessUnits(units)
        const groupMap = new Map(groups.map((g) => [String(g.id), g.groupName]))
        const unitMap = new Map(units.map((u) => [String(u.id), u.businessUnit]))
        setRows(types.map((type) => mapLookupTypeFromApi(type, groupMap, unitMap)))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Lookup Type records.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const businessUnitOptions = useMemo(
    () =>
      businessUnits.map((u) => ({
        value: String(u.id),
        label: u.businessUnit,
      })),
    [businessUnits],
  )

  const filters = useMemo(
    () => [
      {
        key: 'TYPE_NAME',
        label: 'Search by Lookup Type / Code',
        placeholder: '--Search by Type or Code--',
        matches: (row, value) =>
          String(row.TYPE_NAME ?? '')
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(row.TYPE_CODE ?? '')
            .toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        key: 'BU_ID',
        label: 'Search by Business Unit',
        placeholder: '--Search by Business Unit--',
        options: businessUnitOptions,
      },
      {
        key: 'STATUS',
        label: 'Search by Status',
        placeholder: '--Search by Status--',
        options: [
          { label: 'Active', value: '1' },
          { label: 'Inactive', value: '0' },
        ],
      },
    ],
    [businessUnitOptions],
  )

  const handleDelete = async (row) => {
    if (row.HAS_IN_USE_VALUES) {
      const msg =
        'Cannot delete this Lookup Type because one or more of its Lookup Values are already used in Payment Type or Voucher Type Mapping.'
      failActiveAction(msg)
      return false
    }
    try {
      await afmLookupApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to delete Lookup Type.')
      failActiveAction(msg)
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapLookupTypeFromApi(await afmLookupApi.get(row.ID))
      const nextStatus = current.STATUS === '1' ? '0' : '1'
      const updated = await afmLookupApi.update(
        row.ID,
        mapLookupTypeToApi(
          { ...current, STATUS: nextStatus },
          current.LOOKUP_VALUES,
        ),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Lookup Type status.')
    }
  }

  return (
    <ListPage
      title={'Lookup Type List'}
      createLabel={'New Lookup Type'}
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
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AfmLookupList
