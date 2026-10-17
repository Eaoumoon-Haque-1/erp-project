/**
 * @file Backend-facing data contract and client validation for Shift.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const SHIFT_TABLE = "HR_SHIFT";

export const weekendDropdownOptions = [
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
  { value: "Friday & Saturday", label: "Friday & Saturday" },
  { value: "Saturday & Sunday", label: "Saturday & Sunday" },
  { value: "Thursday & Friday", label: "Thursday & Friday" },
];

export const initialShiftValues = {
  BU_ID: "",
  SHIFT_TITLE: "",
  SHIFT_START_TIME: "",
  SHIFT_END_TIME: "",
  APPLY_LATE_IN: "0",
  LATE_IN_DAYS: "",
  LATE_IN_DEDUCTION: "",
  APPLY_EARLY_OUT: "0",
  EARLY_OUT_DAYS: "",
  EARLY_OUT_DEDUCTION: "",
  WEEKEND: "Friday",
  GRACE_TIME_MINUTES: "15",
  ALLOW_LATE_IN_MSG: "0",
  ALLOW_EARLY_OUT_MSG: "0",
  ATTN_IN_OUT_POLICY: "0",
  START_BEFORE: "",
  CLOSE_AFTER: "",
  NOT_ALLOW_ATTN: "0",
  IN_TIME_START: "",
  IN_TIME_CLOSE: "",
  OUT_TIME_START: "",
  OUT_TIME_CLOSE: "",
  ALLOW_NEXT_DAY_ATTN: "0",
  ALLOW_OVERTIME: "0",
  MAX_OT_HOUR: "",
  EXTRA_OT_HOUR: "",
  STATUS: "1",
};

export const createInitialShiftValues = () => ({ ...initialShiftValues });

const isPositiveInteger = (value) => /^\d+$/.test(value) && Number(value) > 0;
const isNonNegativeInteger = (value) => /^\d+$/.test(value);
const isNonNegativeDecimal = (value) =>
  /^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) >= 0;

export function validateShift(inputValues) {
  const values = {
    ...inputValues,
    BU_ID: String(inputValues.BU_ID ?? "").trim(),
    SHIFT_TITLE: String(inputValues.SHIFT_TITLE ?? "").trim(),
    SHIFT_START_TIME: String(inputValues.SHIFT_START_TIME ?? "").trim(),
    SHIFT_END_TIME: String(inputValues.SHIFT_END_TIME ?? "").trim(),
    APPLY_LATE_IN: String(inputValues.APPLY_LATE_IN) === "1" ? "1" : "0",
    LATE_IN_DAYS: String(inputValues.LATE_IN_DAYS ?? "").trim(),
    LATE_IN_DEDUCTION: String(inputValues.LATE_IN_DEDUCTION ?? "").trim(),
    APPLY_EARLY_OUT:
      String(inputValues.APPLY_EARLY_OUT) === "1" ? "1" : "0",
    EARLY_OUT_DAYS: String(inputValues.EARLY_OUT_DAYS ?? "").trim(),
    EARLY_OUT_DEDUCTION: String(
      inputValues.EARLY_OUT_DEDUCTION ?? "",
    ).trim(),
    WEEKEND: String(inputValues.WEEKEND ?? "").trim(),
    GRACE_TIME_MINUTES: String(
      inputValues.GRACE_TIME_MINUTES ?? "",
    ).trim(),
    ALLOW_LATE_IN_MSG:
      String(inputValues.ALLOW_LATE_IN_MSG) === "1" ? "1" : "0",
    ALLOW_EARLY_OUT_MSG:
      String(inputValues.ALLOW_EARLY_OUT_MSG) === "1" ? "1" : "0",
    ATTN_IN_OUT_POLICY:
      String(inputValues.ATTN_IN_OUT_POLICY) === "1" ? "1" : "0",
    START_BEFORE: String(inputValues.START_BEFORE ?? "").trim(),
    CLOSE_AFTER: String(inputValues.CLOSE_AFTER ?? "").trim(),
    NOT_ALLOW_ATTN:
      String(inputValues.NOT_ALLOW_ATTN) === "1" ? "1" : "0",
    IN_TIME_START: String(inputValues.IN_TIME_START ?? "").trim(),
    IN_TIME_CLOSE: String(inputValues.IN_TIME_CLOSE ?? "").trim(),
    OUT_TIME_START: String(inputValues.OUT_TIME_START ?? "").trim(),
    OUT_TIME_CLOSE: String(inputValues.OUT_TIME_CLOSE ?? "").trim(),
    ALLOW_NEXT_DAY_ATTN:
      String(inputValues.ALLOW_NEXT_DAY_ATTN) === "1" ? "1" : "0",
    ALLOW_OVERTIME:
      String(inputValues.ALLOW_OVERTIME) === "1" ? "1" : "0",
    MAX_OT_HOUR: String(inputValues.MAX_OT_HOUR ?? "").trim(),
    EXTRA_OT_HOUR: String(inputValues.EXTRA_OT_HOUR ?? "").trim(),
    STATUS: String(inputValues.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  if (!values.BU_ID) errors.BU_ID = "Business Unit is required.";
  if (!values.SHIFT_TITLE) {
    errors.SHIFT_TITLE = "Shift Title is required.";
  } else if (values.SHIFT_TITLE.length < 2) {
    errors.SHIFT_TITLE = "Shift Title must be at least 2 characters.";
  } else if (values.SHIFT_TITLE.length > 100) {
    errors.SHIFT_TITLE = "Shift Title must not exceed 100 characters.";
  }

  if (!values.SHIFT_START_TIME) {
    errors.SHIFT_START_TIME = "Actual Shift Start Time is required.";
  }
  if (!values.SHIFT_END_TIME) {
    errors.SHIFT_END_TIME = "Actual Shift End Time is required.";
  } else if (values.SHIFT_END_TIME === values.SHIFT_START_TIME) {
    errors.SHIFT_END_TIME =
      "Actual Shift End Time must differ from Start Time.";
  } else if (
    values.SHIFT_START_TIME &&
    values.SHIFT_END_TIME < values.SHIFT_START_TIME &&
    values.ALLOW_NEXT_DAY_ATTN !== "1"
  ) {
    errors.SHIFT_END_TIME =
      "Enable Next Day Attendance for an overnight shift.";
  }

  if (values.APPLY_LATE_IN === "1") {
    if (!isPositiveInteger(values.LATE_IN_DAYS)) {
      errors.LATE_IN_DAYS =
        "Applicable Late In Days must be a positive whole number.";
    }
    if (
      !isNonNegativeDecimal(values.LATE_IN_DEDUCTION) ||
      Number(values.LATE_IN_DEDUCTION) <= 0 ||
      Number(values.LATE_IN_DEDUCTION) > 1
    ) {
      errors.LATE_IN_DEDUCTION =
        "Late In Deduction must be greater than 0 and no more than 1.";
    }
  }

  if (values.APPLY_EARLY_OUT === "1") {
    if (!isPositiveInteger(values.EARLY_OUT_DAYS)) {
      errors.EARLY_OUT_DAYS =
        "Applicable Early Out Days must be a positive whole number.";
    }
    if (
      !isNonNegativeDecimal(values.EARLY_OUT_DEDUCTION) ||
      Number(values.EARLY_OUT_DEDUCTION) <= 0 ||
      Number(values.EARLY_OUT_DEDUCTION) > 1
    ) {
      errors.EARLY_OUT_DEDUCTION =
        "Early Out Deduction must be greater than 0 and no more than 1.";
    }
  }

  if (!values.WEEKEND) errors.WEEKEND = "Weekend is required.";
  if (
    !isNonNegativeInteger(values.GRACE_TIME_MINUTES) ||
    Number(values.GRACE_TIME_MINUTES) > 999
  ) {
    errors.GRACE_TIME_MINUTES =
      "Grace Time must be a whole number between 0 and 999.";
  }

  if (values.ATTN_IN_OUT_POLICY === "1") {
    if (!isNonNegativeInteger(values.START_BEFORE)) {
      errors.START_BEFORE = "Start Before must be a non-negative whole number.";
    }
    if (!isNonNegativeInteger(values.CLOSE_AFTER)) {
      errors.CLOSE_AFTER = "Close After must be a non-negative whole number.";
    }
    [
      ["IN_TIME_START", "In Time (Start)"],
      ["IN_TIME_CLOSE", "In Time (Close)"],
      ["OUT_TIME_START", "Out Time (Start)"],
      ["OUT_TIME_CLOSE", "Out Time (Close)"],
    ].forEach(([key, label]) => {
      if (!values[key]) errors[key] = `${label} is required.`;
    });
    if (
      values.IN_TIME_START &&
      values.IN_TIME_CLOSE &&
      values.IN_TIME_CLOSE <= values.IN_TIME_START
    ) {
      errors.IN_TIME_CLOSE = "In Time (Close) must be after In Time (Start).";
    }
    if (
      values.OUT_TIME_START &&
      values.OUT_TIME_CLOSE &&
      values.OUT_TIME_CLOSE <= values.OUT_TIME_START &&
      values.ALLOW_NEXT_DAY_ATTN !== "1"
    ) {
      errors.OUT_TIME_CLOSE =
        "Out Time (Close) must be later, or Next Day Attendance must be enabled.";
    }
  }

  if (values.ALLOW_OVERTIME === "1") {
    if (
      !isNonNegativeDecimal(values.MAX_OT_HOUR) ||
      Number(values.MAX_OT_HOUR) <= 0
    ) {
      errors.MAX_OT_HOUR = "Maximum OT Hour must be greater than 0.";
    }
    if (!isNonNegativeDecimal(values.EXTRA_OT_HOUR)) {
      errors.EXTRA_OT_HOUR =
        "Extra OT Hour is required and cannot be negative.";
    } else if (
      values.MAX_OT_HOUR &&
      Number(values.EXTRA_OT_HOUR) > Number(values.MAX_OT_HOUR)
    ) {
      errors.EXTRA_OT_HOUR =
        "Extra OT Hour must not exceed Maximum OT Hour.";
    }
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
