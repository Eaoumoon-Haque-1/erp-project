/**
 * @file Controlled form presentation for Manual Attendance Update.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import DateInput from "../../../../components/shared/DateInput";

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

function Label({ htmlFor, required = false, children }) {
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

function ManualAttendanceUpdateForm({
  values,
  errors,
  businessGroups,
  businessUnits,
  departments,
  designations,
  shifts,
  businessGroupRef,
  referencesLoading = false,
  onChange,
}) {
  return (
    <div className={"erp-form-grid"}>
      <div>
        <Label htmlFor={"BG_ID"} required>
          Group Name
        </Label>
        <select
          ref={businessGroupRef}
          id={"BG_ID"}
          name={"BG_ID"}
          className={fieldClass(errors.BG_ID)}
          value={values.BG_ID}
          required
          disabled={referencesLoading}
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? "BG_ID-error" : undefined}
          onChange={onChange}
        >
          <option value={""}>--Select Group Name--</option>
          {businessGroups.map((group) => (
            <option key={group.ID} value={group.ID}>
              {group.GROUP_NAME}
            </option>
          ))}
        </select>
        <FieldError id={"BG_ID-error"} message={errors.BG_ID} />
      </div>

      <div>
        <Label htmlFor={"BU_ID"} required>
          Business Unit
        </Label>
        <select
          id={"BU_ID"}
          name={"BU_ID"}
          className={fieldClass(errors.BU_ID)}
          value={values.BU_ID}
          required
          disabled={!values.BG_ID || referencesLoading}
          aria-invalid={Boolean(errors.BU_ID)}
          aria-describedby={errors.BU_ID ? "BU_ID-error" : undefined}
          onChange={onChange}
        >
          <option value={""}>--Select Business Unit--</option>
          {businessUnits.map((unit) => (
            <option key={unit.ID} value={unit.ID}>
              {unit.BUSINESS_UNIT}
            </option>
          ))}
        </select>
        <FieldError id={"BU_ID-error"} message={errors.BU_ID} />
      </div>

      <div>
        <Label htmlFor={"DEPT_ID"} required>
          Department Name
        </Label>
        <select
          id={"DEPT_ID"}
          name={"DEPT_ID"}
          className={fieldClass(errors.DEPT_ID)}
          value={values.DEPT_ID}
          required
          disabled={!values.BU_ID}
          aria-invalid={Boolean(errors.DEPT_ID)}
          aria-describedby={errors.DEPT_ID ? "DEPT_ID-error" : undefined}
          onChange={onChange}
        >
          <option value={""}>--Select Department--</option>
          {departments.map((department) => (
            <option key={department.ID} value={department.ID}>
              {department.DEPARTMENT}
            </option>
          ))}
        </select>
        <FieldError id={"DEPT_ID-error"} message={errors.DEPT_ID} />
      </div>

      <div>
        <Label htmlFor={"DESIG_ID"} required>
          Designation Name
        </Label>
        <select
          id={"DESIG_ID"}
          name={"DESIG_ID"}
          className={fieldClass(errors.DESIG_ID)}
          value={values.DESIG_ID}
          required
          disabled={!values.DEPT_ID}
          aria-invalid={Boolean(errors.DESIG_ID)}
          aria-describedby={errors.DESIG_ID ? "DESIG_ID-error" : undefined}
          onChange={onChange}
        >
          <option value={""}>--Select Designation--</option>
          {designations.map((designation) => (
            <option key={designation.ID} value={designation.ID}>
              {designation.DESIGNATION}
            </option>
          ))}
        </select>
        <FieldError id={"DESIG_ID-error"} message={errors.DESIG_ID} />
      </div>

      <div>
        <Label htmlFor={"SHIFT_ID"} required>
          Shift
        </Label>
        <select
          id={"SHIFT_ID"}
          name={"SHIFT_ID"}
          className={fieldClass(errors.SHIFT_ID)}
          value={values.SHIFT_ID}
          required
          disabled={!values.BU_ID}
          aria-invalid={Boolean(errors.SHIFT_ID)}
          aria-describedby={errors.SHIFT_ID ? "SHIFT_ID-error" : undefined}
          onChange={onChange}
        >
          <option value={""}>--Select Shift--</option>
          {shifts.map((shift) => (
            <option key={shift.ID} value={shift.ID}>
              {shift.SHIFT_TITLE}
            </option>
          ))}
        </select>
        <FieldError id={"SHIFT_ID-error"} message={errors.SHIFT_ID} />
      </div>

      <div>
        <Label htmlFor={"ATTEN_DATE"} required>
          Attendance Date
        </Label>
        <DateInput
          id={"ATTEN_DATE"}
          name={"ATTEN_DATE"}
          className={fieldClass(errors.ATTEN_DATE)}
          value={values.ATTEN_DATE}
          required
          aria-invalid={Boolean(errors.ATTEN_DATE)}
          aria-describedby={errors.ATTEN_DATE ? "ATTEN_DATE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"ATTEN_DATE-error"} message={errors.ATTEN_DATE} />
      </div>

      <div>
        <Label htmlFor={"IN_TIME"} required>
          In Time
        </Label>
        <input
          id={"IN_TIME"}
          name={"IN_TIME"}
          type={"time"}
          className={fieldClass(errors.IN_TIME)}
          value={values.IN_TIME}
          required
          aria-invalid={Boolean(errors.IN_TIME)}
          aria-describedby={errors.IN_TIME ? "IN_TIME-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"IN_TIME-error"} message={errors.IN_TIME} />
      </div>

      <div>
        <Label htmlFor={"OUT_TIME"}>Out Time</Label>
        <input
          id={"OUT_TIME"}
          name={"OUT_TIME"}
          type={"time"}
          className={fieldClass(errors.OUT_TIME)}
          value={values.OUT_TIME}
          aria-invalid={Boolean(errors.OUT_TIME)}
          aria-describedby={errors.OUT_TIME ? "OUT_TIME-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"OUT_TIME-error"} message={errors.OUT_TIME} />
      </div>

      <div>
        <Label htmlFor={"NOTE"}>Note</Label>
        <textarea
          id={"NOTE"}
          name={"NOTE"}
          rows={3}
          className={fieldClass(errors.NOTE, "erp-textarea")}
          placeholder={"Enter note"}
          value={values.NOTE}
          aria-invalid={Boolean(errors.NOTE)}
          aria-describedby={errors.NOTE ? "NOTE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"NOTE-error"} message={errors.NOTE} />
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

export default ManualAttendanceUpdateForm;
