/** @file API-backed GPS Information list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { gpsInformationsApi } from '../api/gpsInformationApi'
import {
  mapGpsInformationFromApi,
  mapGpsInformationToApi,
} from '../data/gpsInformationApiMapper'

const basePath = '/hris/attendance-settings/gps-information'
const columns = [
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  { key: 'LOCATION_NAME', label: 'Location Name' },
  { key: 'LATITUDE', label: 'Latitude' },
  { key: 'LONGITUDE', label: 'Longitude' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function GpsInformationList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [businessUnitNames, setBusinessUnitNames] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([gpsInformationsApi.list(), businessUnitsApi.list()])
      .then(([gpsRecords, businessUnits]) => {
        if (!active) return
        const names = new Map(businessUnits.map((unit) => [String(unit.id), unit.businessUnit]))
        setBusinessUnitNames(names)
        setRows(gpsRecords.map((record) => mapGpsInformationFromApi(record, names)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load GPS Information.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BU_ID', label: 'Search by Business Unit', placeholder: '--Search by Business Unit--', options: [...businessUnitNames].map(([value, label]) => ({ value, label })) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [businessUnitNames])

  const handleDelete = async (row) => {
    try {
      await gpsInformationsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete GPS Information.'))
      return false
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await gpsInformationsApi.update(
        row.ID,
        mapGpsInformationToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) =>
        item.ID === row.ID ? mapGpsInformationFromApi(updated, businessUnitNames) : item,
      ))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update GPS Information status.'))
      return false
    }
  }

  return (
    <ListPage
      title={'GPS Information List'}
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

export default GpsInformationList
