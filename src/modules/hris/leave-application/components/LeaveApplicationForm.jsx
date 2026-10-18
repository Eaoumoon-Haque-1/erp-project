/**
 * @file Controlled form presentation for Leave Application.
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

function ReadonlyField({ id, name, label, value, hiddenValue = value, required = false }) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input type={"hidden"} name={name} value={hiddenValue} />
      <input
        id={id}
        type={"text"}
        className={"erp-form-control erp-readonly"}
        value={value}
        readOnly
      />
    </div>
  );
}

export default function LeaveApplicationForm({
  values,
  errors,
  employeeRef,
  fileRef,
  employeeOptions = [],
  leaveCategoryOptions = [],
  referencesLoading = false,
  onChange,
  onEmployeeChange,
}) {
  return (
    <div className={"erp-form-grid"}>
      <ReadonlyField
        id={"BU_ID-display"}
        name={"BU_ID"}
        label={"Business Unit"}
        value={values.BUSINESS_UNIT}
        hiddenValue={values.BU_ID}
        required
      />

      <div>
        <Label htmlFor={"EMPLOYEE_ID"} required>
          Employee
        </Label>
        <select
          ref={employeeRef}
          id={"EMPLOYEE_ID"}
          name={"EMPLOYEE_ID"}
          className={fieldClass(errors.EMPLOYEE_ID)}
          value={values.EMPLOYEE_ID}
          disabled={referencesLoading}
          required
          aria-invalid={Boolean(errors.EMPLOYEE_ID)}
          aria-describedby={
            errors.EMPLOYEE_ID ? "EMPLOYEE_ID-error" : undefined
          }
          onChange={onEmployeeChange}
        >
          <option value={""}>--Select Employee--</option>
          {employeeOptions.map((employee) => (
            <option key={employee.value} value={employee.value}>
              {employee.label}
            </option>
          ))}
        </select>
        <FieldError id={"EMPLOYEE_ID-error"} message={errors.EMPLOYEE_ID} />
      </div>

      <ReadonlyField
        id={"DEPT_ID-display"}
        name={"DEPT_ID"}
        label={"Department"}
        value={values.DEPARTMENT}
        hiddenValue={values.DEPT_ID}
        required
      />

      <ReadonlyField
        id={"DESIGNATION_ID-display"}
        name={"DESIGNATION_ID"}
        label={"Designation"}
        value={values.DESIGNATION}
        hiddenValue={values.DESIGNATION_ID}
        required
      />

      <ReadonlyField
        id={"EMP_TYPE_ID-display"}
        name={"EMP_TYPE_ID"}
        label={"Employee Type"}
        value={values.EMPLOYEE_TYPE}
        hiddenValue={values.EMP_TYPE_ID}
        required
      />

      <div>
        <Label htmlFor={"FROM_DATE"} required>
          From Date
        </Label>
        <DateInput
          id={"FROM_DATE"}
          name={"FROM_DATE"}
          className={fieldClass(errors.FROM_DATE)}
          value={values.FROM_DATE}
          required
          aria-invalid={Boolean(errors.FROM_DATE)}
          aria-describedby={errors.FROM_DATE ? "FROM_DATE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"FROM_DATE-error"} message={errors.FROM_DATE} />
      </div>

      <div>
        <Label htmlFor={"TO_DATE"} required>
          To Date
        </Label>
        <DateInput
          id={"TO_DATE"}
          name={"TO_DATE"}
          min={values.FROM_DATE || undefined}
          className={fieldClass(errors.TO_DATE)}
          value={values.TO_DATE}
          required
          aria-invalid={Boolean(errors.TO_DATE)}
          aria-describedby={errors.TO_DATE ? "TO_DATE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"TO_DATE-error"} message={errors.TO_DATE} />
      </div>

      <div>
        <Label htmlFor={"LEAVE_CATEGORY_ID"} required>
          Leave Category
        </Label>
        <select
          id={"LEAVE_CATEGORY_ID"}
          name={"LEAVE_CATEGORY_ID"}
          className={fieldClass(errors.LEAVE_CATEGORY_ID)}
          value={values.LEAVE_CATEGORY_ID}
          disabled={!values.EMPLOYEE_ID || referencesLoading}
          required
          aria-invalid={Boolean(errors.LEAVE_CATEGORY_ID)}
          aria-describedby={
            errors.LEAVE_CATEGORY_ID ? "LEAVE_CATEGORY_ID-error" : undefined
          }
          onChange={onChange}
        >
          <option value={""}>--Select Leave Category--</option>
          {leaveCategoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <FieldError
          id={"LEAVE_CATEGORY_ID-error"}
          message={errors.LEAVE_CATEGORY_ID}
        />
      </div>

      <div>
        <Label htmlFor={"TOTAL_LEAVE_DAYS"} required>
          Total Leave Days
        </Label>
        <input
          id={"TOTAL_LEAVE_DAYS"}
          name={"TOTAL_LEAVE_DAYS"}
          type={"number"}
          className={fieldClass(
            errors.TOTAL_LEAVE_DAYS,
            "erp-readonly",
          )}
          value={values.TOTAL_LEAVE_DAYS}
          readOnly
          aria-invalid={Boolean(errors.TOTAL_LEAVE_DAYS)}
          aria-describedby={
            errors.TOTAL_LEAVE_DAYS ? "TOTAL_LEAVE_DAYS-error" : undefined
          }
        />
        <FieldError
          id={"TOTAL_LEAVE_DAYS-error"}
          message={errors.TOTAL_LEAVE_DAYS}
        />
      </div>

      <ReadonlyField
        id={"LEAVE_BALANCE-display"}
        name={"LEAVE_BALANCE"}
        label={"Leave Balance"}
        value={values.LEAVE_BALANCE}
      />

      <div>
        <Label htmlFor={"SUPPORTING_DOCUMENT"}>Supporting Document</Label>
        <input
          ref={fileRef}
          id={"SUPPORTING_DOCUMENT"}
          name={"SUPPORTING_DOCUMENT"}
          type={"file"}
          accept={".pdf,.jpg,.jpeg,.png"}
          className={fieldClass(
            errors.SUPPORTING_DOCUMENT,
            "erp-file-control",
          )}
          aria-invalid={Boolean(errors.SUPPORTING_DOCUMENT)}
          aria-describedby={
            errors.SUPPORTING_DOCUMENT
              ? "SUPPORTING_DOCUMENT-error"
              : "SUPPORTING_DOCUMENT-help"
          }
          onChange={onChange}
        />
        <small id={"SUPPORTING_DOCUMENT-help"} className={"erp-field-help"}>
          PDF, JPG, JPEG, or PNG; maximum 2 MB.
        </small>
        <FieldError
          id={"SUPPORTING_DOCUMENT-error"}
          message={errors.SUPPORTING_DOCUMENT}
        />
      </div>

      <div className={"erp-leave-application-reason"}>
        <Label htmlFor={"REASON"} required>
          Reason
        </Label>
        <textarea
          id={"REASON"}
          name={"REASON"}
          rows={3}
          className={fieldClass(errors.REASON, "erp-textarea")}
          value={values.REASON}
          maxLength={500}
          required
          placeholder={"Enter leave reason"}
          aria-invalid={Boolean(errors.REASON)}
          aria-describedby={errors.REASON ? "REASON-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"REASON-error"} message={errors.REASON} />
      </div>
    </div>
  );
}
