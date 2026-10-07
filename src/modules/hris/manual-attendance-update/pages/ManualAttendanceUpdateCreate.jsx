/**
 * @file Create-page controller for Manual Attendance Update.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import ManualAttendanceUpdateForm from "../components/ManualAttendanceUpdateForm";
import {
  MANUAL_ATTENDANCE_UPDATE_TABLE,
  createInitialManualAttendanceUpdateValues,
  temporaryManualAttendanceBusinessUnits,
  temporaryManualAttendanceDepartments,
  temporaryManualAttendanceDesignations,
  temporaryManualAttendanceShifts,
  validateManualAttendanceUpdate,
} from "../validation/manualAttendanceUpdateValidation";

const listPath = "/hris/hris-forms/manual-attendance-update";

function ManualAttendanceUpdateCreate() {
  const navigate = useNavigate();
  const businessUnitRef = useRef(null);
  const [values, setValues] = useState(
    createInitialManualAttendanceUpdateValues,
  );
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? (checked ? "1" : "0") : value;

    setValues((current) => {
      const next = { ...current, [name]: nextValue };
      if (name === "BU_ID") {
        next.DEPT_ID = "";
        next.DESIG_ID = "";
        next.SHIFT_ID = "";
      }
      if (name === "DEPT_ID") next.DESIG_ID = "";
      return next;
    });

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === "BU_ID" && {
        DEPT_ID: undefined,
        DESIG_ID: undefined,
        SHIFT_ID: undefined,
      }),
      ...(name === "DEPT_ID" && { DESIG_ID: undefined }),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateManualAttendanceUpdate(values);
    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    navigate(listPath);
  };

  const handleReset = () => {
    setValues(createInitialManualAttendanceUpdateValues());
    setErrors({});
    requestAnimationFrame(() => businessUnitRef.current?.focus());
  };

  return (
    <FormPage
      title={"Manual Attendance Update Create"}
      listTo={listPath}
      tableName={MANUAL_ATTENDANCE_UPDATE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <ManualAttendanceUpdateForm
        values={values}
        errors={errors}
        businessUnits={temporaryManualAttendanceBusinessUnits}
        departments={temporaryManualAttendanceDepartments}
        designations={temporaryManualAttendanceDesignations}
        shifts={temporaryManualAttendanceShifts}
        businessUnitRef={businessUnitRef}
        onChange={handleChange}
      />
    </FormPage>
  );
}

export default ManualAttendanceUpdateCreate;
