/**
 * @file Controlled form presentation for Business Unit.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import AutoGrowTextarea from "../../../../components/shared/AutoGrowTextarea";
import ImageUploadField from "../../../../components/shared/ImageUploadField";

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

function BusinessUnitForm({
  values,
  errors,
  businessGroup = { GROUP_NAME: "" },
  groupOptions = [],
  groupsLoading = false,
  onChange,
  unitNameRef,
  logoInputRef,
  roleOptions = [],
  roleValue = "",
  roleRows = [],
  roleQuery = "",
  onRoleChange,
  onAddRole,
  onRemoveRole,
  onRoleQueryChange,
  mode = "default",
}) {
  const normalizedRoleQuery = roleQuery.trim().toLowerCase();
  const visibleRoleRows = roleRows.filter(
    (role) =>
      !normalizedRoleQuery ||
      role.name.toLowerCase().includes(normalizedRoleQuery),
  );

  if (mode === "map-role") {
    return (
      <div className={"erp-business-unit-role-edit"}>
        <div className={"erp-form-grid erp-business-unit-edit-form-grid"}>
          <div>
            <label className={"erp-field-label"} htmlFor={"BG_ID-display"}>
              Group Name
            </label>
            <input type={"hidden"} name={"BG_ID"} value={values.BG_ID} />
            <input
              id={"BG_ID-display"}
              className={"erp-form-control erp-readonly"}
              type={"text"}
              value={businessGroup.GROUP_NAME}
              readOnly
              aria-describedby={errors.BG_ID ? "BG_ID-error" : undefined}
            />
            <FieldError id={"BG_ID-error"} message={errors.BG_ID} />
          </div>

          <div>
            <label className={"erp-field-label"} htmlFor={"BUSINESS_UNIT"}>
              Business Unit
            </label>
            <input
              ref={unitNameRef}
              id={"BUSINESS_UNIT"}
              name={"BUSINESS_UNIT"}
              type={"text"}
              className={fieldClass(errors.BUSINESS_UNIT)}
              placeholder={"Enter unit name"}
              value={values.BUSINESS_UNIT}
              maxLength={100}
              required
              aria-invalid={Boolean(errors.BUSINESS_UNIT)}
              aria-describedby={
                errors.BUSINESS_UNIT ? "BUSINESS_UNIT-error" : undefined
              }
              onChange={onChange}
            />
            <FieldError
              id={"BUSINESS_UNIT-error"}
              message={errors.BUSINESS_UNIT}
            />
          </div>
        </div>

        <div className={"erp-role-divider"} />

        <div
          className={
            "erp-role-assignment-grid erp-business-unit-role-assignment-grid"
          }
        >
          <div>
            <label
              className={"erp-field-label"}
              htmlFor={"BUSINESS_UNIT_ROLE_SELECT"}
            >
              Role
            </label>
            <select
              id={"BUSINESS_UNIT_ROLE_SELECT"}
              className={"erp-form-control"}
              value={roleValue}
              aria-label={"Choose a role"}
              onChange={(event) => onRoleChange?.(event.target.value)}
            >
              <option value={""}>Select...</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type={"button"}
            className={"erp-role-add-button"}
            onClick={onAddRole}
            aria-label={"Add role"}
            title={"Add role"}
          >
            <span aria-hidden={"true"}>+</span>
          </button>
        </div>

        <div
          className={
            "erp-role-permission-list erp-business-unit-role-table-wrap"
          }
        >
          <div className={"erp-role-list-heading"}>
            <h3>Role List</h3>
            <input
              className={"erp-list-control"}
              type={"search"}
              value={roleQuery}
              placeholder={"Search by Role Name..."}
              aria-label={"Search roles by name"}
              onChange={(event) => onRoleQueryChange?.(event.target.value)}
            />
          </div>

          <div className={"erp-table-wrap"}>
            <table className={"erp-table erp-business-unit-role-table"}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRoleRows.length === 0 ? (
                  <tr>
                    <td className={"erp-empty-cell"} colSpan={2}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  visibleRoleRows.map((role) => (
                    <tr key={role.id}>
                      <td>{role.name}</td>
                      <td>
                        <button
                          type={"button"}
                          className={"erp-role-delete-button"}
                          onClick={() => onRemoveRole?.(role.id)}
                          aria-label={`Delete ${role.name}`}
                          title={"Delete"}
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
        </div>
      </div>
    );
  }

  return (
    <div className={"erp-form-grid erp-business-unit-form-grid"}>
      <div>
        <label className={"erp-field-label"} htmlFor={"BG_ID"}>
          Group Name
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <select
          id={"BG_ID"}
          name={"BG_ID"}
          className={fieldClass(errors.BG_ID)}
          value={values.BG_ID}
          required
          disabled={groupsLoading}
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? "BG_ID-error" : undefined}
          onChange={onChange}
        >
          <option value={""}>
            {groupsLoading ? "Loading Business Groups..." : "--Select Group Name--"}
          </option>
          {groupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id={"BG_ID-error"} message={errors.BG_ID} />
      </div>

      <div>
        <label className={"erp-field-label"} htmlFor={"BUSINESS_UNIT"}>
          Unit Name
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <input
          ref={unitNameRef}
          id={"BUSINESS_UNIT"}
          name={"BUSINESS_UNIT"}
          type={"text"}
          className={fieldClass(errors.BUSINESS_UNIT)}
          placeholder={"Enter unit name"}
          value={values.BUSINESS_UNIT}
          maxLength={100}
          required
          aria-invalid={Boolean(errors.BUSINESS_UNIT)}
          aria-describedby={
            errors.BUSINESS_UNIT ? "BUSINESS_UNIT-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"BUSINESS_UNIT-error"} message={errors.BUSINESS_UNIT} />
      </div>

      <div>
        <label className={"erp-field-label"} htmlFor={"ADDRESS"}>
          Address
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <AutoGrowTextarea
          id={"ADDRESS"}
          name={"ADDRESS"}
          className={fieldClass(errors.ADDRESS, "erp-textarea")}
          placeholder={"Enter address"}
          value={values.ADDRESS}
          maxLength={500}
          required
          aria-invalid={Boolean(errors.ADDRESS)}
          aria-describedby={errors.ADDRESS ? "ADDRESS-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"ADDRESS-error"} message={errors.ADDRESS} />
      </div>

      <div>
        <label className={"erp-field-label"} htmlFor={"E_MAIL"}>
          Email
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <input
          id={"E_MAIL"}
          name={"E_MAIL"}
          type={"email"}
          className={fieldClass(errors.E_MAIL)}
          placeholder={"Enter email"}
          value={values.E_MAIL}
          maxLength={150}
          required
          aria-invalid={Boolean(errors.E_MAIL)}
          aria-describedby={errors.E_MAIL ? "E_MAIL-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"E_MAIL-error"} message={errors.E_MAIL} />
      </div>

      <div>
        <label className={"erp-field-label"} htmlFor={"MOBILE_NO"}>
          Mobile No
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        </label>
        <input
          id={"MOBILE_NO"}
          name={"MOBILE_NO"}
          type={"tel"}
          inputMode={"numeric"}
          className={fieldClass(errors.MOBILE_NO)}
          placeholder={"01XXXXXXXXX"}
          value={values.MOBILE_NO}
          maxLength={11}
          required
          aria-invalid={Boolean(errors.MOBILE_NO)}
          aria-describedby={errors.MOBILE_NO ? "MOBILE_NO-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"MOBILE_NO-error"} message={errors.MOBILE_NO} />
      </div>

      <div>
        <label className={"erp-field-label"} htmlFor={"WEB_ADDRESS"}>
          Web Address
        </label>
        <input
          id={"WEB_ADDRESS"}
          name={"WEB_ADDRESS"}
          type={"url"}
          className={fieldClass(errors.WEB_ADDRESS)}
          placeholder={"https://example.com"}
          value={values.WEB_ADDRESS}
          aria-invalid={Boolean(errors.WEB_ADDRESS)}
          aria-describedby={
            errors.WEB_ADDRESS ? "WEB_ADDRESS-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"WEB_ADDRESS-error"} message={errors.WEB_ADDRESS} />
      </div>

      <ImageUploadField
        name={"BU_LOGO"}
        title={"Business Unit Logo"}
        uploadLabel={"Upload Logo"}
        value={values.BU_LOGO}
        error={errors.BU_LOGO}
        onChange={onChange}
        inputRef={logoInputRef}
      />

      <div>
        <label className={"erp-field-label"} htmlFor={"REPORT_HEADER"}>
          Report Header
        </label>
        <AutoGrowTextarea
          id={"REPORT_HEADER"}
          name={"REPORT_HEADER"}
          className={fieldClass(errors.REPORT_HEADER, "erp-textarea")}
          value={values.REPORT_HEADER}
          maxLength={500}
          aria-invalid={Boolean(errors.REPORT_HEADER)}
          aria-describedby={
            errors.REPORT_HEADER ? "REPORT_HEADER-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"REPORT_HEADER-error"} message={errors.REPORT_HEADER} />
      </div>

      <div>
        <label className={"erp-field-label"} htmlFor={"REPORT_FOOTER"}>
          Report Footer
        </label>
        <AutoGrowTextarea
          id={"REPORT_FOOTER"}
          name={"REPORT_FOOTER"}
          className={fieldClass(errors.REPORT_FOOTER, "erp-textarea")}
          value={values.REPORT_FOOTER}
          maxLength={500}
          aria-invalid={Boolean(errors.REPORT_FOOTER)}
          aria-describedby={
            errors.REPORT_FOOTER ? "REPORT_FOOTER-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"REPORT_FOOTER-error"} message={errors.REPORT_FOOTER} />
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
    </div>
  );
}

export default BusinessUnitForm;
