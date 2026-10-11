/** @file List-page controller for API-backed Custodian records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { custodiansApi } from '../../../../api/custodian'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import {
  countActiveSubCustodians,
  mapCustodianFromApi,
  mapCustodianToApi,
} from '../data/custodianApiMapper'
import { custodianBusinessGroup } from '../data/custodianScope'

const columns = [
  { key: 'CUSTODIAN_NAME', label: 'Custodian Name' },
  { key: 'SUB_CUSTODIAN_COUNT', label: 'Sub Custodian' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

// Only active sub custodians are counted; inactive (soft-removed) rows are not.
function toListRow(record) {
  const mapped = mapCustodianFromApi(record)
  return { ...mapped, SUB_CUSTODIAN_COUNT: countActiveSubCustodians(mapped) }
}

function CustodianList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const { businessUnitOptions } = useBusinessOptions(custodianBusinessGroup.ID)

  useEffect(() => {
    let active = true
    // No buId is sent: the default view lists every Business Unit.
    custodiansApi.list()
      .then((records) => {
        if (active) setRows(records.map(toListRow))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Custodians.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filters = useMemo(() => [
    {
      key: 'CUSTODIAN_NAME',
      label: 'Search by Custodian Name',
      placeholder: '--Search by Custodian Name--',
      matches: (row, value) => String(row.CUSTODIAN_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
  ], [businessUnitOptions])

  const handleDelete = async (row) => {
    try {
      await custodiansApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      // e.g. 400 when locations exist under this custodian: show the backend message.
      getApiErrorMessage(error, 'Unable to delete Custodian.')
    }
  }

  // PUT replaces the whole sub list, so re-read the record first instead of
  // trusting the list payload; omitted saved rows would be set Inactive.
  const handleStatusChange = async (row) => {
    try {
      const current = mapCustodianFromApi(await custodiansApi.get(row.ID))
      const updated = await custodiansApi.update(row.ID, mapCustodianToApi(
        { ...current, STATUS: current.STATUS === '1' ? '0' : '1' },
        current.SUB_CUSTODIANS,
      ))
      setRows((items) => items.map((item) => (item.ID === row.ID ? toListRow(updated) : item)))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Custodian status.')
    }
  }

  return (
    <ListPage
      title={'Custodian List'}
      createLabel={'New'}
      createTo={'/asset/custodian/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/custodian/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default CustodianList
