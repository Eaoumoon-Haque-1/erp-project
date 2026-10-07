/**
 * @file Create-page controller for Shift.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import ShiftForm from "../components/ShiftForm";
import {
  SHIFT_TABLE,
  createInitialShiftValues,
  temporaryShiftBusinessUnits,
  validateShift,
} from "../validation/shiftValidation";

function ShiftCreate() {
  const navigate = useNavigate();
  const shiftTitleRef = useRef(null);
  const [values, setValues] = useState(createInitialShiftValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    if (!event || !event.target) return;
    const { name, type, value, checked } = event.target;
    let nextValue = value;
    if (type === "checkbox" && typeof checked === "boolean" && name !== "WEEKEND_DAYS") {
      nextValue = checked ? "1" : "0";
    }
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "APPLY_LATE_IN" && nextValue === "0"
        ? {
            LATE_IN_DAYS: "",
            LATE_IN_DEDUCTION: "",
          }
        : {}),
      ...(name === "APPLY_EARLY_OUT" && nextValue === "0"
        ? {
            EARLY_OUT_DAYS: "",
            EARLY_OUT_DEDUCTION: "",
          }
        : {}),
      ...(name === "ATTN_IN_OUT_POLICY" && nextValue === "0"
        ? {
            START_BEFORE: "",
            CLOSE_AFTER: "",
            IN_TIME_START: "",
            IN_TIME_CLOSE: "",
            OUT_TIME_START: "",
            OUT_TIME_CLOSE: "",
          }
        : {}),
      ...(name === "NOT_ALLOW_ATTN" && nextValue === "0"
        ? { NOT_ALLOW_ATTN_AFTER_MINUTES: "" }
        : {}),
      ...(name === "ALLOW_OVERTIME" && nextValue === "0"
        ? { MAX_OT_HOUR: "", EXTRA_OT_HOUR: "" }
        : {}),
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === "APPLY_LATE_IN"
        ? {
            LATE_IN_DAYS: undefined,
            LATE_IN_DEDUCTION: undefined,
          }
        : {}),
      ...(name === "APPLY_EARLY_OUT"
        ? {
            EARLY_OUT_DAYS: undefined,
            EARLY_OUT_DEDUCTION: undefined,
          }
        : {}),
      ...(name === "ATTN_IN_OUT_POLICY"
        ? {
            START_BEFORE: undefined,
            CLOSE_AFTER: undefined,
            IN_TIME_START: undefined,
            IN_TIME_CLOSE: undefined,
            OUT_TIME_START: undefined,
            OUT_TIME_CLOSE: undefined,
          }
        : {}),
      ...(name === "NOT_ALLOW_ATTN"
        ? { NOT_ALLOW_ATTN_AFTER_MINUTES: undefined }
        : {}),
      ...(name === "ALLOW_OVERTIME"
        ? { MAX_OT_HOUR: undefined, EXTRA_OT_HOUR: undefined }
        : {}),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateShift(values);

    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector("[aria-invalid=true]")?.focus(),
      );
      return;
    }

    navigate("/hris/attendance-settings/shift");
  };

  const handleReset = () => {
    setValues(createInitialShiftValues());
    setErrors({});
    requestAnimationFrame(() => shiftTitleRef.current?.focus());
  };

  return (
    <FormPage
      title={"Shift Create"}
      listTo={"/hris/attendance-settings/shift"}
      tableName={SHIFT_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <ShiftForm
        values={values}
        errors={errors}
        businessUnits={temporaryShiftBusinessUnits}
        onChange={handleChange}
        shiftTitleRef={shiftTitleRef}
      />
    </FormPage>
  );
}

export default ShiftCreate;
