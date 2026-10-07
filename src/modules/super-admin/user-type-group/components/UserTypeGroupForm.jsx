/**
 * @file Controlled form presentation for User Type Group.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import { userTypeOptions } from "../data/userTypeGroupOptions";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={"erp-field-error"}>
      {message}
    </p>
  );
}

function fieldClass(error, readOnly = false) {
  return [
    "erp-form-control",
    readOnly ? "erp-readonly" : "",
    error ? "erp-form-control-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function UserTypeGroupForm({
  values,
  errors,
  groupName,
  typeRef,
  onChange,
}) {
  return (
    <div className={"erp-form-grid"}>
      <div>
        <label className={"erp-field-label"} htmlFor={"BG_ID"}>
          Group Name
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <input
          id={"BG_ID"}
          name={"BG_ID"}
          type={"text"}
          className={fieldClass(errors.BG_ID, true)}
          value={groupName}
          readOnly
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={
            errors.BG_ID ? "user-type-group-BG_ID-error" : undefined
          }
        />
        <FieldError id={"user-type-group-BG_ID-error"} message={errors.BG_ID} />
      </div>
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
          aria-invalid={Boolean(errors.USER_TYPE_ID)}
          aria-describedby={
            errors.USER_TYPE_ID
              ? "user-type-group-USER_TYPE_ID-error"
              : undefined
          }
          onChange={onChange}
        >
          <option value={""}>Select...</option>
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
