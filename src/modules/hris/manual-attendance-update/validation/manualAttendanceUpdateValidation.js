/**
 * @file Backend-facing data contract and client validation for Manual Attendance Update.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const MANUAL_ATTENDANCE_UPDATE_TABLE = "HR_MANUAL_ATTN_UPDATE";

export const temporaryManualAttendanceBusinessGroup = {
  ID: "1",
  GROUP_NAME: "Cloud ERP Group",
};

export const temporaryManualAttendanceBusinessUnits = [
  { ID: "1", BUSINESS_UNIT: "Head Office" },
  { ID: "2", BUSINESS_UNIT: "Factory Unit" },
  { ID: "3", BUSINESS_UNIT: "Sales Office" },
];

export const temporaryManualAttendanceDepartments = [
  { ID: "1", BU_ID: "1", DEPARTMENT: "HR" },
  { ID: "2", BU_ID: "1", DEPARTMENT: "Finance" },
  { ID: "3", BU_ID: "2", DEPARTMENT: "Engineering" },
  { ID: "4", BU_ID: "2", DEPARTMENT: "Production" },
  { ID: "5", BU_ID: "3", DEPARTMENT: "Sales" },
];

export const temporaryManualAttendanceDesignations = [
  { ID: "1", DEPT_ID: "1", DESIGNATION: "HR Manager" },
  { ID: "2", DEPT_ID: "1", DESIGNATION: "HR Executive" },
  { ID: "3", DEPT_ID: "2", DESIGNATION: "Accountant" },
  { ID: "4", DEPT_ID: "3", DESIGNATION: "Software Engineer" },
  { ID: "5", DEPT_ID: "4", DESIGNATION: "Production Officer" },
  { ID: "6", DEPT_ID: "5", DESIGNATION: "Sales Executive" },
];

export const temporaryManualAttendanceShifts = [
  { ID: "1", BU_ID: "1", SHIFT_TITLE: "General Shift" },
  { ID: "2", BU_ID: "2", SHIFT_TITLE: "Morning Shift" },
  { ID: "3", BU_ID: "2", SHIFT_TITLE: "Night Shift" },
  { ID: "4", BU_ID: "3", SHIFT_TITLE: "Sales Shift" },
];

export const initialManualAttendanceUpdateValues = {
  BG_ID: temporaryManualAttendanceBusinessGroup.ID,
  BU_ID: "",
  DEPT_ID: "",
  DESIG_ID: "",
  SHIFT_ID: "",
  ATTEN_DATE: "",
  IN_TIME: "",
  OUT_TIME: "",
  NOTE: "",
  STATUS: "1",
};

export const createInitialManualAttendanceUpdateValues = () => ({
  ...initialManualAttendanceUpdateValues,
});

export function validateManualAttendanceUpdate(values) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? "").trim(),
    BU_ID: String(values.BU_ID ?? "").trim(),
    DEPT_ID: String(values.DEPT_ID ?? "").trim(),
    DESIG_ID: String(values.DESIG_ID ?? "").trim(),
    SHIFT_ID: String(values.SHIFT_ID ?? "").trim(),
    ATTEN_DATE: String(values.ATTEN_DATE ?? "").trim(),
    IN_TIME: String(values.IN_TIME ?? "").trim(),
    OUT_TIME: String(values.OUT_TIME ?? "").trim(),
    NOTE: String(values.NOTE ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  [
    ["BG_ID", "Group Name"],
    ["BU_ID", "Business Unit"],
    ["DEPT_ID", "Department Name"],
    ["DESIG_ID", "Designation Name"],
    ["SHIFT_ID", "Shift"],
    ["ATTEN_DATE", "Attendance Date"],
    ["IN_TIME", "In Time"],
  ].forEach(([key, label]) => {
    if (!normalizedValues[key]) errors[key] = `${label} is required.`;
  });

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
