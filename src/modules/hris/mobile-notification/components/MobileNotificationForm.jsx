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

function TargetField({ id, label, placeholder, options, value, error, disabled, multiple, inputRef, onChange }) {
  if (multiple) {
    return <MultiSelectField id={id} name={id} label={label} placeholder={placeholder}
      options={options} value={value} error={error} disabled={disabled} required
      inputRef={inputRef} onChange={onChange} />;
  }
  return (
    <div>
      <RequiredLabel htmlFor={id}>{label}</RequiredLabel>
      <select ref={inputRef} id={id} name={id} className={fieldClass(error)}
        value={value[0] ?? ""} disabled={disabled} required aria-invalid={Boolean(error)}
        onChange={(event) => onChange(id, event.target.value ? [event.target.value] : [])}>
        <option value={""}>{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function MobileNotificationForm({
  values,
  errors,
  businessUnits,
  departments,
  employees,
  notificationTypes,
  referencesLoading = false,
  allowMultipleTargets = true,
  businessUnitRef,
  onChange,
  onMultiSelectChange,
}) {
  return (
    <div className={"erp-form-grid"}>
      <TargetField
        id={"BU_ID"}
        label={"Business Unit"}
        placeholder={"--Select Business Unit--"}
        options={businessUnits}
        value={values.BU_ID}
        error={errors.BU_ID}
        disabled={referencesLoading}
        multiple={allowMultipleTargets}
        inputRef={businessUnitRef}
        onChange={onMultiSelectChange}
      />

      <TargetField
        id={"DEPT_ID"}
        label={"Department Name"}
        placeholder={"--Select Department--"}
        options={departments}
        value={values.DEPT_ID}
        error={errors.DEPT_ID}
        disabled={referencesLoading || values.BU_ID.length === 0}
        multiple={allowMultipleTargets}
        onChange={onMultiSelectChange}
      />

      <TargetField
        id={"EMPL_ID"}
        label={"Employee Name"}
        placeholder={"--Select Employee--"}
        options={employees}
        value={values.EMPL_ID}
        error={errors.EMPL_ID}
        disabled={referencesLoading || values.DEPT_ID.length === 0}
        multiple={allowMultipleTargets}
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
          disabled={referencesLoading || values.BU_ID.length === 0}
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
