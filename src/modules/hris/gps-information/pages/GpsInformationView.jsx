/** @file Read-only GPS Information details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { gpsInformationsApi } from '../api/gpsInformationApi'
import { mapGpsInformationFromApi } from '../data/gpsInformationApiMapper'

const basePath = '/hris/attendance-settings/gps-information'

async function loadGpsInformation(id) {
  const [record, businessUnits] = await Promise.all([
    gpsInformationsApi.get(id),
    businessUnitsApi.list(),
  ])
  return mapGpsInformationFromApi(
    record,
    new Map(businessUnits.map((unit) => [String(unit.id), unit.businessUnit])),
  )
}

const viewConfig = {
  title: 'GPS Information View',
  param: 'gpsInformationId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadGpsInformation,
  fields: [
    { label: 'Business Unit', key: 'BUSINESS_UNIT' },
    { label: 'Location Name', key: 'LOCATION_NAME' },
    { label: 'Latitude', key: 'LATITUDE' },
    { label: 'Longitude', key: 'LONGITUDE' },
    { label: 'Status', key: 'STATUS', type: 'status' },
  ],
}

function GpsInformationView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default GpsInformationView
