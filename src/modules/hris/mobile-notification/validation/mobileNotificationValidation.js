/**
 * @file Backend-facing data contract and client validation for Mobile Notification.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const MOBILE_NOTIFICATION_TABLE = "HR_MOBILE_NOTIFICATION";

export const temporaryMobileNotificationBusinessUnits = [
  { ID: "1", BUSINESS_UNIT: "Head Office" },
  { ID: "2", BUSINESS_UNIT: "Factory Unit" },
  { ID: "3", BUSINESS_UNIT: "Sales Office" },
];

export const temporaryMobileNotificationDepartments = [
  { ID: "1", BU_ID: "1", DEPARTMENT: "HR" },
  { ID: "2", BU_ID: "1", DEPARTMENT: "Finance" },
  { ID: "3", BU_ID: "2", DEPARTMENT: "Engineering" },
  { ID: "4", BU_ID: "2", DEPARTMENT: "Production" },
  { ID: "5", BU_ID: "3", DEPARTMENT: "Sales" },
];

export const temporaryMobileNotificationEmployees = [
  { ID: "1", DEPT_ID: "1", EMPLOYEE_NAME: "MD Rahman" },
  { ID: "2", DEPT_ID: "1", EMPLOYEE_NAME: "Nadia Islam" },
  { ID: "3", DEPT_ID: "2", EMPLOYEE_NAME: "Touhid Hossain" },
  { ID: "4", DEPT_ID: "3", EMPLOYEE_NAME: "Sadia Akter" },
  { ID: "5", DEPT_ID: "4", EMPLOYEE_NAME: "Jahid Hasan" },
  { ID: "6", DEPT_ID: "5", EMPLOYEE_NAME: "Farzana Karim" },
];

export const temporaryNotificationTypes = [
  { value: "GENERAL", label: "General" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "REMINDER", label: "Reminder" },
  { value: "URGENT", label: "Urgent" },
];

export const initialMobileNotificationValues = {
  BU_ID: [],
  DEPT_ID: [],
  EMPL_ID: [],
  NOTIFICATION_TYPE: "",
  TITLE: "",
  BODY: "",
  STATUS: "1",
};

export const createInitialMobileNotificationValues = () => ({
  ...initialMobileNotificationValues,
  BU_ID: [],
  DEPT_ID: [],
  EMPL_ID: [],
});

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
}

export function validateMobileNotification(values) {
  const normalizedValues = {
    BU_ID: normalizeIds(values.BU_ID),
    DEPT_ID: normalizeIds(values.DEPT_ID),
    EMPL_ID: normalizeIds(values.EMPL_ID),
    NOTIFICATION_TYPE: String(values.NOTIFICATION_TYPE ?? "").trim(),
    TITLE: String(values.TITLE ?? "").trim(),
    BODY: String(values.BODY ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  if (normalizedValues.BU_ID.length === 0) {
    errors.BU_ID = "Business Unit is required.";
  }
  if (normalizedValues.DEPT_ID.length === 0) {
    errors.DEPT_ID = "Department Name is required.";
  }
  if (normalizedValues.EMPL_ID.length === 0) {
    errors.EMPL_ID = "Employee Name is required.";
  }
  if (!normalizedValues.NOTIFICATION_TYPE) {
    errors.NOTIFICATION_TYPE = "Notification Type is required.";
  }
  if (!normalizedValues.TITLE) {
    errors.TITLE = "Title is required.";
  }
  if (!normalizedValues.BODY) {
    errors.BODY = "Body is required.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
