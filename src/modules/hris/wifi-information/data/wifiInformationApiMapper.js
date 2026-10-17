/** @file Converts Wi-Fi Information API records to and from form field names. */
export function mapWifiInformationFromApi(record = {}, businessUnitNames = new Map()) {
  return {
    ID: String(record.id ?? ''),
    BU_ID: String(record.buId ?? ''),
    BUSINESS_UNIT: businessUnitNames.get(String(record.buId)) || '',
    WIFI_NAME: record.wifiName ?? '',
    MAC_ADDRESS: record.macAddress ?? '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapWifiInformationToApi(values) {
  return {
    buId: Number(values.BU_ID),
    wifiName: values.WIFI_NAME,
    macAddress: values.MAC_ADDRESS,
    status: Number(values.STATUS),
  }
}
