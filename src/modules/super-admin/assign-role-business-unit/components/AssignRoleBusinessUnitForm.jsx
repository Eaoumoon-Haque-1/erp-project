/**
 * @file Controlled form presentation for Assign Role Business Unit.
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

function DeleteIcon() {
  return (
    <svg
      viewBox={"0 0 24 24"}
      className={"size-4"}
      fill={"none"}
      stroke={"currentColor"}
      strokeWidth={"2"}
      strokeLinecap={"round"}
      strokeLinejoin={"round"}
      aria-hidden={"true"}
    >
      <path d={"M4 7h16"} />
      <path d={"M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"} />
    </svg>
  );
}

export default function AssignRoleBusinessUnitForm({
  values,
  errors,
  assignedRoles,
  groupOptions,
  businessUnitOptions,
  roleOptions,
  roleRef,
  onChange,
  onAddRole,
  onRemoveRole,
}) {
  const assignedRoleIds = new Set(assignedRoles.map((role) => role.ROLE_ID));

  return (
    <>
      <div className={"erp-form-grid"}>
        <div>
          <label className={"erp-field-label"} htmlFor={"GROUP_NAME"}>
            Group Name
            <span className={"erp-required"} aria-hidden={"true"}>
              *
            </span>
          </label>
          <select
            id={"GROUP_NAME"}
            name={"BG_ID"}
            className={fieldClass(errors.BG_ID)}
            value={values.BG_ID}
            required
            aria-invalid={Boolean(errors.BG_ID)}
            aria-describedby={errors.BG_ID ? "BG_ID-error" : undefined}
            onChange={onChange}
          >
            <option value={""}>--Select Group Name--</option>
            {groupOptions.map((group) => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>
          <FieldError id={"BG_ID-error"} message={errors.BG_ID} />
        </div>

        <div>
          <label className={"erp-field-label"} htmlFor={"BU_ID"}>
            Business Unit
          </label>
          <select
            id={"BU_ID"}
            name={"BU_ID"}
            className={fieldClass(errors.BU_ID)}
            value={values.BU_ID}
            disabled={!values.BG_ID}
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

        <div>
          <label className={"erp-field-label"} htmlFor={"ROLE_ID"}>
            Role
            <span className={"erp-required"} aria-hidden={"true"}>
              *
            </span>
          </label>
          <select
            ref={roleRef}
            id={"ROLE_ID"}
            name={"ROLE_ID"}
            className={fieldClass(errors.ROLE_ID)}
            value={values.ROLE_ID}
            aria-invalid={Boolean(errors.ROLE_ID)}
            aria-describedby={errors.ROLE_ID ? "ROLE_ID-error" : undefined}
            onChange={onChange}
          >
            <option value={""}>--Select Role--</option>
            {roleOptions.map((role) => (
              <option
                key={role.value}
                value={role.value}
                disabled={assignedRoleIds.has(role.value)}
              >
                {role.label}
              </option>
            ))}
          </select>
          <FieldError id={"ROLE_ID-error"} message={errors.ROLE_ID} />
        </div>

        <button
          type={"button"}
          className={"erp-role-add-button"}
          aria-label={"Add role"}
          title={"Add role"}
          disabled={!values.ROLE_ID}
          onClick={onAddRole}
        >
          <span aria-hidden={"true"}>+</span>
        </button>
      </div>

      <div className={"erp-role-divider"} />

      <h2 className={"erp-employee-section-title"}>
        Assigned Role List
      </h2>
      <div className={"erp-table-wrap"}>
        <table
          className={"erp-table erp-assigned-role-table"}
          data-table={"BU_ROLE_MAP"}
        >
          <thead>
            <tr>
              <th className={"erp-number-column"}>#</th>
              <th>Role</th>
              <th className={"erp-action-column"}>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignedRoles.length === 0 ? (
              <tr>
                <td colSpan={3} className={"erp-empty-cell"}>
                  No role has been assigned.
                </td>
              </tr>
            ) : (
              assignedRoles.map((role, index) => (
                <tr key={role.MAPPING_ID || role.ROLE_ID}>
                  <td className={"erp-number-column"}>{index + 1}</td>
                  <td>{role.ROLE_NAME}</td>
                  <td className={"erp-action-column"}>
                    <button
                      type={"button"}
                      className={"erp-role-delete-button"}
                      aria-label={`Remove ${role.ROLE_NAME}`}
                      title={"Remove"}
                      onClick={() => onRemoveRole(role)}
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <FieldError
        id={"ASSIGNED_ROLES-error"}
        message={errors.ASSIGNED_ROLES}
      />
    </>
  );
}
