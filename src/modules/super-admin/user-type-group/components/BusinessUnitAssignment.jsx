/**
 * @file Feature UI component for User Type Group: BusinessUnitAssignment.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
function BusinessUnitAssignment({
  values,
  errors,
  businessUnitOptions = [],
  unitsLoading = false,
  groupSelected = false,
  onChange,
  onAdd,
}) {
  return (
    <div className={"erp-user-type-group-assignment-grid"}>
      <div>
        <label className={"erp-field-label"} htmlFor={"BU_ID"}>
          Business Unit
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <select
          id={"BU_ID"}
          name={"BU_ID"}
          className={[
            "erp-form-control",
            errors.BU_ID ? "erp-form-control-invalid" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          value={values.BU_ID}
          required
          disabled={!groupSelected || unitsLoading}
          aria-invalid={Boolean(errors.BU_ID)}
          aria-describedby={
            errors.BU_ID ? "user-type-group-BU_ID-error" : undefined
          }
          onChange={onChange}
        >
          <option value={""}>
            {unitsLoading ? "Loading Business Units..." : "Select..."}
          </option>
          {businessUnitOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.BU_ID && (
          <p id={"user-type-group-BU_ID-error"} className={"erp-field-error"}>
            {errors.BU_ID}
          </p>
        )}
      </div>
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
      <button
        type={onAdd ? "button" : "submit"}
        className={"erp-role-add-button"}
        aria-label={"Add Business Unit"}
        title={"Add Business Unit"}
        onClick={onAdd}
      >
        <span aria-hidden={"true"}>+</span>
      </button>
    </div>
  );
}

export default BusinessUnitAssignment;
