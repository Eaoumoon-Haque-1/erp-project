/**
 * @file Backend-facing data contract and client validation for WiFi Information.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const WIFI_INFORMATION_TABLE = "WIFI_INFORMATION";

export const initialWifiInformationValues = {
  BU_ID: "",
  WIFI_NAME: "",
  MAC_ADDRESS: "",
  STATUS: "1",
};

export function validateWifiInformation(values) {
  const normalizedValues = {
    BU_ID: String(values.BU_ID ?? "").trim(),
    WIFI_NAME: String(values.WIFI_NAME ?? "").trim(),
    MAC_ADDRESS: String(values.MAC_ADDRESS ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };

  const errors = {};

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = "Business Unit is required.";
  }

  if (!normalizedValues.WIFI_NAME) {
    errors.WIFI_NAME = "WiFi Name is required.";
  } else if (normalizedValues.WIFI_NAME.length < 2) {
    errors.WIFI_NAME = "WiFi Name must be at least 2 characters.";
  } else if (normalizedValues.WIFI_NAME.length > 100) {
    errors.WIFI_NAME = "WiFi Name must not exceed 100 characters.";
  }

  if (!normalizedValues.MAC_ADDRESS) {
    errors.MAC_ADDRESS = "MAC Address is required.";
  } else if (normalizedValues.MAC_ADDRESS.length < 2) {
    errors.MAC_ADDRESS = "MAC Address must be at least 2 characters.";
  } else if (normalizedValues.MAC_ADDRESS.length > 100) {
    errors.MAC_ADDRESS = "MAC Address must not exceed 100 characters.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
