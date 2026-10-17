/**
 * @file Controlled form presentation for Shift.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import { weekendDropdownOptions } from "../validation/shiftValidation";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={"erp-field-error"}>
      {message}
    </p>
  );
}

function fieldClass(error, disabled = false, extra = "") {
  return [
    "erp-form-control",
    extra,
    disabled ? "erp-readonly" : "",
    error ? "erp-form-control-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function FieldLabel({ htmlFor, required = false, children }) {
  return (
    <label className={"erp-field-label"} htmlFor={htmlFor}>
      {children}
      {required && (
        <span className={"erp-required"} aria-hidden={"true"}>
          *
        </span>
      )}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className={"erp-shift-section"}>
      <h2 className={"erp-shift-section-title"}>{title}</h2>
      {children}
    </section>
  );
}

function InputField({
  name,
  label,
  value,
  error,
  type = "text",
  required = false,
  disabled = false,
  inputRef,
  onChange,
  ...inputProps
}) {
  return (
    <div>
      <FieldLabel htmlFor={name} required={required}>
        {label}
      </FieldLabel>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        className={fieldClass(error, disabled)}
        value={value}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
        {...inputProps}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

function ToggleField({
  name,
  label,
  checked,
  disabled = false,
  className = "",
  onChange,
}) {
  return (
    <div className={className}>
      <span className={"erp-field-label"} aria-hidden={"true"}>
        &nbsp;
      </span>
      <label className={"erp-switch-field"}>
        <input
          className={"erp-switch-control"}
          type={"checkbox"}
          role={"switch"}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
        <span>{label}</span>
      </label>
    </div>
  );
}

function ShiftForm({
  values,
  errors,
  businessUnitOptions = [],
  businessUnitsLoading = false,
  onChange,
  shiftTitleRef,
}) {
  const isLateInEnabled = values.APPLY_LATE_IN === "1";
  const isEarlyOutEnabled = values.APPLY_EARLY_OUT === "1";
  const isAttendancePolicyEnabled = values.ATTN_IN_OUT_POLICY === "1";
  const isOvertimeEnabled = values.ALLOW_OVERTIME === "1";

  return (
    <div className={"erp-shift-form"}>
      <Section title={"Shift Information"}>
        <div className={"erp-shift-section-grid"}>
          <div>
            <FieldLabel htmlFor={"BU_ID"} required>
              Business Unit
            </FieldLabel>
            <select
              id={"BU_ID"}
              name={"BU_ID"}
              className={fieldClass(errors.BU_ID)}
              value={values.BU_ID}
              required
              disabled={businessUnitsLoading}
              aria-invalid={Boolean(errors.BU_ID)}
              aria-describedby={errors.BU_ID ? "BU_ID-error" : undefined}
              onChange={onChange}
            >
              <option value={""}>--Select Business Unit--</option>
              {businessUnitOptions.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            <FieldError id={"BU_ID-error"} message={errors.BU_ID} />
          </div>

          <InputField
            inputRef={shiftTitleRef}
            name={"SHIFT_TITLE"}
            label={"Shift Title"}
            value={values.SHIFT_TITLE}
            error={errors.SHIFT_TITLE}
            required
            maxLength={100}
            placeholder={"Enter shift title"}
            onChange={onChange}
          />
          <InputField
            name={"SHIFT_START_TIME"}
            label={"Actual Shift Start Time"}
            type={"time"}
            value={values.SHIFT_START_TIME}
            error={errors.SHIFT_START_TIME}
            required
            onChange={onChange}
          />
          <InputField
            name={"SHIFT_END_TIME"}
            label={"Actual Shift End Time"}
            type={"time"}
            value={values.SHIFT_END_TIME}
            error={errors.SHIFT_END_TIME}
            required
            onChange={onChange}
          />
          <div>
            <FieldLabel htmlFor={"WEEKEND"} required>
              Weekend
            </FieldLabel>
            <select
              id={"WEEKEND"}
              name={"WEEKEND"}
              className={fieldClass(errors.WEEKEND)}
              value={values.WEEKEND}
              required
              aria-invalid={Boolean(errors.WEEKEND)}
              aria-describedby={errors.WEEKEND ? "WEEKEND-error" : undefined}
              onChange={onChange}
            >
              <option value={""}>--Select Weekend--</option>
              {weekendDropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError id={"WEEKEND-error"} message={errors.WEEKEND} />
          </div>
          <InputField
            name={"GRACE_TIME_MINUTES"}
            label={"Grace Time (Minutes)"}
            type={"number"}
            value={values.GRACE_TIME_MINUTES}
            error={errors.GRACE_TIME_MINUTES}
            required
            min={"0"}
            max={"999"}
            step={"1"}
            placeholder={"Enter minutes"}
            onChange={onChange}
          />
        </div>
      </Section>

      <Section title={"Late In and Early Out Policies"}>
        <div className={"erp-shift-section-grid"}>
          <ToggleField
            name={"APPLY_LATE_IN"}
            label={"Apply Late In Policy"}
            checked={isLateInEnabled}
            onChange={onChange}
          />
          <InputField
            name={"LATE_IN_DAYS"}
            label={"Applicable Late In Days"}
            type={"number"}
            value={values.LATE_IN_DAYS}
            error={errors.LATE_IN_DAYS}
            required={isLateInEnabled}
            disabled={!isLateInEnabled}
            min={"1"}
            step={"1"}
            placeholder={"Enter days"}
            onChange={onChange}
          />
          <InputField
            name={"LATE_IN_DEDUCTION"}
            label={"Late In Deduction (Day)"}
            type={"number"}
            value={values.LATE_IN_DEDUCTION}
            error={errors.LATE_IN_DEDUCTION}
            required={isLateInEnabled}
            disabled={!isLateInEnabled}
            min={"0.01"}
            max={"1"}
            step={"0.01"}
            placeholder={"0.00"}
            onChange={onChange}
          />
          <ToggleField
            name={"ALLOW_LATE_IN_MSG"}
            label={"Allow Late In Message?"}
            checked={values.ALLOW_LATE_IN_MSG === "1"}
            disabled={!isLateInEnabled}
            className={"col-start-1"}
            onChange={onChange}
          />
          <ToggleField
            name={"APPLY_EARLY_OUT"}
            label={"Apply Early Out Policy"}
            checked={isEarlyOutEnabled}
            className={"col-start-1"}
            onChange={onChange}
          />
          <InputField
            name={"EARLY_OUT_DAYS"}
            label={"Applicable Early Out Days"}
            type={"number"}
            value={values.EARLY_OUT_DAYS}
            error={errors.EARLY_OUT_DAYS}
            required={isEarlyOutEnabled}
            disabled={!isEarlyOutEnabled}
            min={"1"}
            step={"1"}
            placeholder={"Enter days"}
            onChange={onChange}
          />
          <InputField
            name={"EARLY_OUT_DEDUCTION"}
            label={"Early Out Deduction (Day)"}
            type={"number"}
            value={values.EARLY_OUT_DEDUCTION}
            error={errors.EARLY_OUT_DEDUCTION}
            required={isEarlyOutEnabled}
            disabled={!isEarlyOutEnabled}
            min={"0.01"}
            max={"1"}
            step={"0.01"}
            placeholder={"0.00"}
            onChange={onChange}
          />
          <ToggleField
            name={"ALLOW_EARLY_OUT_MSG"}
            label={"Allow Early Out Message?"}
            checked={values.ALLOW_EARLY_OUT_MSG === "1"}
            disabled={!isEarlyOutEnabled}
            className={"col-start-1"}
            onChange={onChange}
          />
        </div>

      </Section>

      <Section title={"Attendance In/Out Policy"}>
        <div className={"erp-shift-section-grid"}>
          <ToggleField
            name={"ATTN_IN_OUT_POLICY"}
            label={"Attendance In Out Policy"}
            checked={isAttendancePolicyEnabled}
            onChange={onChange}
          />
          <InputField
            name={"START_BEFORE"}
            label={"Start Before (Minutes)"}
            type={"number"}
            value={values.START_BEFORE}
            error={errors.START_BEFORE}
            required={isAttendancePolicyEnabled}
            disabled={!isAttendancePolicyEnabled}
            min={"0"}
            step={"1"}
            placeholder={"Enter minutes"}
            onChange={onChange}
          />
          <InputField
            name={"CLOSE_AFTER"}
            label={"Close After (Minutes)"}
            type={"number"}
            value={values.CLOSE_AFTER}
            error={errors.CLOSE_AFTER}
            required={isAttendancePolicyEnabled}
            disabled={!isAttendancePolicyEnabled}
            min={"0"}
            step={"1"}
            placeholder={"Enter minutes"}
            onChange={onChange}
          />
          <ToggleField
            name={"NOT_ALLOW_ATTN"}
            label={"Do Not Allow Attendance"}
            checked={values.NOT_ALLOW_ATTN === "1"}
            disabled={!isAttendancePolicyEnabled}
            className={"col-start-1"}
            onChange={onChange}
          />
        </div>

        <h3 className={"erp-shift-subsection-title"}>
          Attendance Punch Time Window
        </h3>
        <div className={"erp-shift-section-grid"}>
          <InputField
            name={"IN_TIME_START"}
            label={"In Time (Start)"}
            type={"time"}
            value={values.IN_TIME_START}
            error={errors.IN_TIME_START}
            required={isAttendancePolicyEnabled}
            disabled={!isAttendancePolicyEnabled}
            onChange={onChange}
          />
          <InputField
            name={"IN_TIME_CLOSE"}
            label={"In Time (Close)"}
            type={"time"}
            value={values.IN_TIME_CLOSE}
            error={errors.IN_TIME_CLOSE}
            required={isAttendancePolicyEnabled}
            disabled={!isAttendancePolicyEnabled}
            onChange={onChange}
          />
          <InputField
            name={"OUT_TIME_START"}
            label={"Out Time (Start)"}
            type={"time"}
            value={values.OUT_TIME_START}
            error={errors.OUT_TIME_START}
            required={isAttendancePolicyEnabled}
            disabled={!isAttendancePolicyEnabled}
            onChange={onChange}
          />
          <InputField
            name={"OUT_TIME_CLOSE"}
            label={"Out Time (Close)"}
            type={"time"}
            value={values.OUT_TIME_CLOSE}
            error={errors.OUT_TIME_CLOSE}
            required={isAttendancePolicyEnabled}
            disabled={!isAttendancePolicyEnabled}
            onChange={onChange}
          />
          <ToggleField
            name={"ALLOW_NEXT_DAY_ATTN"}
            label={"Allow Next Day Attendance?"}
            checked={values.ALLOW_NEXT_DAY_ATTN === "1"}
            onChange={onChange}
          />
        </div>
      </Section>

      <Section title={"Overtime Configuration"}>
        <div className={"erp-shift-section-grid"}>
          <ToggleField
            name={"ALLOW_OVERTIME"}
            label={"Allow Overtime?"}
            checked={isOvertimeEnabled}
            onChange={onChange}
          />
          <InputField
            name={"MAX_OT_HOUR"}
            label={"Maximum OT Hour"}
            type={"number"}
            value={values.MAX_OT_HOUR}
            error={errors.MAX_OT_HOUR}
            required={isOvertimeEnabled}
            disabled={!isOvertimeEnabled}
            min={"0.01"}
            step={"0.01"}
            placeholder={"0.00"}
            onChange={onChange}
          />
          <InputField
            name={"EXTRA_OT_HOUR"}
            label={"Extra OT Hour"}
            type={"number"}
            value={values.EXTRA_OT_HOUR}
            error={errors.EXTRA_OT_HOUR}
            required={isOvertimeEnabled}
            disabled={!isOvertimeEnabled}
            min={"0"}
            step={"0.01"}
            placeholder={"0.00"}
            onChange={onChange}
          />
          <ToggleField
            name={"STATUS"}
            label={"Is Active"}
            checked={values.STATUS === "1"}
            onChange={onChange}
          />
        </div>
      </Section>
    </div>
  );
}

export default ShiftForm;
