/**
 * @file Backend-facing data contract and client validation for Degree Education Mapping.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DEGREE_TABLE = "HR_DEGREE";

export const initialDegreeEntryValues = {
  DEGREE_NAME: "",
  SHORT_NAME: "",
  SORT_ORDER: "",
  STATUS: "1",
};

function normalizeDegreeEntry(values) {
  return {
    DEGREE_NAME: String(values.DEGREE_NAME ?? "").trim(),
    SHORT_NAME: String(values.SHORT_NAME ?? "").trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
}

export function validateDegreeEntry(values, rows = []) {
  const normalizedValues = normalizeDegreeEntry(values);
  const errors = {};

  if (!normalizedValues.DEGREE_NAME) {
    errors.DEGREE_NAME = "Degree Name is required.";
  } else if (normalizedValues.DEGREE_NAME.length < 2) {
    errors.DEGREE_NAME = "Degree Name must be at least 2 characters.";
  } else if (normalizedValues.DEGREE_NAME.length > 50) {
    errors.DEGREE_NAME = "Degree Name must not exceed 50 characters.";
  } else if (
    rows.some(
      (row) =>
        row.DEGREE_NAME.trim().toLowerCase() ===
        normalizedValues.DEGREE_NAME.toLowerCase(),
    )
  ) {
    errors.DEGREE_NAME = "This Degree Name has already been added.";
  }

  if (normalizedValues.SHORT_NAME && normalizedValues.SHORT_NAME.length < 2) {
    errors.SHORT_NAME = "Short Name must be at least 2 characters.";
  } else if (normalizedValues.SHORT_NAME.length > 5) {
    errors.SHORT_NAME = "Short Name must not exceed 5 characters.";
  }

  if (normalizedValues.SORT_ORDER) {
    const sortOrder = Number(normalizedValues.SORT_ORDER);
    if (!Number.isFinite(sortOrder)) {
      errors.SORT_ORDER = "Sort Order must be a valid number.";
    } else if (sortOrder <= 0) {
      errors.SORT_ORDER = "Sort Order must be greater than 0.";
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function validateDegreeSubmission(levelOfEducationId, rows) {
  const errors = {};
  const normalizedLevelId = String(levelOfEducationId ?? "").trim();

  if (!normalizedLevelId) {
    errors.LEVEL_OF_EDU_ID = "Level of Education is required.";
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    errors.DEGREES = "Add at least one Degree.";
  }

  return {
    levelOfEducationId: normalizedLevelId,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
