/**
 * @file Backend-facing data contract and client validation for Manual Attendance Update.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const MANUAL_ATTENDANCE_UPDATE_TABLE = "HR_MANUAL_ATTN_UPDATE";

export const initialManualAttendanceUpdateValues = {
  BG_ID: "",
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
