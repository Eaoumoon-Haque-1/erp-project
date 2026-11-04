/** @file API-backed list controller for Asset Return from Employee records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { assetReturnApi } from '../api/assetReturnApi'
import { mapAssetReturnFromApi } from '../data/assetReturnEmployeeApiMapper'
import { loadAssetReturnReferences } from '../data/assetReturnEmployeeOptions'

const formatCondition = (value) => (
  String(value || '')
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
)

const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'EMPLOYEE_NAME', label: 'Employee' },
  { key: 'ASSET_DATE', label: 'Assign Date', render: (value) => formatDateForDisplay(value) },
  { key: 'ACTUAL_RETURN_DATE', label: 'Actual Return Date', render: (value) => formatDateForDisplay(value) },
  { key: 'CONDITION_ON_RETURN', label: 'Return Condition', render: formatCondition },
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

function AssetReturnEmployeeList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetReturnApi.list(sessionBusinessUnitId),
      loadAssetReturnReferences(sessionBusinessUnitId),
    ])
      .then(([records, refs]) => {
        if (!active) return
        const mapped = (records || []).map((r) => mapAssetReturnFromApi(r, refs))
        setRows(mapped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Returns.'))
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
      key: 'EMPLOYEE_NAME',
      label: 'Search by Employee',
      placeholder: '--Search by Employee--',
      matches: (row, value) => String(row.EMPLOYEE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
      await assetReturnApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Return.'))
    }
  }

  const handleStatusChange = async (row) => {
    const nextStatus = String(row.STATUS) === '1' ? '0' : '1'
    try {
      await assetReturnApi.update(row.ID, {
        id: Number(row.ID),
        bgId: row.BG_ID ? Number(row.BG_ID) : null,
        buId: row.BU_ID ? Number(row.BU_ID) : null,
        assignId: row.ASSET_ASSIGNMENT_ID ? Number(row.ASSET_ASSIGNMENT_ID) : null,
        assetDate: row.ASSET_DATE || null,
        itemId: row.ITEM_ID ? Number(row.ITEM_ID) : null,
        emplId: row.HR_EMPL_ID ? Number(row.HR_EMPL_ID) : null,
        expectedReturnDate: row.EXPECTED_RETURN_DATE || null,
        actualReturnDate: row.ACTUAL_RETURN_DATE || null,
        conditionOnReturn: row.CONDITION_ON_RETURN || null,
        remarks: row.REMARKS || '',
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
      title={'Asset Return from Employee List'}
      createLabel={'New'}
      createTo={'/asset/asset-return-from-employee/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-return-from-employee/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-return-from-employee/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetReturnEmployeeList
