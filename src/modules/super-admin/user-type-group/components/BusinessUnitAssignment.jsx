/**
 * @file Feature UI component for User Type Group: BusinessUnitAssignment.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
function BusinessUnitAssignment({
  values,
  errors,
  groupId = "",
  groupError = "",
  groupOptions = [],
  businessUnitOptions = [],
  groupsLoading = false,
  unitsLoading = false,
  groupSelected = false,
  groupReadOnly = false,
  hasAssignments = false,
  onGroupChange,
  onChange,
  onNewRow,
}) {
  return (
    <div className={"erp-user-type-group-assignment-grid"}>
      <div>
        <label className={"erp-field-label"} htmlFor={"BG_ID"}>
          Business Group
          <span className={"erp-required"} aria-hidden={"true"}>*</span>
        </label>
        <select
          id={"BG_ID"}
          name={"BG_ID"}
          className={[
            "erp-form-control",
            groupReadOnly ? "erp-readonly" : "",
            groupError ? "erp-form-control-invalid" : "",
          ].filter(Boolean).join(" ")}
          value={groupId}
          required
          disabled={groupsLoading || groupReadOnly}
          aria-invalid={Boolean(groupError)}
          aria-describedby={groupError ? "user-type-group-BG_ID-error" : undefined}
          onChange={onGroupChange}
        >
          <option value={""}>
            {groupsLoading ? "Loading Business Groups..." : "--Select Business Group--"}
          </option>
          {groupOptions.map((group) => (
            <option key={group.value} value={group.value}>{group.label}</option>
          ))}
        </select>
        {groupError && (
          <p id={"user-type-group-BG_ID-error"} className={"erp-field-error"}>{groupError}</p>
        )}
      </div>
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
          required={!hasAssignments}
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
        type={"button"}
        className={"erp-role-add-button"}
        aria-label={"Create new Business Unit row"}
        title={"Create new row"}
        onClick={onNewRow}
      >
        <span aria-hidden={"true"}>+</span>
      </button>
    </div>
  );
}

export default BusinessUnitAssignment;
