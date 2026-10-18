/**
 * @file Backend-facing data contract and client validation for Employee Attendance Config.
 * Sections: exact table constants, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const EMPLOYEE_ATTENDANCE_CONFIG_TABLE = "HR_EMP_ATT_CONFIG";
export const EMPLOYEE_ATTENDANCE_WIFI_TABLE = "HR_EMP_ATT_WIFI";
export const EMPLOYEE_ATTENDANCE_GPS_TABLE = "HR_EMP_ATT_GPS";

export const initialEmployeeAttendanceConfigValues = {
  BU_ID: "",
  EMPLOYEE_ID: "",
  EMPLOYEE_CODE: "",
  EMPLOYEE_NAME: "",
  EMPLOYEE_TYPE: "",
  DEPARTMENT_NAME: "",
  DESIGNATION_NAME: "",
  ATTENDANCE_PERMISSIONS: ["WiFi"],
  WIFI_FLEXIBLE: "0",
  WIFI_IN_FLEXIBLE: "0",
  WIFI_OUT_FLEXIBLE: "0",
  GPS_FLEXIBLE: "0",
  GPS_IN_FLEXIBLE: "0",
  GPS_OUT_FLEXIBLE: "0",
  GPS_TRACKING: "0",
  TRACKING_FROM_TIME: "",
  TRACKING_TO_TIME: "",
  SHIFT_MODE: "Single",
  SHIFT_ID: "",
  STATUS: "1",
};

export const createInitialEmployeeAttendanceConfigValues = () => ({
  ...initialEmployeeAttendanceConfigValues,
  ATTENDANCE_PERMISSIONS: [
    ...initialEmployeeAttendanceConfigValues.ATTENDANCE_PERMISSIONS,
  ],
});

export const createWifiConfigRow = () => ({
  CLIENT_ID: `wifi-${crypto.randomUUID()}`,
  WIFI_ID: "",
  MAC_ADDRESS: "",
  STATUS: "",
});

export const createGpsConfigRow = () => ({
  CLIENT_ID: `gps-${crypto.randomUUID()}`,
  LOCATION_ID: "",
  LATITUDE: "",
  LONGITUDE: "",
  STATUS: "",
});

export function validateEmployeeAttendanceConfig(
  values,
  wifiRows,
  gpsRows,
) {
  const shiftMode = values.SHIFT_MODE === "Multiple" ? "Multiple" : "Single";
  const normalizedShiftId =
    shiftMode === "Multiple"
      ? [
          ...new Set(
            (Array.isArray(values.SHIFT_ID) ? values.SHIFT_ID : [])
              .map((shiftId) => String(shiftId ?? "").trim())
              .filter(Boolean),
          ),
        ]
      : String(
          Array.isArray(values.SHIFT_ID)
            ? values.SHIFT_ID[0] ?? ""
            : values.SHIFT_ID ?? "",
        ).trim();
  const normalizedValues = {
    ...values,
    BU_ID: String(values.BU_ID ?? "").trim(),
    EMPLOYEE_ID: String(values.EMPLOYEE_ID ?? "").trim(),
    EMPLOYEE_CODE: String(values.EMPLOYEE_CODE ?? "").trim(),
    EMPLOYEE_NAME: String(values.EMPLOYEE_NAME ?? "").trim(),
    EMPLOYEE_TYPE: String(values.EMPLOYEE_TYPE ?? "").trim(),
    DEPARTMENT_NAME: String(values.DEPARTMENT_NAME ?? "").trim(),
    DESIGNATION_NAME: String(values.DESIGNATION_NAME ?? "").trim(),
    ATTENDANCE_PERMISSIONS: Array.isArray(values.ATTENDANCE_PERMISSIONS)
      ? [...new Set(values.ATTENDANCE_PERMISSIONS)]
      : [],
    WIFI_FLEXIBLE: String(values.WIFI_FLEXIBLE) === "1" ? "1" : "0",
    WIFI_IN_FLEXIBLE:
      String(values.WIFI_IN_FLEXIBLE) === "1" ? "1" : "0",
    WIFI_OUT_FLEXIBLE:
      String(values.WIFI_OUT_FLEXIBLE) === "1" ? "1" : "0",
    GPS_FLEXIBLE: String(values.GPS_FLEXIBLE) === "1" ? "1" : "0",
    GPS_IN_FLEXIBLE:
      String(values.GPS_IN_FLEXIBLE) === "1" ? "1" : "0",
    GPS_OUT_FLEXIBLE:
      String(values.GPS_OUT_FLEXIBLE) === "1" ? "1" : "0",
    GPS_TRACKING: String(values.GPS_TRACKING) === "1" ? "1" : "0",
    TRACKING_FROM_TIME: String(values.TRACKING_FROM_TIME ?? "").trim(),
    TRACKING_TO_TIME: String(values.TRACKING_TO_TIME ?? "").trim(),
    SHIFT_MODE: shiftMode,
    SHIFT_ID: normalizedShiftId,
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  if (!normalizedValues.BU_ID) errors.BU_ID = "Business Unit is required.";
  if (!normalizedValues.EMPLOYEE_ID) {
    errors.EMPLOYEE_ID = "Employee Name is required.";
  }
  if (normalizedValues.ATTENDANCE_PERMISSIONS.length === 0) {
    errors.ATTENDANCE_PERMISSIONS =
      "Select at least one Attendance Permission.";
  }
  if (
    (normalizedValues.SHIFT_MODE === "Single" && !normalizedValues.SHIFT_ID) ||
    (normalizedValues.SHIFT_MODE === "Multiple" &&
      normalizedValues.SHIFT_ID.length === 0)
  ) {
    errors.SHIFT_ID = normalizedValues.SHIFT_MODE === "Multiple"
      ? "Select at least one Shift Name."
      : "Shift Name is required.";
  }

  if (normalizedValues.GPS_TRACKING === "1") {
    if (!normalizedValues.TRACKING_FROM_TIME) {
      errors.TRACKING_FROM_TIME = "Tracking From Time is required.";
    }
    if (!normalizedValues.TRACKING_TO_TIME) {
      errors.TRACKING_TO_TIME = "Tracking To Time is required.";
    } else if (
      normalizedValues.TRACKING_TO_TIME ===
      normalizedValues.TRACKING_FROM_TIME
    ) {
      errors.TRACKING_TO_TIME =
        "Tracking To Time must differ from Tracking From Time.";
    }
  }

  if (normalizedValues.ATTENDANCE_PERMISSIONS.includes("WiFi")) {
    const selectedWifiIds = wifiRows
      .map((row) => String(row.WIFI_ID ?? "").trim())
      .filter(Boolean);
    if (selectedWifiIds.length === 0) {
      errors.WIFI_ROWS = "Select at least one WiFi.";
    } else if (new Set(selectedWifiIds).size !== selectedWifiIds.length) {
      errors.WIFI_ROWS = "The same WiFi cannot be selected more than once.";
    }
  }

  if (normalizedValues.ATTENDANCE_PERMISSIONS.includes("GPS")) {
    const selectedLocationIds = gpsRows
      .map((row) => String(row.LOCATION_ID ?? "").trim())
      .filter(Boolean);
    if (selectedLocationIds.length === 0) {
      errors.GPS_ROWS = "Select at least one GPS Location.";
    } else if (
      new Set(selectedLocationIds).size !== selectedLocationIds.length
    ) {
      errors.GPS_ROWS =
        "The same GPS Location cannot be selected more than once.";
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
