/** @file Read-only Wi-Fi Information details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { wifiInformationsApi } from '../api/wifiInformationApi'
import { mapWifiInformationFromApi } from '../data/wifiInformationApiMapper'

const basePath = '/hris/attendance-settings/wifi-information'

async function loadWifiInformation(id) {
  const [record, businessUnits] = await Promise.all([
    wifiInformationsApi.get(id),
    businessUnitsApi.list(),
  ])
  return mapWifiInformationFromApi(
    record,
    new Map(businessUnits.map((unit) => [String(unit.id), unit.businessUnit])),
  )
}

const viewConfig = {
  title: 'WiFi Information View',
  param: 'wifiInformationId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadWifiInformation,
  fields: [
    { label: 'Business Unit', key: 'BUSINESS_UNIT' },
    { label: 'WiFi Name', key: 'WIFI_NAME' },
    { label: 'MAC Address', key: 'MAC_ADDRESS' },
    { label: 'Status', key: 'STATUS', type: 'status' },
  ],
}

function WifiInformationView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default WifiInformationView
