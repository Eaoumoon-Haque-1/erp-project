/**
 * @file Backend-facing data contract and client validation for Office Notice.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const OFFICE_NOTICE_TABLE = "HR_OFFICE_NOTICE";

export const temporaryOfficeNoticeBusinessUnits = [
  { ID: "1", BUSINESS_UNIT: "Head Office" },
  { ID: "2", BUSINESS_UNIT: "Factory Unit" },
  { ID: "3", BUSINESS_UNIT: "Sales Office" },
];

export const initialOfficeNoticeValues = {
  BG_ID: "",
  TITLE: "",
  PUBLISH_DATE: "",
  EXPIRE_DATE: "",
  ATTACHMENT: "",
  IS_IMPORTANT: "0",
  DESCRIPTION: "",
  STATUS: "1",
};

export const createInitialOfficeNoticeValues = () => ({
  ...initialOfficeNoticeValues,
});

export function validateOfficeNotice(values) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? "").trim(),
    TITLE: String(values.TITLE ?? "").trim(),
    PUBLISH_DATE: String(values.PUBLISH_DATE ?? "").trim(),
    EXPIRE_DATE: String(values.EXPIRE_DATE ?? "").trim(),
    ATTACHMENT: String(values.ATTACHMENT ?? "").trim(),
    IS_IMPORTANT: String(values.IS_IMPORTANT) === "1" ? "1" : "0",
    DESCRIPTION: String(values.DESCRIPTION ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const errors = {};

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = "Business Unit is required.";
  }
  if (!normalizedValues.TITLE) {
    errors.TITLE = "Title is required.";
  }
  if (!normalizedValues.PUBLISH_DATE) {
    errors.PUBLISH_DATE = "Publish Date is required.";
  }
  if (!normalizedValues.EXPIRE_DATE) {
    errors.EXPIRE_DATE = "Expire Date is required.";
  } else if (
    normalizedValues.PUBLISH_DATE &&
    normalizedValues.EXPIRE_DATE < normalizedValues.PUBLISH_DATE
  ) {
    errors.EXPIRE_DATE = "Expire Date must be on or after Publish Date.";
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
