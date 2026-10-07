/**
 * @file Backend-facing data contract and client validation for Leave Application.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LEAVE_APPLICATION_TABLE = "HR_EMP_LEAVE";
export const LEAVE_APPLICATION_MAX_FILE_SIZE = 2 * 1024 * 1024;
export const LEAVE_APPLICATION_ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export const temporaryLeaveApplicationEmployees = [
  {
    ID: "1",
    EMPLOYEE_NAME: "MD Rahman",
    BU_ID: "1",
    BUSINESS_UNIT: "Head Office",
    DEPT_ID: "1",
    DEPARTMENT: "HR",
    DESIGNATION_ID: "1",
    DESIGNATION: "Manager",
    EMP_TYPE_ID: "1",
    EMPLOYEE_TYPE: "Permanent",
  },
  {
    ID: "2",
    EMPLOYEE_NAME: "Nadia Islam",
    BU_ID: "2",
    BUSINESS_UNIT: "Factory Unit",
    DEPT_ID: "2",
    DEPARTMENT: "Engineering",
    DESIGNATION_ID: "2",
    DESIGNATION: "Developer",
    EMP_TYPE_ID: "2",
    EMPLOYEE_TYPE: "Contractual",
  },
  {
    ID: "3",
    EMPLOYEE_NAME: "Touhid Hossain",
    BU_ID: "1",
    BUSINESS_UNIT: "Head Office",
    DEPT_ID: "3",
    DEPARTMENT: "Finance",
    DESIGNATION_ID: "3",
    DESIGNATION: "Accountant",
    EMP_TYPE_ID: "3",
    EMPLOYEE_TYPE: "Project Based",
  },
];

export const temporaryLeaveApplicationCategories = [
  { value: "1", label: "Annual Leave", balance: "18" },
  { value: "2", label: "Casual Leave", balance: "10" },
  { value: "3", label: "Sick Leave", balance: "12" },
  { value: "4", label: "Maternity Leave", balance: "120" },
];

export const initialLeaveApplicationValues = {
  BU_ID: "",
  BUSINESS_UNIT: "",
  EMPLOYEE_ID: "",
  DEPT_ID: "",
  DEPARTMENT: "",
  DESIGNATION_ID: "",
  DESIGNATION: "",
  EMP_TYPE_ID: "",
  EMPLOYEE_TYPE: "",
  FROM_DATE: "",
  TO_DATE: "",
  LEAVE_CATEGORY_ID: "",
  TOTAL_LEAVE_DAYS: "",
  LEAVE_BALANCE: "",
  SUPPORTING_DOCUMENT: null,
  REASON: "",
  STATUS: "1",
};

export const createInitialLeaveApplicationValues = () => ({
  ...initialLeaveApplicationValues,
});

export function validateLeaveApplication(values) {
  const normalizedValues = {
    ...values,
    BU_ID: String(values.BU_ID ?? "").trim(),
    BUSINESS_UNIT: String(values.BUSINESS_UNIT ?? "").trim(),
    EMPLOYEE_ID: String(values.EMPLOYEE_ID ?? "").trim(),
    DEPT_ID: String(values.DEPT_ID ?? "").trim(),
    DEPARTMENT: String(values.DEPARTMENT ?? "").trim(),
    DESIGNATION_ID: String(values.DESIGNATION_ID ?? "").trim(),
    DESIGNATION: String(values.DESIGNATION ?? "").trim(),
    EMP_TYPE_ID: String(values.EMP_TYPE_ID ?? "").trim(),
    EMPLOYEE_TYPE: String(values.EMPLOYEE_TYPE ?? "").trim(),
    FROM_DATE: String(values.FROM_DATE ?? "").trim(),
    TO_DATE: String(values.TO_DATE ?? "").trim(),
    LEAVE_CATEGORY_ID: String(values.LEAVE_CATEGORY_ID ?? "").trim(),
    TOTAL_LEAVE_DAYS: String(values.TOTAL_LEAVE_DAYS ?? "").trim(),
    LEAVE_BALANCE: String(values.LEAVE_BALANCE ?? "").trim(),
    SUPPORTING_DOCUMENT: values.SUPPORTING_DOCUMENT ?? null,
    REASON: String(values.REASON ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  [
    ["BU_ID", "Business Unit"],
    ["EMPLOYEE_ID", "Employee"],
    ["DEPT_ID", "Department"],
    ["DESIGNATION_ID", "Designation"],
    ["EMP_TYPE_ID", "Employee Type"],
    ["FROM_DATE", "From Date"],
    ["TO_DATE", "To Date"],
    ["LEAVE_CATEGORY_ID", "Leave Category"],
    ["TOTAL_LEAVE_DAYS", "Total Leave Days"],
    ["REASON", "Reason"],
  ].forEach(([key, label]) => {
    if (!normalizedValues[key]) errors[key] = `${label} is required.`;
  });

  if (
    normalizedValues.FROM_DATE &&
    normalizedValues.TO_DATE &&
    normalizedValues.TO_DATE < normalizedValues.FROM_DATE
  ) {
    errors.TO_DATE = "To Date must be on or after From Date.";
  }

  if (
    normalizedValues.TOTAL_LEAVE_DAYS &&
    (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValues.TOTAL_LEAVE_DAYS) ||
      Number(normalizedValues.TOTAL_LEAVE_DAYS) <= 0)
  ) {
    errors.TOTAL_LEAVE_DAYS = "Total Leave Days must be greater than 0.";
  }

  if (normalizedValues.REASON.length > 500) {
    errors.REASON = "Reason must not exceed 500 characters.";
  }

  const document = normalizedValues.SUPPORTING_DOCUMENT;
  if (document) {
    if (!LEAVE_APPLICATION_ALLOWED_FILE_TYPES.includes(document.type)) {
      errors.SUPPORTING_DOCUMENT = "Upload a PDF, JPG, JPEG, or PNG file.";
    } else if (document.size > LEAVE_APPLICATION_MAX_FILE_SIZE) {
      errors.SUPPORTING_DOCUMENT = "Supporting Document must not exceed 2 MB.";
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
