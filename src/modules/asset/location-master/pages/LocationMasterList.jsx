/** @file List-page controller for API-backed Location Master records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetLocationsApi } from '../../../../api/assetLocation'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { mapLocationMasterFromApi, mapLocationMasterToApi } from '../data/locationMasterApiMapper'
import { locationBusinessGroup } from '../data/locationMasterScope'
import useLocationReferences from '../data/useLocationReferences'

const columns = [
  { key: 'LOCATION_NAME', label: 'Location Name' },
  { key: 'LOCATION_CODE', label: 'Code' },
  { key: 'CUSTODIAN_NAME', label: 'Custodian' },
  { key: 'SUB_CUSTODIAN_NAME', label: 'Sub Custodian' },
  { key: 'DEPT_NAME', label: 'Department' },
  { key: 'PLACE', label: 'Building/Floor/Room' },
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

function LocationMasterList() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const { businessUnitOptions } = useBusinessOptions(locationBusinessGroup.ID)
  const { custodians, departments } = useLocationReferences()

  useEffect(() => {
    let active = true
    // No buId is sent: the default view lists every Business Unit.
    assetLocationsApi.list()
      .then((items) => {
        if (active) setRecords(items.map(mapLocationMasterFromApi))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Locations.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // The API returns ids only; names are resolved from the loaded reference lists.
  const rows = useMemo(() => records.map((record) => {
    const custodian = custodians.find((item) => item.ID === record.CUSTODIAN_ID)
    return {
      ...record,
      CUSTODIAN_NAME: custodian?.CUSTODIAN_NAME || '-',
      SUB_CUSTODIAN_NAME: custodian?.SUB_CUSTODIANS
        .find((item) => item.ID === record.SUB_CUSTODIAN_ID)?.SUB_CUSTODIAN_NAME || '-',
      DEPT_NAME: departments.find((item) => item.ID === record.DEPT_ID)?.NAME || '-',
      PLACE: [record.BUILDING, record.FLOOR, record.ROOM].join(' / '),
    }
  }), [records, custodians, departments])

  const filters = useMemo(() => [
    {
      key: 'LOCATION_NAME',
      label: 'Search by Location Name',
      placeholder: '--Search by Location Name--',
      matches: (row, value) => String(row.LOCATION_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
      await assetLocationsApi.remove(row.ID)
      setRecords((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Location.')
    }
  }

  // The record is a flat object, so the row itself is the full PUT body.
  const handleStatusChange = async (row) => {
    try {
      const updated = await assetLocationsApi.update(
        row.ID,
        mapLocationMasterToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRecords((current) => current.map((item) => (
        item.ID === row.ID ? mapLocationMasterFromApi(updated) : item
      )))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Location status.')
    }
  }

  return (
    <ListPage
      title={'Location Master List'}
      createLabel={'New'}
      createTo={'/asset/location-master/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/location-master/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default LocationMasterList
