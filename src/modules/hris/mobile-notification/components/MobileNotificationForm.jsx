/**
 * @file Controlled form presentation for Mobile Notification.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import MultiSelectField from "../../../../components/shared/MultiSelectField";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={"erp-field-error"}>
      {message}
    </p>
  );
}

function fieldClass(error, extra = "") {
  return ["erp-form-control", extra, error ? "erp-form-control-invalid" : ""]
    .filter(Boolean)
    .join(" ");
}

function RequiredLabel({ htmlFor, children }) {
  return (
    <label className={"erp-field-label"} htmlFor={htmlFor}>
      {children}
      <span className={"erp-required"} aria-hidden={"true"}>
        *
      </span>
    </label>
  );
}

function MobileNotificationForm({
  values,
  errors,
  businessUnits,
  departments,
  employees,
  notificationTypes,
  businessUnitRef,
  onChange,
  onMultiSelectChange,
}) {
  const businessUnitOptions = businessUnits.map((unit) => ({
    value: unit.ID,
    label: unit.BUSINESS_UNIT,
  }));
  const departmentOptions = departments
    .filter((department) => values.BU_ID.includes(department.BU_ID))
    .map((department) => ({
      value: department.ID,
      label: department.DEPARTMENT,
    }));
  const employeeOptions = employees
    .filter((employee) => values.DEPT_ID.includes(employee.DEPT_ID))
    .map((employee) => ({
      value: employee.ID,
      label: employee.EMPLOYEE_NAME,
    }));

  return (
    <div className={"erp-form-grid"}>
      <MultiSelectField
        id={"BU_ID"}
        name={"BU_ID"}
        label={"Business Unit"}
        placeholder={"--Select Business Unit--"}
        options={businessUnitOptions}
        value={values.BU_ID}
        error={errors.BU_ID}
        required
        inputRef={businessUnitRef}
        onChange={onMultiSelectChange}
      />

      <MultiSelectField
        id={"DEPT_ID"}
        name={"DEPT_ID"}
        label={"Department Name"}
        placeholder={"--Select Department--"}
        options={departmentOptions}
        value={values.DEPT_ID}
        error={errors.DEPT_ID}
        disabled={values.BU_ID.length === 0}
        required
        onChange={onMultiSelectChange}
      />

      <MultiSelectField
        id={"EMPL_ID"}
        name={"EMPL_ID"}
        label={"Employee Name"}
        placeholder={"--Select Employee--"}
        options={employeeOptions}
        value={values.EMPL_ID}
        error={errors.EMPL_ID}
        disabled={values.DEPT_ID.length === 0}
        required
        onChange={onMultiSelectChange}
      />

      <div>
        <RequiredLabel htmlFor={"NOTIFICATION_TYPE"}>
          Notification Type
        </RequiredLabel>
        <select
          id={"NOTIFICATION_TYPE"}
          name={"NOTIFICATION_TYPE"}
          className={fieldClass(errors.NOTIFICATION_TYPE)}
          value={values.NOTIFICATION_TYPE}
          required
          aria-invalid={Boolean(errors.NOTIFICATION_TYPE)}
          aria-describedby={
            errors.NOTIFICATION_TYPE ? "NOTIFICATION_TYPE-error" : undefined
          }
          onChange={onChange}
        >
          <option value={""}>--Select Notification Type--</option>
          {notificationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <FieldError
          id={"NOTIFICATION_TYPE-error"}
          message={errors.NOTIFICATION_TYPE}
        />
      </div>

      <div>
        <RequiredLabel htmlFor={"TITLE"}>Title</RequiredLabel>
        <input
          id={"TITLE"}
          name={"TITLE"}
          type={"text"}
          className={fieldClass(errors.TITLE)}
          placeholder={"Enter notification title"}
          value={values.TITLE}
          aria-invalid={Boolean(errors.TITLE)}
          aria-describedby={errors.TITLE ? "TITLE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"TITLE-error"} message={errors.TITLE} />
      </div>

      <div>
        <RequiredLabel htmlFor={"BODY"}>Body</RequiredLabel>
        <textarea
          id={"BODY"}
          name={"BODY"}
          rows={3}
          className={fieldClass(errors.BODY, "erp-textarea")}
          placeholder={"Enter notification body"}
          value={values.BODY}
          aria-invalid={Boolean(errors.BODY)}
          aria-describedby={errors.BODY ? "BODY-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"BODY-error"} message={errors.BODY} />
      </div>

      <div>
        <span className={"erp-field-label"} aria-hidden={"true"}>
          &nbsp;
        </span>
        <label className={"erp-switch-field"}>
          <input
            id={"STATUS"}
            className={"erp-switch-control"}
            type={"checkbox"}
            role={"switch"}
            name={"STATUS"}
            checked={values.STATUS === "1"}
            onChange={onChange}
          />
          <span>Is Active</span>
        </label>
      </div>
    </div>
  );
}

export default MobileNotificationForm;
