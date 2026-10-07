/** @file List-page controller for temporary Custodian records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { listCustodians, removeCustodian, updateCustodian } from '../data/custodianStore'

const columns = [
  { key: 'CUSTODIAN_NAME', label: 'Custodian Name' },
  { key: 'SUB_CUSTODIAN_NAMES', label: 'Sub Custodian' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        value === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function toListRows(records) {
  return records.map((record) => ({
    ...record,
    SUB_CUSTODIAN_NAMES: record.SUB_CUSTODIANS
      .map((row) => row.SUB_CUSTODIAN_NAME)
      .join(', ') || 'N/A',
  }))
}

function CustodianList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => toListRows(listCustodians()))
  const filters = useMemo(() => [
    {
      key: 'CUSTODIAN_NAME',
      label: 'Search by Custodian Name',
      placeholder: '--Search by Custodian Name--',
      matches: (row, value) => row.CUSTODIAN_NAME.toLowerCase().includes(value.toLowerCase()),
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
  ], [])

  const refresh = () => setRows(toListRows(listCustodians()))

  const handleDelete = (row) => {
    if (!window.confirm(`Delete Custodian "${row.CUSTODIAN_NAME}"?`)) return
    removeCustodian(row.ID)
    refresh()
  }

  const handleStatusChange = (row) => {
    updateCustodian(row.ID, {
      ...row,
      STATUS: row.STATUS === '1' ? '0' : '1',
      SUB_CUSTODIANS: row.SUB_CUSTODIANS,
    })
    refresh()
  }

  return (
    <ListPage
      title={'Custodian List'}
      createLabel={'New'}
      createTo={'/asset/custodian/create'}
      filters={filters}
      columns={columns}
      rows={rows}
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
