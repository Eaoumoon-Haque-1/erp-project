/**
 * @file Controlled form presentation for Leave Allocation.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={"erp-field-error"}>
      {message}
    </p>
  );
}

function fieldClass(error) {
  return ["erp-form-control", error ? "erp-form-control-invalid" : ""]
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

const businessUnitOptions = [
  { value: "1", label: "Head Office" },
  { value: "2", label: "Factory Unit" },
  { value: "3", label: "Regional Office" },
];

const employeeTypeOptions = [
  { value: "1", label: "Permanent" },
  { value: "2", label: "Contractual" },
  { value: "3", label: "Project Based" },
];

const leaveCategoryOptions = [
  { value: "1", label: "Annual Leave" },
  { value: "2", label: "Casual Leave" },
  { value: "3", label: "Sick Leave" },
  { value: "4", label: "Maternity Leave" },
];

const yesNoOptions = [
  { value: "1", label: "Yes" },
  { value: "0", label: "No" },
];

function SelectField({
  name,
  label,
  value,
  error,
  options,
  placeholder,
  inputRef,
  onChange,
}) {
  return (
    <div>
      <RequiredLabel htmlFor={name}>{label}</RequiredLabel>
      <select
        ref={inputRef}
        id={name}
        name={name}
        className={fieldClass(error)}
        value={value}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
      >
        <option value={""}>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

export default function LeaveAllocationForm({
  values,
  errors,
  firstFieldRef,
  onChange,
}) {
  return (
    <div className={"erp-form-grid"}>
      <SelectField
        name={"BU_ID"}
        label={"Business Unit"}
        value={values.BU_ID}
        error={errors.BU_ID}
        options={businessUnitOptions}
        placeholder={"--Select Business Unit--"}
        inputRef={firstFieldRef}
        onChange={onChange}
      />

      <SelectField
        name={"EMP_TYPE_ID"}
        label={"Employee Type"}
        value={values.EMP_TYPE_ID}
        error={errors.EMP_TYPE_ID}
        options={employeeTypeOptions}
        placeholder={"--Select Employee Type--"}
        onChange={onChange}
      />

      <SelectField
        name={"LEAVE_CATEGORY_ID"}
        label={"Leave Category"}
        value={values.LEAVE_CATEGORY_ID}
        error={errors.LEAVE_CATEGORY_ID}
        options={leaveCategoryOptions}
        placeholder={"--Select Leave Category--"}
        onChange={onChange}
      />

      <div>
        <RequiredLabel htmlFor={"LEAVE_YEAR"}>Year</RequiredLabel>
        <input
          id={"LEAVE_YEAR"}
          name={"LEAVE_YEAR"}
          type={"text"}
          maxLength={4}
          inputMode={"numeric"}
          pattern={"[0-9]{4}"}
          className={fieldClass(errors.LEAVE_YEAR)}
          value={values.LEAVE_YEAR}
          placeholder={"Enter 4-digit year"}
          required
          aria-invalid={Boolean(errors.LEAVE_YEAR)}
          aria-describedby={errors.LEAVE_YEAR ? "LEAVE_YEAR-error" : undefined}
          onChange={(event) => {
            event.target.value = event.target.value
              .replace(/\D/g, "")
              .slice(0, 4);
            onChange(event);
          }}
        />
        <FieldError id={"LEAVE_YEAR-error"} message={errors.LEAVE_YEAR} />
      </div>

      <div>
        <RequiredLabel htmlFor={"TOTAL_LEAVE_DAYS"}>
          Total Leave Days per Year
        </RequiredLabel>
        <input
          id={"TOTAL_LEAVE_DAYS"}
          name={"TOTAL_LEAVE_DAYS"}
          type={"number"}
          min={"0.5"}
          max={"999.99"}
          step={"0.5"}
          inputMode={"decimal"}
          className={fieldClass(errors.TOTAL_LEAVE_DAYS)}
          value={values.TOTAL_LEAVE_DAYS}
          placeholder={"Enter total leave days"}
          required
          aria-invalid={Boolean(errors.TOTAL_LEAVE_DAYS)}
          aria-describedby={
            errors.TOTAL_LEAVE_DAYS ? "TOTAL_LEAVE_DAYS-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError
          id={"TOTAL_LEAVE_DAYS-error"}
          message={errors.TOTAL_LEAVE_DAYS}
        />
      </div>

      

      <SelectField
        name={"SANDWICH_LEAVE_APPLICABLE"}
        label={"Sandwich Leave Applicable?"}
        value={values.SANDWICH_LEAVE_APPLICABLE}
        error={errors.SANDWICH_LEAVE_APPLICABLE}
        options={yesNoOptions}
        placeholder={"--Select--"}
        onChange={onChange}
      />

      <SelectField
        name={"WITH_PAY"}
        label={"With Pay?"}
        value={values.WITH_PAY}
        error={errors.WITH_PAY}
        options={yesNoOptions}
        placeholder={"--Select--"}
        onChange={onChange}
      />

      <div>
        <span className={"erp-field-label"} aria-hidden={"true"}>
          &nbsp;
        </span>
        <label className={"erp-switch-field"}>
          <input
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
