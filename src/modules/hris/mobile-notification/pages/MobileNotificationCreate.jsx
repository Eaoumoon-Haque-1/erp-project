/**
 * @file Create-page controller for Mobile Notification.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import MobileNotificationForm from "../components/MobileNotificationForm";
import {
  MOBILE_NOTIFICATION_TABLE,
  createInitialMobileNotificationValues,
  temporaryMobileNotificationBusinessUnits,
  temporaryMobileNotificationDepartments,
  temporaryMobileNotificationEmployees,
  temporaryNotificationTypes,
  validateMobileNotification,
} from "../validation/mobileNotificationValidation";

const listPath = "/hris/hris-forms/mobile-notification";

function MobileNotificationCreate() {
  const navigate = useNavigate();
  const businessUnitRef = useRef(null);
  const [values, setValues] = useState(createInitialMobileNotificationValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? (checked ? "1" : "0") : value;
    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleMultiSelectChange = (name, nextValue) => {
    setValues((current) => {
      const next = { ...current, [name]: nextValue };

      if (name === "BU_ID") {
        const validDepartmentIds = temporaryMobileNotificationDepartments
          .filter((department) => nextValue.includes(department.BU_ID))
          .map((department) => department.ID);
        next.DEPT_ID = current.DEPT_ID.filter((id) =>
          validDepartmentIds.includes(id),
        );

        const validEmployeeIds = temporaryMobileNotificationEmployees
          .filter((employee) => next.DEPT_ID.includes(employee.DEPT_ID))
          .map((employee) => employee.ID);
        next.EMPL_ID = current.EMPL_ID.filter((id) =>
          validEmployeeIds.includes(id),
        );
      }

      if (name === "DEPT_ID") {
        const validEmployeeIds = temporaryMobileNotificationEmployees
          .filter((employee) => nextValue.includes(employee.DEPT_ID))
          .map((employee) => employee.ID);
        next.EMPL_ID = current.EMPL_ID.filter((id) =>
          validEmployeeIds.includes(id),
        );
      }

      return next;
    });

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === "BU_ID" && {
        DEPT_ID: undefined,
        EMPL_ID: undefined,
      }),
      ...(name === "DEPT_ID" && { EMPL_ID: undefined }),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateMobileNotification(values);
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
    setValues(createInitialMobileNotificationValues());
    setErrors({});
    requestAnimationFrame(() => businessUnitRef.current?.focus());
  };

  return (
    <FormPage
      title={"Mobile Notification Create"}
      listTo={listPath}
      tableName={MOBILE_NOTIFICATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <MobileNotificationForm
        values={values}
        errors={errors}
        businessUnits={temporaryMobileNotificationBusinessUnits}
        departments={temporaryMobileNotificationDepartments}
        employees={temporaryMobileNotificationEmployees}
        notificationTypes={temporaryNotificationTypes}
        businessUnitRef={businessUnitRef}
        onChange={handleChange}
        onMultiSelectChange={handleMultiSelectChange}
      />
    </FormPage>
  );
}

export default MobileNotificationCreate;
