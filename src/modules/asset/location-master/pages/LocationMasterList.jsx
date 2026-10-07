/** @file List-page controller for temporary Location Master records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { listLocationMasters, removeLocationMaster, updateLocationMaster } from '../data/locationMasterStore'

const columns = [
  { key: 'LOCATION_NAME', label: 'Location Name' },
  { key: 'LOCATION_CODE', label: 'Location Code' },
  { key: 'CUSTODIAN_NAME', label: 'Custodian' },
  { key: 'SUB_CUSTODIAN_NAME', label: 'Sub Custodian' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        value === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>
    ),
  },
]

function LocationMasterList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listLocationMasters())
  const filters = useMemo(() => [
    { key: 'LOCATION_NAME', label: 'Search by Location Name', placeholder: '--Search by Location Name--', matches: (row, value) => row.LOCATION_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'CUSTODIAN_ID', label: 'Search by Custodian', placeholder: '--Search by Custodian--', options: [...new Map(rows.map((row) => [row.CUSTODIAN_ID, { value: row.CUSTODIAN_ID, label: row.CUSTODIAN_NAME }])).values()] },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [rows])

  const refresh = () => setRows(listLocationMasters())
  const handleDelete = (row) => {
    if (!window.confirm(`Delete Location "${row.LOCATION_NAME}"?`)) return
    removeLocationMaster(row.ID)
    refresh()
  }
  const handleStatusChange = (row) => {
    updateLocationMaster(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    refresh()
  }

  return (
    <ListPage
      title={'Location Master List'}
      createLabel={'New'}
      createTo={'/asset/location-master/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/location-master/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />}
    />
  )
}

export default LocationMasterList
