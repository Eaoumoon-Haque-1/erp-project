/**
 * @file Backend-facing data contract and client validation for Business Unit.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const BUSINESS_UNIT_TABLE = "HR_BU";

export const temporaryBusinessGroup = {
  ID: "1",
  GROUP_NAME: "Demo Business Group",
};

export const temporaryBusinessUnits = [
  {
    ID: "1",
    BG_ID: "1",
    BUSINESS_UNIT: "Head Office",
    ADDRESS: "Dhaka, Bangladesh",
    E_MAIL: "headoffice@example.com",
    MOBILE_NO: "01712345678",
    WEB_ADDRESS: "https://headoffice.example.com",
    REPORT_HEADER: "Head Office Management",
    REPORT_FOOTER: "Operational Excellence",
    STATUS: "1",
  },
  {
    ID: "2",
    BG_ID: "1",
    BUSINESS_UNIT: "Factory Unit",
    ADDRESS: "Chattogram, Bangladesh",
    E_MAIL: "factory@example.com",
    MOBILE_NO: "01812345678",
    WEB_ADDRESS: "https://factory.example.com",
    REPORT_HEADER: "Factory Unit Management",
    REPORT_FOOTER: "Production & Supply",
    STATUS: "1",
  },
];

export const initialBusinessUnitValues = {
  BG_ID: temporaryBusinessGroup.ID,
  BUSINESS_UNIT: "",
  ADDRESS: "",
  E_MAIL: "",
  MOBILE_NO: "",
  WEB_ADDRESS: "",
  BU_LOGO: null,
  REPORT_HEADER: "",
  REPORT_FOOTER: "",
  STATUS: "1",
};

const acceptedLogoTypes = ["image/jpeg", "image/png", "image/svg+xml"];

export function validateBusinessUnit(
  values,
  existingUnitNames = [],
  existingEmails = [],
) {
  const normalizedValues = {
    ...values,
    BG_ID: String(values.BG_ID ?? "").trim(),
    BUSINESS_UNIT: values.BUSINESS_UNIT.trim(),
    ADDRESS: values.ADDRESS.trim(),
    E_MAIL: values.E_MAIL.trim(),
    MOBILE_NO: values.MOBILE_NO.trim(),
    WEB_ADDRESS: values.WEB_ADDRESS.trim(),
    REPORT_HEADER: values.REPORT_HEADER.trim(),
    REPORT_FOOTER: values.REPORT_FOOTER.trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = "Business Group is required.";
  }

  if (!normalizedValues.BUSINESS_UNIT) {
    errors.BUSINESS_UNIT = "Unit Name is required.";
  } else if (normalizedValues.BUSINESS_UNIT.length < 2) {
    errors.BUSINESS_UNIT = "Unit Name must be at least 2 characters.";
  } else if (normalizedValues.BUSINESS_UNIT.length > 100) {
    errors.BUSINESS_UNIT = "Unit Name must not exceed 100 characters.";
  } else if (
    existingUnitNames.some(
      (name) =>
        String(name).trim().toLowerCase() ===
        normalizedValues.BUSINESS_UNIT.toLowerCase(),
    )
  ) {
    errors.BUSINESS_UNIT = "Unit Name must be unique.";
  }

  if (!normalizedValues.ADDRESS) {
    errors.ADDRESS = "Address is required.";
  } else if (normalizedValues.ADDRESS.length > 500) {
    errors.ADDRESS = "Address must not exceed 500 characters.";
  }

  if (!normalizedValues.E_MAIL) {
    errors.E_MAIL = "Email is required.";
  } else if (normalizedValues.E_MAIL.length > 150) {
    errors.E_MAIL = "Email must not exceed 150 characters.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValues.E_MAIL)) {
    errors.E_MAIL = "Enter a valid email address.";
  } else if (
    existingEmails.some(
      (email) =>
        String(email).trim().toLowerCase() ===
        normalizedValues.E_MAIL.toLowerCase(),
    )
  ) {
    errors.E_MAIL = "Email must be unique.";
  }

  if (!normalizedValues.MOBILE_NO) {
    errors.MOBILE_NO = "Mobile No is required.";
  } else if (!/^01[3-9]\d{8}$/.test(normalizedValues.MOBILE_NO)) {
    errors.MOBILE_NO = "Enter a valid 11-digit Bangladesh mobile number.";
  }

  if (normalizedValues.WEB_ADDRESS) {
    try {
      const url = new URL(normalizedValues.WEB_ADDRESS);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.WEB_ADDRESS = "Web Address must begin with http:// or https://.";
    }
  }

  if (normalizedValues.BU_LOGO) {
    if (!acceptedLogoTypes.includes(normalizedValues.BU_LOGO.type)) {
      errors.BU_LOGO = "Logo must be a JPG, JPEG, PNG, or SVG image.";
    } else if (normalizedValues.BU_LOGO.size > 2 * 1024 * 1024) {
      errors.BU_LOGO = "Logo must not exceed 2 MB.";
    }
  }

  if (normalizedValues.REPORT_HEADER.length > 500) {
    errors.REPORT_HEADER = "Report Header must not exceed 500 characters.";
  }

  if (normalizedValues.REPORT_FOOTER.length > 500) {
    errors.REPORT_FOOTER = "Report Footer must not exceed 500 characters.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
