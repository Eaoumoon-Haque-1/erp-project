/**
 * @file Backend-facing data contract and client validation for Leave Allocation.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LEAVE_ALLOCATION_TABLE = "HR_LEAVE_ALLOCATION";

export const initialLeaveAllocationValues = {
  BU_ID: "",
  EMP_TYPE_ID: "",
  LEAVE_CATEGORY_ID: "",
  TOTAL_LEAVE_DAYS: "",
  LEAVE_YEAR: String(new Date().getFullYear()),
  SANDWICH_LEAVE_APPLICABLE: "0",
  WITH_PAY: "1",
  STATUS: "1",
};

export const createInitialLeaveAllocationValues = () => ({
  ...initialLeaveAllocationValues,
});

export function validateLeaveAllocation(values) {
  const normalizedValues = {
    BU_ID: String(values.BU_ID ?? "").trim(),
    EMP_TYPE_ID: String(values.EMP_TYPE_ID ?? "").trim(),
    LEAVE_CATEGORY_ID: String(values.LEAVE_CATEGORY_ID ?? "").trim(),
    TOTAL_LEAVE_DAYS: String(values.TOTAL_LEAVE_DAYS ?? "").trim(),
    LEAVE_YEAR: String(values.LEAVE_YEAR ?? "").trim(),
    SANDWICH_LEAVE_APPLICABLE:
      String(values.SANDWICH_LEAVE_APPLICABLE) === "1" ? "1" : "0",
    WITH_PAY: String(values.WITH_PAY) === "1" ? "1" : "0",
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  [
    ["BU_ID", "Business Unit"],
    ["EMP_TYPE_ID", "Employee Type"],
    ["LEAVE_CATEGORY_ID", "Leave Category"],
    ["TOTAL_LEAVE_DAYS", "Total Leave Days per Year"],
    ["LEAVE_YEAR", "Year"],
  ].forEach(([key, label]) => {
    if (!normalizedValues[key]) errors[key] = `${label} is required.`;
  });

  if (normalizedValues.TOTAL_LEAVE_DAYS) {
    const totalDays = Number(normalizedValues.TOTAL_LEAVE_DAYS);
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValues.TOTAL_LEAVE_DAYS)) {
      errors.TOTAL_LEAVE_DAYS =
        "Total Leave Days must be a number with no more than 2 decimal places.";
    } else if (totalDays < 0.5) {
      errors.TOTAL_LEAVE_DAYS = "Total Leave Days must be at least 0.5.";
    } else if (totalDays > 999.99) {
      errors.TOTAL_LEAVE_DAYS = "Total Leave Days cannot exceed 999.99.";
    }
  }

  if (
    normalizedValues.LEAVE_YEAR &&
    !/^(19|20)\d{2}$/.test(normalizedValues.LEAVE_YEAR)
  ) {
    errors.LEAVE_YEAR = "Year must be a valid 4-digit year.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
