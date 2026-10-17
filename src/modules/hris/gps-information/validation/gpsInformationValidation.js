/**
 * @file Backend-facing data contract and client validation for GPS Information.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const GPS_INFO_TABLE = "GPS_INFO";

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
  } else if (!Number.isFinite(Number(normalizedValues.LATITUDE))) {
    errors.LATITUDE = "Latitude must be a valid number.";
  } else if (Number(normalizedValues.LATITUDE) < -90 || Number(normalizedValues.LATITUDE) > 90) {
    errors.LATITUDE = "Latitude must be between -90 and 90.";
  }

  if (!normalizedValues.LONGITUDE) {
    errors.LONGITUDE = "Longitude is required.";
  } else if (!Number.isFinite(Number(normalizedValues.LONGITUDE))) {
    errors.LONGITUDE = "Longitude must be a valid number.";
  } else if (Number(normalizedValues.LONGITUDE) < -180 || Number(normalizedValues.LONGITUDE) > 180) {
    errors.LONGITUDE = "Longitude must be between -180 and 180.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
