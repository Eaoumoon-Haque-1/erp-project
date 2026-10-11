/**
 * @file Backend-facing data contract and client validation for Assign Role Business Unit.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const BUSINESS_UNIT_ROLE_MAP_TABLE = "BU_ROLE_MAP";

export const temporaryRoleBusinessUnits = [
  {
    ID: "1",
    BG_ID: "1",
    GROUP_NAME: "Cloud ERP Group",
    BUSINESS_UNIT: "Head Office",
    STATUS: "1",
    ROLE_IDS: ["1", "2"],
  },
  {
    ID: "2",
    BG_ID: "1",
    GROUP_NAME: "Cloud ERP Group",
    BUSINESS_UNIT: "Factory Unit",
    STATUS: "1",
    ROLE_IDS: ["3"],
  },
  {
    ID: "3",
    BG_ID: "1",
    GROUP_NAME: "Cloud ERP Group",
    BUSINESS_UNIT: "Regional Office",
    STATUS: "0",
    ROLE_IDS: [],
  },
];

export const temporaryAssignableRoles = [
  { value: "1", label: "Super Admin" },
  { value: "2", label: "HR Manager" },
  { value: "3", label: "Payroll Officer" },
  { value: "4", label: "Employee" },
];

export const createInitialRoleBusinessUnitValues = (
  businessUnitId = "",
  businessGroupId = "",
) => ({
  BG_ID: String(businessGroupId),
  BU_ID: String(businessUnitId),
  ROLE_ID: "",
  STATUS: "1",
});

export function validateRoleBusinessUnitMapping(values, assignedRoles) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? "").trim(),
    BU_ID: String(values.BU_ID ?? "").trim(),
    ROLE_ID: String(values.ROLE_ID ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = "Group Name is required.";
  }
  if (!normalizedValues.BU_ID) {
    errors.BU_ID = "Business Unit is required.";
  }
  if (!Array.isArray(assignedRoles) || assignedRoles.length === 0) {
    errors.ASSIGNED_ROLES = "Add at least one Role.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
