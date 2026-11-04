/** @file API-backed list controller for Asset Maintenance / AMC records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { maintenanceAmcApi } from '../api/maintenanceAmcApi'
import { mapMaintenanceAmcFromApi } from '../data/maintenanceAmcApiMapper'
import { loadMaintenanceReferences } from '../data/maintenanceAmcOptions'

const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'MAINTENANCE_TYPE_NAME', label: 'Maintenance Type' },
  { key: 'VENDOR_NAME', label: 'Vendor' },
  { key: 'START_DATE', label: 'Start Date', render: (value) => formatDateForDisplay(value) },
  { key: 'END_DATE', label: 'End Date', render: (value) => formatDateForDisplay(value) || '—' },
  { key: 'COST', label: 'Cost', render: (value) => Number(value || 0).toFixed(2) },
  { key: 'NEXT_DUE_DATE', label: 'Next Due Date', render: (value) => formatDateForDisplay(value) || '—' },
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

function MaintenanceAmcList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      maintenanceAmcApi.list(sessionBusinessUnitId),
      loadMaintenanceReferences(sessionBusinessUnitId),
    ])
      .then(([records, refs]) => {
        if (!active) return
        const mapped = (records || []).map((r) => mapMaintenanceAmcFromApi(r, refs))
        setRows(mapped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Maintenance / AMC records.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [sessionBusinessUnitId])

  const filters = useMemo(() => [
    {
      key: 'ITEM_NAME_LABEL',
      label: 'Search by Asset Item',
      placeholder: '--Search by Asset Item--',
      matches: (row, value) => String(row.ITEM_NAME_LABEL ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'MAINTENANCE_TYPE_NAME',
      label: 'Search by Maintenance Type',
      placeholder: '--Search by Maintenance Type--',
      matches: (row, value) => String(row.MAINTENANCE_TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [])

  const handleDelete = async (row) => {
    try {
      await maintenanceAmcApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete record.'))
    }
  }

  const handleStatusChange = async (row) => {
    const nextStatus = String(row.STATUS) === '1' ? '0' : '1'
    try {
      await maintenanceAmcApi.update(row.ID, {
        id: Number(row.ID),
        bgId: row.BG_ID ? Number(row.BG_ID) : null,
        buId: row.BU_ID ? Number(row.BU_ID) : null,
        itemId: row.ITEM_NAME ? Number(row.ITEM_NAME) : null,
        maintenanceType: row.MAINTENANCE_TYPE || null,
        maintenancePriority: row.MAINTENANCE_PRIORITY || null,
        vendorId: row.VENDOR_ID ? Number(row.VENDOR_ID) : null,
        startDate: row.START_DATE || null,
        endDate: row.END_DATE || null,
        cost: row.COST !== '' && row.COST != null ? Number(row.COST) : null,
        nextDueDate: row.NEXT_DUE_DATE || null,
        remark: row.REMARK || '',
        status: Number(nextStatus),
      })
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? { ...item, STATUS: nextStatus, status: Number(nextStatus) } : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update status.'))
    }
  }

  return (
    <ListPage
      title={'Maintenance / AMC List'}
      createLabel={'New'}
      createTo={'/asset/maintenance-amc/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/maintenance-amc/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/maintenance-amc/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default MaintenanceAmcList
