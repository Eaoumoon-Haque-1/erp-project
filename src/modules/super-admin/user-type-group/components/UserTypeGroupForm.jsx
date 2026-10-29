/**
 * @file Controlled form presentation for User Type Group.
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
  return [
    "erp-form-control",
    error ? "erp-form-control-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function UserTypeGroupForm({
  values,
  errors,
  userTypeOptions = [],
  typesLoading = false,
  fieldsDisabled = false,
  typeReadOnly = false,
  typeRef,
  onChange,
}) {
  return (
    <div className={"erp-form-grid"}>
      <div>
        <label className={"erp-field-label"} htmlFor={"USER_TYPE_ID"}>
          Type Name
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <select
          ref={typeRef}
          id={"USER_TYPE_ID"}
          name={"USER_TYPE_ID"}
          className={fieldClass(errors.USER_TYPE_ID)}
          value={values.USER_TYPE_ID}
          required
          disabled={typesLoading || fieldsDisabled || typeReadOnly}
          aria-invalid={Boolean(errors.USER_TYPE_ID)}
          aria-describedby={
            errors.USER_TYPE_ID
              ? "user-type-group-USER_TYPE_ID-error"
              : undefined
          }
          onChange={onChange}
        >
          <option value={""}>
            {typesLoading ? "Loading User Types..." : "--Select Type Name--"}
          </option>
          {userTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError
          id={"user-type-group-USER_TYPE_ID-error"}
          message={errors.USER_TYPE_ID}
        />
      </div>
    </div>
  );
}

export default UserTypeGroupForm;
