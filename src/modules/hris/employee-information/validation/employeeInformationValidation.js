/**
 * @file Backend-facing data contract and client validation for Employee Information.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const EMPLOYEE_TABLE = "HR_EMPLOYEE";
export const EMPLOYEE_EDUCATION_TABLE = "HR_EMPLOYEE_EDUCATION";
export const EMPLOYEE_TRAINING_TABLE = "HR_EMPLOYEE_TRAINING";
export const EMPLOYEE_CERTIFICATION_TABLE = "HR_EMPLOYEE_CERTIFICATION";
export const EMPLOYEE_JOB_EXPERIENCE_TABLE = "HR_EMPLOYEE_JOB_EXPERIENCE";

let rowSequence = 0;
const rowId = () => `row-${Date.now()}-${(rowSequence += 1)}`;

export const createEducationRow = () => ({
  _ROW_ID: rowId(),
  EDUCATION_LEVEL_ID: "",
  DEGREE_TITLE_ID: "",
  MAJOR_GROUP: "",
  INSTITUTE_NAME: "",
  RESULT: "",
  CGPA_MARKS: "",
  SCALE_MARKS: "",
  YEAR_OF_PASSING: "",
  DURATION: "",
});
export const createTrainingRow = () => ({
  _ROW_ID: rowId(),
  TRAINING_TITLE: "",
  COUNTRY_ID: "Bangladesh",
  TOPICS_COVERED: "",
  TRAINING_YEAR: "",
  INSTITUTE_NAME: "",
  DURATION: "",
  LOCATION: "",
});
export const createCertificationRow = () => ({
  _ROW_ID: rowId(),
  CERTIFICATION: "",
  INSTITUTE_NAME: "",
  LOCATION: "",
  DURATION: "",
});
export const createJobExperienceRow = () => ({
  _ROW_ID: rowId(),
  COMPANY_NAME: "",
  COMPANY_BUSINESS: "",
  DESIGNATION: "",
  DEPARTMENT: "",
  EMPLOYMENT_PERIOD_START_DT: "",
  EMPLOYMENT_PERIOD_END_DT: "",
  CURRENTLY_WORKING: "0",
  RESPONSIBILITIES: "",
});

export const createInitialEmployeeValues = () => ({
  BUSINESS_UNIT_ID: "",
  EMPLOYEE_NAME: "",
  EMPLOYEE_ID: "EMP-0001",
  PHOTO: null,
  DEPARTMENT_ID: "",
  DESIGNATION_ID: "",
  EMPLOYMENT_TYPE_ID: "",
  JOINING_DATE: "",
  CONFIRMATION_DATE: "",
  EMPLOYMENT_STATUS: "ACTIVE",
  PROBATIONARY_PERIOD: "",
  NOTICE_PERIOD: "",
  SEPARATION_DATE: "",
  SHIFT_ID: "",
  OFFICE_IN_TIME: "",
  OFFICE_OUT_TIME: "",
  OVERTIME_ALLOWANCE: "NO",
  REPORTING_OFFICER_ID: "",
  FATHER_NAME: "",
  MOTHER_NAME: "",
  SPOUSE_NAME: "",
  DATE_OF_BIRTH: "",
  BIRTH_PLACE: "",
  GENDER_ID: "",
  MARITAL_STATUS: "",
  DATE_OF_MARRIAGE: "",
  RELIGION_ID: "",
  NATIONALITY_ID: "Bangladeshi",
  BLOOD_GROUP: "",
  HIGHEST_EDUCATION_ID: "",
  NID: "",
  PASSPORT_NO: "",
  DRIVING_LICENSE_NO: "",
  NO_OF_CHILD: "0",
  MALE_CHILD: "0",
  FEMALE_CHILD: "0",
  PRESENT_ADDRESS: "",
  PERMANENT_ADDRESS: "",
  THANA:"",
  DISTRICT: "",
  OFFICE_MOBILE_NO: "",
  PERSONAL_MOBILE_NO: "",
  WHATSAPP_NO: "",
  EMERGENCY_MOBILE_NO: "",
  EMAIL: "",
  OFFICE_EMAIL: "",
  DISABILITY_STATUS: "NO",
  DISABILITY_TYPES: "",
  DISABILITY_DETAILS: "",
  HAS_NATIONAL_DISABILITY_ID: "NO",
  NATIONAL_DISABILITY_ID: "",
  education: [createEducationRow()],
  training: [createTrainingRow()],
  certification: [createCertificationRow()],
  jobExperience: [createJobExperienceRow()],
});

const text = (value) => String(value ?? "").trim();
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const isWhole = (value) => /^\d+$/.test(value);
const isPositiveNumber = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0;
const isBangladeshMobile = (value) => /^01[3-9]\d{8}$/.test(text(value));
const isDateRange = (value) => {
  const match = text(value).match(
    /^(\d{4}-\d{2}-\d{2}) - (\d{4}-\d{2}-\d{2})$/,
  );
  if (!match) return false;
  const start = new Date(`${match[1]}T00:00:00`);
  const end = new Date(`${match[2]}T00:00:00`);
  return (
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    end >= start
  );
};
const isBlankRow = (row) =>
  Object.entries(row).every(
    ([key, value]) =>
      key === "_ROW_ID" ||
      (key === "CURRENTLY_WORKING" && value === "0") ||
      text(value) === "",
  );
const required = (errors, key, value, label) => {
  if (!text(value)) errors[key] = `${label} is required.`;
};
const max = (errors, key, value, length, label) => {
  if (text(value).length > length)
    errors[key] = `${label} must not exceed ${length} characters.`;
};
const minMax = (errors, key, value, minLength, maxLength, label) => {
  required(errors, key, value, label);
  if (!errors[key] && text(value).length < minLength)
    errors[key] = `${label} must be at least ${minLength} characters.`;
  if (!errors[key]) max(errors, key, value, maxLength, label);
};
const validatePastDate = (errors, key, value, label) => {
  required(errors, key, value, label);
  if (!errors[key] && value > today())
    errors[key] = `${label} cannot be in the future.`;
};
const validateYear = (errors, key, value, label) => {
  required(errors, key, value, label);
  if (
    !errors[key] &&
    (!/^\d{4}$/.test(value) || Number(value) > new Date().getFullYear())
  )
    errors[key] =
      `Enter a valid ${label.toLowerCase()} not later than the current year.`;
};

function normalizeRows(rows) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    ),
  );
}

function validateEducation(rows) {
  return rows.map((row) => {
    const errors = {};
    if (isBlankRow(row)) return errors;
    required(
      errors,
      "EDUCATION_LEVEL_ID",
      row.EDUCATION_LEVEL_ID,
      "Education Level",
    );
    required(errors, "DEGREE_TITLE_ID", row.DEGREE_TITLE_ID, "Degree Title");
    max(errors, "MAJOR_GROUP", row.MAJOR_GROUP, 150, "Major/Group");
    minMax(
      errors,
      "INSTITUTE_NAME",
      row.INSTITUTE_NAME,
      2,
      200,
      "Institute Name",
    );
    required(errors, "RESULT", row.RESULT, "Result");
    if (row.CGPA_MARKS && Number(row.CGPA_MARKS) < 0)
      errors.CGPA_MARKS = "CGPA/Marks cannot be negative.";
    if (row.SCALE_MARKS && !isPositiveNumber(row.SCALE_MARKS))
      errors.SCALE_MARKS = "Scale/Marks must be greater than 0.";
    validateYear(
      errors,
      "YEAR_OF_PASSING",
      row.YEAR_OF_PASSING,
      "Year of Passing",
    );
    if (row.DURATION && !isPositiveNumber(row.DURATION))
      errors.DURATION = "Duration must be greater than 0.";
    return errors;
  });
}

function validateTraining(rows) {
  return rows.map((row) => {
    const errors = {};
    if (isBlankRow(row)) return errors;
    minMax(
      errors,
      "TRAINING_TITLE",
      row.TRAINING_TITLE,
      2,
      200,
      "Training Title",
    );
    required(errors, "COUNTRY_ID", row.COUNTRY_ID, "Country");
    required(errors, "TOPICS_COVERED", row.TOPICS_COVERED, "Topics Covered");
    max(errors, "TOPICS_COVERED", row.TOPICS_COVERED, 500, "Topics Covered");
    validateYear(errors, "TRAINING_YEAR", row.TRAINING_YEAR, "Training Year");
    minMax(
      errors,
      "INSTITUTE_NAME",
      row.INSTITUTE_NAME,
      2,
      200,
      "Institute Name",
    );
    required(errors, "DURATION", row.DURATION, "Duration");
    if (!errors.DURATION && !isPositiveNumber(row.DURATION))
      errors.DURATION = "Duration must be greater than 0.";
    required(errors, "LOCATION", row.LOCATION, "Location");
    max(errors, "LOCATION", row.LOCATION, 150, "Location");
    return errors;
  });
}

function validateCertification(rows) {
  return rows.map((row) => {
    const errors = {};
    if (isBlankRow(row)) return errors;
    minMax(errors, "CERTIFICATION", row.CERTIFICATION, 2, 200, "Certification");
    minMax(
      errors,
      "INSTITUTE_NAME",
      row.INSTITUTE_NAME,
      2,
      200,
      "Institute Name",
    );
    required(errors, "LOCATION", row.LOCATION, "Location");
    max(errors, "LOCATION", row.LOCATION, 150, "Location");
    required(errors, "DURATION", row.DURATION, "Duration");
    if (!errors.DURATION && !isDateRange(row.DURATION))
      errors.DURATION = "Select a valid certification date range.";
    return errors;
  });
}

function validateJobExperience(rows) {
  return rows.map((row) => {
    const errors = {};
    if (isBlankRow(row)) return errors;
    minMax(errors, "COMPANY_NAME", row.COMPANY_NAME, 2, 200, "Company Name");
    minMax(
      errors,
      "COMPANY_BUSINESS",
      row.COMPANY_BUSINESS,
      2,
      200,
      "Company Business",
    );
    required(errors, "DESIGNATION", row.DESIGNATION, "Designation");
    max(errors, "DESIGNATION", row.DESIGNATION, 150, "Designation");
    required(errors, "DEPARTMENT", row.DEPARTMENT, "Department");
    max(errors, "DEPARTMENT", row.DEPARTMENT, 200, "Department");
    required(
      errors,
      "EMPLOYMENT_PERIOD_START_DT",
      row.EMPLOYMENT_PERIOD_START_DT,
      "Employment Start Date",
    );
    if (row.EMPLOYMENT_PERIOD_START_DT > today())
      errors.EMPLOYMENT_PERIOD_START_DT =
        "Employment Start Date cannot be in the future.";
    if (row.CURRENTLY_WORKING !== "1")
      required(
        errors,
        "EMPLOYMENT_PERIOD_END_DT",
        row.EMPLOYMENT_PERIOD_END_DT,
        "Employment End Date",
      );
    if (
      row.EMPLOYMENT_PERIOD_END_DT &&
      row.EMPLOYMENT_PERIOD_END_DT < row.EMPLOYMENT_PERIOD_START_DT
    )
      errors.EMPLOYMENT_PERIOD_END_DT =
        "Employment End Date must be on or after the start date.";
    max(
      errors,
      "RESPONSIBILITIES",
      row.RESPONSIBILITIES,
      500,
      "Responsibilities",
    );
    return errors;
  });
}

export function validateEmployeeInformation(inputValues) {
  const values = {
    ...inputValues,
    ...Object.fromEntries(
      Object.entries(inputValues)
        .filter(([, value]) => typeof value === "string")
        .map(([key, value]) => [key, value.trim()]),
    ),
    education: normalizeRows(inputValues.education),
    training: normalizeRows(inputValues.training),
    certification: normalizeRows(inputValues.certification),
    jobExperience: normalizeRows(inputValues.jobExperience),
  };
  const fields = {};
  if (values.DISABILITY_STATUS !== "YES") {
    values.DISABILITY_TYPES = "";
    values.DISABILITY_DETAILS = "";
    values.HAS_NATIONAL_DISABILITY_ID = "NO";
    values.NATIONAL_DISABILITY_ID = "";
  } else if (values.HAS_NATIONAL_DISABILITY_ID !== "YES") {
    values.NATIONAL_DISABILITY_ID = "";
  }
  [
    ["BUSINESS_UNIT_ID", "Business Unit"],
    ["EMPLOYEE_NAME", "Employee Name"],
    ["EMPLOYEE_ID", "Employee ID"],
    ["DEPARTMENT_ID", "Department"],
    ["DESIGNATION_ID", "Designation"],
    ["EMPLOYMENT_TYPE_ID", "Employment Type"],
    ["JOINING_DATE", "Joining Date"],
    ["EMPLOYMENT_STATUS", "Employment Status"],
    ["PROBATIONARY_PERIOD", "Probationary Period"],
    ["NOTICE_PERIOD", "Notice Period"],
    ["SHIFT_ID", "Shift"],
    ["OFFICE_IN_TIME", "Office In Time"],
    ["OFFICE_OUT_TIME", "Office Out Time"],
    ["OVERTIME_ALLOWANCE", "Overtime Allowance"],
    ["REPORTING_OFFICER_ID", "Reporting Officer"],
    ["FATHER_NAME", "Father's Name"],
    ["MOTHER_NAME", "Mother's Name"],
    ["DATE_OF_BIRTH", "Date of Birth"],
    ["GENDER_ID", "Gender"],
    ["MARITAL_STATUS", "Marital Status"],
    ["RELIGION_ID", "Religion"],
    ["NATIONALITY_ID", "Nationality"],
    ["BLOOD_GROUP", "Blood Group"],
    ["HIGHEST_EDUCATION_ID", "Highest Education"],
    ["NID", "NID"],
    ["NO_OF_CHILD", "No. of Child"],
    ["MALE_CHILD", "Male Child"],
    ["FEMALE_CHILD", "Female Child"],
    // ["PRESENT_ADDRESS", "Present Address"],
    // ["PERMANENT_ADDRESS", "Permanent Address"],
    // ["DISTRICT", "District"],
    // ["THANA", "Thana"],
    // ["OFFICE_MOBILE_NO", "Office Mobile No"],
    // ["PERSONAL_MOBILE_NO", "Personal Mobile No"],
    // ["EMERGENCY_MOBILE_NO", "Emergency Contact"],
    // ["EMAIL", "Personal Email"],
    // ["OFFICE_EMAIL", "Office Email"],
  ].forEach(([key, label]) => required(fields, key, values[key], label));

  if (values.EMPLOYEE_NAME && !/^[\p{L} .'-]+$/u.test(values.EMPLOYEE_NAME))
    fields.EMPLOYEE_NAME =
      "Employee Name may contain letters, spaces, hyphens, apostrophes, and periods only.";
  if (values.EMPLOYEE_NAME && values.EMPLOYEE_NAME.length < 2)
    fields.EMPLOYEE_NAME = "Employee Name must be at least 2 characters.";
  max(fields, "EMPLOYEE_NAME", values.EMPLOYEE_NAME, 150, "Employee Name");
  [
    ["FATHER_NAME", "Father's Name"],
    ["MOTHER_NAME", "Mother's Name"],
  ].forEach(([key, label]) => minMax(fields, key, values[key], 2, 150, label));
  max(fields, "SPOUSE_NAME", values.SPOUSE_NAME, 150, "Spouse Name");
  if (values.MARITAL_STATUS === "Married") {
    required(fields, "SPOUSE_NAME", values.SPOUSE_NAME, "Spouse Name");
    required(
      fields,
      "DATE_OF_MARRIAGE",
      values.DATE_OF_MARRIAGE,
      "Date of Marriage",
    );
  }
  validatePastDate(
    fields,
    "DATE_OF_BIRTH",
    values.DATE_OF_BIRTH,
    "Date of Birth",
  );
  if (values.DATE_OF_MARRIAGE > today())
    fields.DATE_OF_MARRIAGE = "Date of Marriage cannot be in the future.";
  if (
    values.DATE_OF_MARRIAGE &&
    values.DATE_OF_MARRIAGE <= values.DATE_OF_BIRTH
  )
    fields.DATE_OF_MARRIAGE = "Date of Marriage must be after Date of Birth.";
  if (values.JOINING_DATE > today())
    fields.JOINING_DATE = "Joining Date cannot be in the future.";
  if (
    values.CONFIRMATION_DATE &&
    values.CONFIRMATION_DATE < values.JOINING_DATE
  )
    fields.CONFIRMATION_DATE =
      "Confirmation Date must be on or after Joining Date.";
  if (values.EMPLOYMENT_STATUS === "SEPARATED")
    required(
      fields,
      "SEPARATION_DATE",
      values.SEPARATION_DATE,
      "Separation Date",
    );
  if (values.SEPARATION_DATE && values.SEPARATION_DATE < values.JOINING_DATE)
    fields.SEPARATION_DATE =
      "Separation Date must be on or after Joining Date.";
  if (
    values.OFFICE_IN_TIME &&
    values.OFFICE_OUT_TIME &&
    values.OFFICE_OUT_TIME <= values.OFFICE_IN_TIME
  )
    fields.OFFICE_OUT_TIME = "Office Out Time must be after Office In Time.";
  if (
    !isWhole(values.PROBATIONARY_PERIOD) ||
    Number(values.PROBATIONARY_PERIOD) <= 0
  )
    fields.PROBATIONARY_PERIOD =
      "Probationary Period must be a whole number greater than 0.";
  if (!isWhole(values.NOTICE_PERIOD))
    fields.NOTICE_PERIOD = "Notice Period must be a whole number of 0 or more.";
  if (!/^(?:\d{10}|\d{13}|\d{17})$/.test(values.NID))
    fields.NID = "NID must contain 10, 13, or 17 digits.";
  if (values.PASSPORT_NO && !/^[A-Za-z0-9]+$/.test(values.PASSPORT_NO))
    fields.PASSPORT_NO = "Passport No must contain letters and numbers only.";
  max(fields, "PASSPORT_NO", values.PASSPORT_NO, 20, "Passport No");
  if (
    values.DRIVING_LICENSE_NO &&
    !/^[A-Za-z0-9-]+$/.test(values.DRIVING_LICENSE_NO)
  )
    fields.DRIVING_LICENSE_NO =
      "Driving License No contains invalid characters.";
  max(
    fields,
    "DRIVING_LICENSE_NO",
    values.DRIVING_LICENSE_NO,
    30,
    "Driving License No",
  );
  [
    ["NO_OF_CHILD", "No. of Child"],
    ["MALE_CHILD", "Male Child"],
    ["FEMALE_CHILD", "Female Child"],
  ].forEach(([key, label]) => {
    if (!isWhole(values[key]))
      fields[key] = `${label} must be a whole number of 0 or more.`;
  });
  if (
    !fields.NO_OF_CHILD &&
    !fields.MALE_CHILD &&
    !fields.FEMALE_CHILD &&
    Number(values.MALE_CHILD) + Number(values.FEMALE_CHILD) !==
      Number(values.NO_OF_CHILD)
  )
    fields.NO_OF_CHILD =
      "No. of Child must equal Male Child plus Female Child.";
  [
    ["PRESENT_ADDRESS", "Present Address"],
    ["PERMANENT_ADDRESS", "Permanent Address"],
  ].forEach(([key, label]) => minMax(fields, key, values[key], 10, 500, label));
  [
    ["OFFICE_MOBILE_NO", "Office Mobile No"],
    ["PERSONAL_MOBILE_NO", "Personal Mobile No"],
    ["EMERGENCY_MOBILE_NO", "Emergency Contact"],
    ["WHATSAPP_NO", "WhatsApp No"],
  ].forEach(([key, label]) => {
    if (values[key] && !isBangladeshMobile(values[key]))
      fields[key] =
        `${label} must be a valid 11-digit Bangladesh mobile number.`;
  });
  // [
  //   ["RESIDENCE_PHONE", "Residence Phone"],
  //   ["FAX", "Fax"],
  // ].forEach(([key, label]) => {
  //   if (values[key] && !/^[0-9+()\-\s]+$/.test(values[key]))
  //     fields[key] = `${label} contains invalid characters.`;
  // });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.EMAIL))
    fields.EMAIL = "Enter a valid email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.OFFICE_EMAIL))
    fields.OFFICE_EMAIL = "Enter a valid office email address.";
  max(fields, "EMAIL", values.EMAIL, 150, "Email");
  max(fields, "OFFICE_EMAIL", values.OFFICE_EMAIL, 150, "Office Email");
  required(
    fields,
    "DISABILITY_STATUS",
    values.DISABILITY_STATUS,
    "Disability Status",
  );
  if (values.DISABILITY_STATUS === "YES") {
    required(
      fields,
      "DISABILITY_TYPES",
      values.DISABILITY_TYPES,
      "Disability Type",
    );
    required(
      fields,
      "HAS_NATIONAL_DISABILITY_ID",
      values.HAS_NATIONAL_DISABILITY_ID,
      "National Disability ID selection",
    );
    max(
      fields,
      "DISABILITY_DETAILS",
      values.DISABILITY_DETAILS,
      500,
      "Disability Details",
    );
    if (values.HAS_NATIONAL_DISABILITY_ID === "YES") {
      required(
        fields,
        "NATIONAL_DISABILITY_ID",
        values.NATIONAL_DISABILITY_ID,
        "National Disability ID",
      );
      max(
        fields,
        "NATIONAL_DISABILITY_ID",
        values.NATIONAL_DISABILITY_ID,
        50,
        "National Disability ID",
      );
    }
  }
  if (values.PHOTO && !["image/jpeg", "image/png"].includes(values.PHOTO.type))
    fields.PHOTO = "Photo must be a JPG, JPEG, or PNG image.";
  if (values.PHOTO?.size > 2 * 1024 * 1024)
    fields.PHOTO = "Photo must not exceed 2 MB.";

  const errors = {
    fields,
    education: validateEducation(values.education),
    training: validateTraining(values.training),
    certification: validateCertification(values.certification),
    jobExperience: validateJobExperience(values.jobExperience),
  };
  const hasRowErrors = [
    "education",
    "training",
    "certification",
    "jobExperience",
  ].some((key) => errors[key].some((row) => Object.keys(row).length));
  return {
    values,
    errors,
    isValid: Object.keys(fields).length === 0 && !hasRowErrors,
  };
}
