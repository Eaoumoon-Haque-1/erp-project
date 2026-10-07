/**
 * @file Backend-facing data contract and client validation for GPS Information.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const GPS_INFO_TABLE = "GPS_INFO";

export const temporaryGpsInformationBusinessUnits = [
  { ID: "1", BUSINESS_UNIT: "Head Office" },
  { ID: "2", BUSINESS_UNIT: "Factory Unit" },
  { ID: "3", BUSINESS_UNIT: "Regional Office" },
];

export const initialGpsInformationValues = {
  BU_ID: "",
  LOCATION_NAME: "",
  LATITUDE: "",
  LONGITUDE: "",
  STATUS: "1",
};

export function validateGpsInformation(values) {
  const normalizedValues = {
    BU_ID: String(values.BU_ID ?? "").trim(),
    LOCATION_NAME: String(values.LOCATION_NAME ?? "").trim(),
    LATITUDE: String(values.LATITUDE ?? "").trim(),
    LONGITUDE: String(values.LONGITUDE ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };

  const errors = {};

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = "Business Unit is required.";
  }

  if (!normalizedValues.LOCATION_NAME) {
    errors.LOCATION_NAME = "Location Name is required.";
  } else if (normalizedValues.LOCATION_NAME.length < 2) {
    errors.LOCATION_NAME = "Location Name must be at least 2 characters.";
  } else if (normalizedValues.LOCATION_NAME.length > 200) {
    errors.LOCATION_NAME = "Location Name must not exceed 200 characters.";
  }

  if (!normalizedValues.LATITUDE) {
    errors.LATITUDE = "Latitude is required.";
  } else if (normalizedValues.LATITUDE.length < 2) {
    errors.LATITUDE = "Latitude must be at least 2 characters.";
  } else if (normalizedValues.LATITUDE.length > 50) {
    errors.LATITUDE = "Latitude must not exceed 50 characters.";
  }

  if (!normalizedValues.LONGITUDE) {
    errors.LONGITUDE = "Longitude is required.";
  } else if (normalizedValues.LONGITUDE.length < 2) {
    errors.LONGITUDE = "Longitude must be at least 2 characters.";
  } else if (normalizedValues.LONGITUDE.length > 50) {
    errors.LONGITUDE = "Longitude must not exceed 50 characters.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
