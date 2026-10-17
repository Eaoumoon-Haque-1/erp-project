/** @file Converts GPS Information API records to and from form field names. */
export function mapGpsInformationFromApi(record = {}, businessUnitNames = new Map()) {
  return {
    ID: String(record.id ?? ''),
    BU_ID: String(record.buId ?? ''),
    BUSINESS_UNIT: businessUnitNames.get(String(record.buId)) || '',
    LOCATION_NAME: record.locationName ?? '',
    LATITUDE: record.latitude == null ? '' : String(record.latitude),
    LONGITUDE: record.longitude == null ? '' : String(record.longitude),
    STATUS: String(record.status ?? 1),
  }
}

export function mapGpsInformationToApi(values) {
  return {
    buId: Number(values.BU_ID),
    locationName: values.LOCATION_NAME,
    latitude: Number(values.LATITUDE),
    longitude: Number(values.LONGITUDE),
    status: Number(values.STATUS),
  }
}
