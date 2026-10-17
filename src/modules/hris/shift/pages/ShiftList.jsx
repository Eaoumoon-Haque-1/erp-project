/** @file API-backed Shift list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { shiftsApi } from '../api/shiftApi'
import { mapShiftFromApi, mapShiftToApi } from '../data/shiftApiMapper'

const basePath = '/hris/attendance-settings/shift'

const columns = [
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
  { key: 'SHIFT_TITLE', label: 'Shift Title' },
  { key: 'SHIFT_START_TIME', label: 'Start Time' },
  { key: 'SHIFT_END_TIME', label: 'End Time' },
  { key: 'GRACE_TIME_MINUTES', label: 'Grace Mins' },
  { key: 'WEEKEND', label: 'Weekend' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function ShiftList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [businessUnitNames, setBusinessUnitNames] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([shiftsApi.list(), businessUnitsApi.list()])
      .then(([records, units]) => {
        if (!active) return
        const names = new Map(units.map((unit) => [String(unit.id), unit.businessUnit]))
        setBusinessUnitNames(names)
        setRows(records.map((record) => mapShiftFromApi(record, names)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Shifts.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    {
      key: 'SHIFT_TITLE',
      label: 'Search by Shift Title',
      placeholder: '--Search by Shift Title--',
      matches: (row, value) => row.SHIFT_TITLE.toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'BU_ID',
      label: 'Search by Business Unit',
      placeholder: '--Search by Business Unit--',
      options: [...businessUnitNames].map(([value, label]) => ({ value, label })),
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [businessUnitNames])

  const handleDelete = async (row) => {
    try {
      await shiftsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Shift.'))
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await shiftsApi.update(
        row.ID,
        mapShiftToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) =>
        item.ID === row.ID ? mapShiftFromApi(updated, businessUnitNames) : item,
      ))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Shift status.'))
      return false
    }
  }

  return (
    <ListPage
      title={'Shift List'}
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

export default ShiftList
