/**
 * @file Backend-facing data contract and client validation for Assign Empl BU User.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const ASSIGN_EMPL_BU_USER_TABLE = "USERS_EMPL_MAP";

export const temporaryAssignBusinessGroup = {
  ID: "1",
  GROUP_NAME: "Demo Business Group",
};

export const mockBusinessUnitOptions = [
  { value: "1", label: "Head Office" },
  { value: "2", label: "Factory Unit" },
  { value: "3", label: "Regional Office" },
];

export const mockDepartmentOptions = [
  { value: "1", label: "Human Resources" },
  { value: "2", label: "Software & IT" },
  { value: "3", label: "Accounts & Finance" },
  { value: "4", label: "Administration" },
];

export const mockDesignationOptions = [
  { value: "1", label: "HR Executive" },
  { value: "2", label: "Software Engineer" },
  { value: "3", label: "Senior Accountant" },
  { value: "4", label: "Administrative Officer" },
];

export const mockUserOptions = [
  { value: "1", label: "samira.rahman (Samira Rahman)" },
  { value: "2", label: "tanvir.hasan (Tanvir Hasan)" },
  { value: "3", label: "eaoumoon.haque (Md. Eaoumoon Haque)" },
];

export const mockEmployeeListOptions = [
  { value: "101", code: "EMP-0101", name: "Samira Rahman", label: "Samira Rahman (EMP-0101)" },
  { value: "102", code: "EMP-0102", name: "Tanvir Hasan", label: "Tanvir Hasan (EMP-0102)" },
  { value: "103", code: "EMP-0103", name: "Md. Eaoumoon Haque", label: "Md. Eaoumoon Haque (EMP-0103)" },
  { value: "104", code: "EMP-0104", name: "Sultana Razia", label: "Sultana Razia (EMP-0104)" },
];

export const initialAssignEmplBuUserValues = {
  BG_ID: temporaryAssignBusinessGroup.ID,
  BU_ID: "",
  DEPT_ID: "",
  DESIG_ID: "",
  USER_ID: "",
};

export function validateAssignEmplBuUser(values, employeeRows = [], buRows = []) {
  const normalizedValues = {
    ...values,
    BG_ID: String(values.BG_ID ?? "").trim(),
    BU_ID: String(values.BU_ID ?? "").trim(),
    DEPT_ID: String(values.DEPT_ID ?? "").trim(),
    DESIG_ID: String(values.DESIG_ID ?? "").trim(),
    USER_ID: String(values.USER_ID ?? "").trim(),
  };

  const errors = {};

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = "Business Unit is required.";
  }
  if (!normalizedValues.DEPT_ID) {
    errors.DEPT_ID = "Department is required.";
  }
  if (!normalizedValues.DESIG_ID) {
    errors.DESIG_ID = "Designation is required.";
  }
  if (!normalizedValues.USER_ID) {
    errors.USER_ID = "User Name selection is required.";
  }

  if (employeeRows.length === 0 && buRows.length === 0) {
    errors.GENERAL = "Please assign at least one Employee or Business Unit.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
