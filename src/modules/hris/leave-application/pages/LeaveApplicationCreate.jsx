/**
 * @file Create-page controller for Leave Application.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import LeaveApplicationForm from "../components/LeaveApplicationForm";
import {
  LEAVE_APPLICATION_TABLE,
  createInitialLeaveApplicationValues,
  temporaryLeaveApplicationCategories,
  temporaryLeaveApplicationEmployees,
  validateLeaveApplication,
} from "../validation/leaveApplicationValidation";

const listPath = "/hris/hris-forms/leave-application";

// Derived values belong in small pure helpers instead of being recalculated in
// the JSX. Replace temporary balance lookup with an API result later.
function calculateLeaveDays(fromDate, toDate) {
  if (!fromDate || !toDate || toDate < fromDate) return "";
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);
  return String(Math.round((end - start) / 86400000) + 1);
}

function getTemporaryLeaveBalance(employeeId, categoryId) {
  if (!employeeId || !categoryId) return "";
  return (
    temporaryLeaveApplicationCategories.find(
      (category) => category.value === categoryId,
    )?.balance ?? ""
  );
}

function LeaveApplicationCreate() {
  const navigate = useNavigate();
  const employeeRef = useRef(null);
  const fileRef = useRef(null);
  const [values, setValues] = useState(createInitialLeaveApplicationValues);
  const [errors, setErrors] = useState({});

  // This handler supports text, switch, and file fields. It also keeps fields
  // derived from dates/category synchronized in the same state update.
  const handleChange = (event) => {
    const { name, type, value, checked, files } = event.target;
    const nextValue =
      type === "checkbox"
        ? checked
          ? "1"
          : "0"
        : type === "file"
          ? files?.[0] ?? null
          : value;

    setValues((current) => {
      const next = { ...current, [name]: nextValue };
      if (name === "FROM_DATE" || name === "TO_DATE") {
        const fromDate = name === "FROM_DATE" ? nextValue : current.FROM_DATE;
        const toDate = name === "TO_DATE" ? nextValue : current.TO_DATE;
        next.TOTAL_LEAVE_DAYS = calculateLeaveDays(fromDate, toDate);
      }
      if (name === "LEAVE_CATEGORY_ID") {
        next.LEAVE_BALANCE = getTemporaryLeaveBalance(
          current.EMPLOYEE_ID,
          nextValue,
        );
      }
      return next;
    });
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...((name === "FROM_DATE" || name === "TO_DATE") && {
        TOTAL_LEAVE_DAYS: undefined,
      }),
    }));
  };

  const handleEmployeeChange = (event) => {
    // Selecting an employee fills related read-only IDs/names. When the API is
    // connected, find the selected item in the loaded employee option data.
    const employee = temporaryLeaveApplicationEmployees.find(
      (item) => item.ID === event.target.value,
    );
    setValues((current) => ({
      ...current,
      EMPLOYEE_ID: employee?.ID ?? "",
      BU_ID: employee?.BU_ID ?? "",
      BUSINESS_UNIT: employee?.BUSINESS_UNIT ?? "",
      DEPT_ID: employee?.DEPT_ID ?? "",
      DEPARTMENT: employee?.DEPARTMENT ?? "",
      DESIGNATION_ID: employee?.DESIGNATION_ID ?? "",
      DESIGNATION: employee?.DESIGNATION ?? "",
      EMP_TYPE_ID: employee?.EMP_TYPE_ID ?? "",
      EMPLOYEE_TYPE: employee?.EMPLOYEE_TYPE ?? "",
      LEAVE_BALANCE: getTemporaryLeaveBalance(
        employee?.ID,
        current.LEAVE_CATEGORY_ID,
      ),
    }));
    setErrors((current) => ({
      ...current,
      EMPLOYEE_ID: undefined,
      BU_ID: undefined,
      DEPT_ID: undefined,
      DESIGNATION_ID: undefined,
      EMP_TYPE_ID: undefined,
    }));
  };

  const saveApplication = (status) => {
    // STATUS is intentionally controlled by the action, not by a visible
    // switch: "0" means Draft and "1" means Submitted.
    const result = validateLeaveApplication({ ...values, STATUS: status });
    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      // Focus the first invalid control after React paints the error classes.
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    // Future API call belongs before this navigation. The backend must enforce
    // applicant-only draft visibility and lock submitted records from edits.
    navigate(listPath);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Submit makes the application active/visible to approvers.
    saveApplication("1");
  };

  const handleDraft = () => {
    // Draft remains inactive and visible only in the applicant's own list.
    saveApplication("0");
  };

  const handleReset = () => {
    setValues(createInitialLeaveApplicationValues());
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
    requestAnimationFrame(() => employeeRef.current?.focus());
  };

  return (
    // Passing onDraft adds the extra button; normal FormPage users omit it.
    <FormPage
      title={"Leave Application Create"}
      listTo={listPath}
      tableName={LEAVE_APPLICATION_TABLE}
      onSubmit={handleSubmit}
      onDraft={handleDraft}
      submitLabel={"Submit"}
      onReset={handleReset}
    >
      <LeaveApplicationForm
        values={values}
        errors={errors}
        employeeRef={employeeRef}
        fileRef={fileRef}
        onChange={handleChange}
        onEmployeeChange={handleEmployeeChange}
      />
    </FormPage>
  );
}

export default LeaveApplicationCreate;
