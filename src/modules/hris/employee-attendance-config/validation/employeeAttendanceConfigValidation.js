/**
 * @file Backend-facing data contract and client validation for Employee Attendance Config.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const EMPLOYEE_ATTENDANCE_CONFIG_TABLE = "HR_EMP_ATT_CONFIG";
export const EMPLOYEE_ATTENDANCE_WIFI_TABLE = "HR_EMP_ATT_WIFI";
export const EMPLOYEE_ATTENDANCE_GPS_TABLE = "HR_EMP_ATT_GPS";
export const EMPLOYEE_ATTENDANCE_MACHINE_TABLE = "HR_EMP_ATT_MACHINE";

export const temporaryEmployeeAttendanceConfigBusinessUnits = [
  { ID: "1", BUSINESS_UNIT: "Head Office" },
  { ID: "2", BUSINESS_UNIT: "Factory Unit" },
  { ID: "3", BUSINESS_UNIT: "Regional Office" },
];

export const mockEmployeeOptions = [
  {
    id: "101",
    buId: "1",
    code: "EMP-0101",
    name: "Samira Rahman",
    type: "Permanent",
    department: "Human Resources",
    designation: "HR Executive",
  },
  {
    id: "102",
    buId: "1",
    code: "EMP-0102",
    name: "Tanvir Hasan",
    type: "Permanent",
    department: "Administration",
    designation: "Senior Officer",
  },
  {
    id: "103",
    buId: "2",
    code: "EMP-0103",
    name: "Md. Eaoumoon Haque",
    type: "Contractual",
    department: "Software & IT",
    designation: "Software Engineer",
  },
];

export const mockShiftOptions = [
  { value: "1", label: "General Shift" },
  { value: "2", label: "Morning Shift" },
  { value: "3", label: "Evening Shift" },
  { value: "4", label: "Night Shift" },
];

export const mockWifiOptions = [
  {
    ID: "1",
    BU_ID: "1",
    WIFI_NAME: "Head Office WiFi",
    MAC_ADDRESS: "AA:BB:CC:DD:EE:FF",
    STATUS: "Active",
  },
  {
    ID: "2",
    BU_ID: "2",
    WIFI_NAME: "Factory WiFi",
    MAC_ADDRESS: "11:22:33:44:55:66",
    STATUS: "Active",
  },
];

export const mockGpsOptions = [
  {
    ID: "1",
    BU_ID: "1",
    LOCATION_NAME: "Head Office",
    LATITUDE: "23.8103000",
    LONGITUDE: "90.4125000",
    STATUS: "Active",
  },
  {
    ID: "2",
    BU_ID: "2",
    LOCATION_NAME: "Factory Unit",
    LATITUDE: "23.8200000",
    LONGITUDE: "90.4200000",
    STATUS: "Active",
  },
];

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

export const createMachineConfigRow = () => ({
  CLIENT_ID: `machine-${crypto.randomUUID()}`,
  MACHINE_ID: "",
  IP_ADDRESS: "",
});

export function validateEmployeeAttendanceConfig(
  values,
  wifiRows,
  gpsRows,
  machineRows,
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

  if (normalizedValues.ATTENDANCE_PERMISSIONS.includes("Machine")) {
    const normalizedMachineRows = machineRows.map((row) => ({
      MACHINE_ID: String(row.MACHINE_ID ?? "").trim(),
      IP_ADDRESS: String(row.IP_ADDRESS ?? "").trim(),
    }));
    const completeMachineRows = normalizedMachineRows.filter(
      (row) => row.MACHINE_ID && row.IP_ADDRESS,
    );

    if (completeMachineRows.length === 0) {
      errors.MACHINE_ROWS =
        "Enter Machine ID and IP Address for at least one Machine.";
    } else if (
      normalizedMachineRows.some(
        (row) =>
          (row.MACHINE_ID || row.IP_ADDRESS) &&
          (!row.MACHINE_ID || !row.IP_ADDRESS),
      )
    ) {
      errors.MACHINE_ROWS =
        "Every Machine row must include both Machine ID and IP Address.";
    } else {
      const machineIds = completeMachineRows.map((row) =>
        row.MACHINE_ID.toLowerCase(),
      );
      if (new Set(machineIds).size !== machineIds.length) {
        errors.MACHINE_ROWS = "The same Machine ID cannot be added twice.";
      }
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
