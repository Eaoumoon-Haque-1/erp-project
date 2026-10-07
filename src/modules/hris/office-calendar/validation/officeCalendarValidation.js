/**
 * @file Backend-facing data contract and client validation for Office Calendar.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const OFFICE_CALENDAR_TABLE = "HR_OFFICE_CALENDER";
export const OFFICE_CALENDAR_DETAILS_TABLE = "HR_OFFICE_CALENDER_DTLS";

export const temporaryOfficeCalendarBusinessUnits = [
  { ID: "1", BUSINESS_UNIT: "Head Office" },
  { ID: "2", BUSINESS_UNIT: "Factory Unit" },
  { ID: "3", BUSINESS_UNIT: "Sales Office" },
];

export const officeCalendarMonthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const temporaryOfficeCalendarEventTypes = [
  { value: "WORKING_DAY", label: "Working Day" },
  { value: "WEEKEND", label: "Weekend" },
  { value: "PUBLIC_HOLIDAY", label: "Public Holiday" },
  { value: "OPTIONAL_HOLIDAY", label: "Optional Holiday" },
  { value: "SPECIAL_WORKING_DAY", label: "Special Working Day" },
];

export const initialOfficeCalendarValues = {
  BU_ID: [],
  YEAR: "",
  MONTH_ID: "",
  STATUS: "1",
};

export const createInitialOfficeCalendarValues = () => ({
  ...initialOfficeCalendarValues,
  BU_ID: [],
});

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function createOfficeCalendarRows(year, month) {
  if (!/^\d{4}$/.test(year) || !/^(?:[1-9]|1[0-2])$/.test(month)) {
    return [];
  }

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const daysInMonth = new Date(numericYear, numericMonth, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(numericYear, numericMonth - 1, day);
    const monthPart = String(numericMonth).padStart(2, "0");
    const dayPart = String(day).padStart(2, "0");

    return {
      ID: "",
      HR_OFFICE_CALENDER_ID: "",
      CALENDER_DATE: `${year}-${monthPart}-${dayPart}`,
      CALENDER_DAY: dayNames[date.getDay()],
      EVENT_TYPE: "",
      REMARKS: "",
      STATUS: "1",
    };
  });
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
}

export function validateOfficeCalendar(values, rows) {
  const normalizedValues = {
    BU_ID: normalizeIds(values.BU_ID),
    YEAR: String(values.YEAR ?? "").trim(),
    MONTH_ID: String(values.MONTH_ID ?? "").trim(),
    STATUS: String(values.STATUS) === "0" ? "0" : "1",
  };
  const normalizedRows = rows.map((row) => ({
    ...row,
    CALENDER_DATE: String(row.CALENDER_DATE ?? "").trim(),
    CALENDER_DAY: String(row.CALENDER_DAY ?? "").trim(),
    EVENT_TYPE: String(row.EVENT_TYPE ?? "").trim(),
    REMARKS: String(row.REMARKS ?? "").trim(),
    STATUS: normalizedValues.STATUS,
  }));
  const errors = {};
  const rowErrors = {};

  if (normalizedValues.BU_ID.length === 0) {
    errors.BU_ID = "Business Unit is required.";
  }
  if (!normalizedValues.YEAR) {
    errors.YEAR = "Year is required.";
  } else if (!/^\d{4}$/.test(normalizedValues.YEAR)) {
    errors.YEAR = "Year must contain exactly 4 digits.";
  }
  if (!normalizedValues.MONTH_ID) {
    errors.MONTH_ID = "Month is required.";
  }
  if (normalizedRows.length === 0) {
    errors.DETAILS = "Select a valid Year and Month to generate the calendar.";
  }

  normalizedRows.forEach((row) => {
    const currentErrors = {};
    if (!row.CALENDER_DATE) currentErrors.CALENDER_DATE = "Date is required.";
    if (!row.CALENDER_DAY) currentErrors.CALENDER_DAY = "Day is required.";
    if (!row.EVENT_TYPE) {
      currentErrors.EVENT_TYPE = "Event Type is required.";
    }
    if (Object.keys(currentErrors).length > 0) {
      rowErrors[row.CALENDER_DATE || String(Object.keys(rowErrors).length)] =
        currentErrors;
    }
  });

  return {
    values: normalizedValues,
    rows: normalizedRows,
    errors,
    rowErrors,
    isValid:
      Object.keys(errors).length === 0 &&
      Object.keys(rowErrors).length === 0,
  };
}
