/**
 * @file Create-page controller for Leave Allocation.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import LeaveAllocationForm from "../components/LeaveAllocationForm";
import {
  LEAVE_ALLOCATION_TABLE,
  createInitialLeaveAllocationValues,
  validateLeaveAllocation,
} from "../validation/leaveAllocationValidation";

const listPath = "/hris/leave-settings/leave-allocation";

function LeaveAllocationCreate() {
  const navigate = useNavigate();
  const firstFieldRef = useRef(null);
  const [values, setValues] = useState(createInitialLeaveAllocationValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? (checked ? "1" : "0") : value;
    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateLeaveAllocation(values);
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
    setValues(createInitialLeaveAllocationValues());
    setErrors({});
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  };

  return (
    <FormPage
      title={"Leave Allocation Create"}
      listTo={listPath}
      tableName={LEAVE_ALLOCATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <LeaveAllocationForm
        values={values}
        errors={errors}
        firstFieldRef={firstFieldRef}
        onChange={handleChange}
      />
    </FormPage>
  );
}

export default LeaveAllocationCreate;
