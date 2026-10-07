/**
 * @file Create-page controller for Office Calendar.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import OfficeCalendarForm from "../components/OfficeCalendarForm";
import {
  OFFICE_CALENDAR_TABLE,
  createInitialOfficeCalendarValues,
  createOfficeCalendarRows,
  officeCalendarMonthOptions,
  temporaryOfficeCalendarBusinessUnits,
  temporaryOfficeCalendarEventTypes,
  validateOfficeCalendar,
} from "../validation/officeCalendarValidation";

const listPath = "/hris/attendance-settings/office-calendar";

function OfficeCalendarCreate() {
  const navigate = useNavigate();
  const businessUnitRef = useRef(null);
  const [values, setValues] = useState(createInitialOfficeCalendarValues);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue =
      name === "YEAR"
        ? value.replace(/\D/g, "").slice(0, 4)
        : type === "checkbox"
          ? checked
            ? "1"
            : "0"
          : value;

    setValues((current) => {
      const next = { ...current, [name]: nextValue };
      if (name === "YEAR" || name === "MONTH_ID") {
        setRows(createOfficeCalendarRows(next.YEAR, next.MONTH_ID));
        setRowErrors({});
      }
      return next;
    });
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...((name === "YEAR" || name === "MONTH_ID") && {
        DETAILS: undefined,
      }),
    }));
  };

  const handleBusinessUnitChange = (name, nextValue) => {
    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleRowChange = (date, field, value) => {
    setRows((current) =>
      current.map((row) =>
        row.CALENDER_DATE === date ? { ...row, [field]: value } : row,
      ),
    );
    setRowErrors((current) => {
      const nextRowErrors = { ...(current[date] ?? {}), [field]: undefined };
      return { ...current, [date]: nextRowErrors };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateOfficeCalendar(values, rows);
    setValues(result.values);
    setRows(result.rows);
    setErrors(result.errors);
    setRowErrors(result.rowErrors);

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    navigate(listPath);
  };

  const handleReset = () => {
    setValues(createInitialOfficeCalendarValues());
    setRows([]);
    setErrors({});
    setRowErrors({});
    requestAnimationFrame(() => businessUnitRef.current?.focus());
  };

  return (
    <FormPage
      title={"Office Calendar Create"}
      listTo={listPath}
      tableName={OFFICE_CALENDAR_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <OfficeCalendarForm
        values={values}
        rows={rows}
        errors={errors}
        rowErrors={rowErrors}
        businessUnits={temporaryOfficeCalendarBusinessUnits}
        months={officeCalendarMonthOptions}
        eventTypes={temporaryOfficeCalendarEventTypes}
        businessUnitRef={businessUnitRef}
        onChange={handleChange}
        onBusinessUnitChange={handleBusinessUnitChange}
        onRowChange={handleRowChange}
      />
    </FormPage>
  );
}

export default OfficeCalendarCreate;
