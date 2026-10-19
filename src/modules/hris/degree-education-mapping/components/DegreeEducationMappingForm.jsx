/**
 * @file Controlled form presentation for Degree Education Mapping.
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

function StatusBadge({ status }) {
  const isActive = String(status) === "1";
  return (
    <span
      className={[
        "inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm",
        isActive ? "bg-action-success" : "bg-action-danger",
      ].join(" ")}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function getEducationLevelLabel(levelId, levelOfEducationOptions) {
  return (
    levelOfEducationOptions.find(
      (option) => String(option.value) === String(levelId),
    )?.label ?? "â€”"
  );
}

function DegreeEducationMappingForm({
  levelOfEducationId,
  entryValues,
  errors,
  rows,
  degreeNameRef,
  onLevelChange,
  onEntryChange,
  onAdd,
  onRemove,
  levelOfEducationOptions = [],
  levelsLoading = false,
}) {
  return (
    <>
      <div className={"erp-form-grid"}>
        <div>
          <label className={"erp-field-label"} htmlFor={"LEVEL_OF_EDU_ID"}>
            Level of Education
            <span className={"erp-required"} aria-hidden={"true"}>*</span>
          </label>
          <select
            id={"LEVEL_OF_EDU_ID"}
            name={"LEVEL_OF_EDU_ID"}
            className={fieldClass(errors.LEVEL_OF_EDU_ID)}
            value={levelOfEducationId}
            required
            disabled={levelsLoading || rows.length > 0}
            aria-invalid={Boolean(errors.LEVEL_OF_EDU_ID)}
            aria-describedby={
              errors.LEVEL_OF_EDU_ID ? "LEVEL_OF_EDU_ID-error" : undefined
            }
            onChange={onLevelChange}
          >
            <option value={""}>{levelsLoading ? "Loading..." : "--Select Level of Education--"}</option>
            {levelOfEducationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError
            id={"LEVEL_OF_EDU_ID-error"}
            message={errors.LEVEL_OF_EDU_ID}
          />
        </div>
      </div>

      <div className={"erp-role-divider"} />

      <div className={"erp-degree-entry-grid"}>
        <div>
          <label className={"erp-field-label"} htmlFor={"DEGREE_NAME"}>
            Degree Name
            <span className={"erp-required"} aria-hidden={"true"}>*</span>
          </label>
          <input
            ref={degreeNameRef}
            id={"DEGREE_NAME"}
            name={"DEGREE_NAME"}
            type={"text"}
            className={fieldClass(errors.DEGREE_NAME)}
            placeholder={"Enter degree name"}
            value={entryValues.DEGREE_NAME}
            maxLength={50}
            required
            aria-invalid={Boolean(errors.DEGREE_NAME)}
            aria-describedby={
              errors.DEGREE_NAME ? "DEGREE_NAME-error" : undefined
            }
            onChange={onEntryChange}
          />
          <FieldError id={"DEGREE_NAME-error"} message={errors.DEGREE_NAME} />
        </div>

        <div>
          <label className={"erp-field-label"} htmlFor={"DEGREE_SHORT_NAME"}>
            Short Name
          </label>
          <input
            id={"DEGREE_SHORT_NAME"}
            name={"SHORT_NAME"}
            type={"text"}
            className={fieldClass(errors.SHORT_NAME)}
            placeholder={"Enter short name"}
            value={entryValues.SHORT_NAME}
            maxLength={5}
            aria-invalid={Boolean(errors.SHORT_NAME)}
            aria-describedby={
              errors.SHORT_NAME ? "DEGREE_SHORT_NAME-error" : undefined
            }
            onChange={onEntryChange}
          />
          <FieldError
            id={"DEGREE_SHORT_NAME-error"}
            message={errors.SHORT_NAME}
          />
        </div>

        <div>
          <label className={"erp-field-label"} htmlFor={"DEGREE_SORT_ORDER"}>
            Sort Order
          </label>
          <input
            id={"DEGREE_SORT_ORDER"}
            name={"SORT_ORDER"}
            type={"number"}
            className={fieldClass(errors.SORT_ORDER)}
            placeholder={"Enter sort order"}
            value={entryValues.SORT_ORDER}
            min={"0"}
            step={"any"}
            inputMode={"decimal"}
            aria-invalid={Boolean(errors.SORT_ORDER)}
            aria-describedby={
              errors.SORT_ORDER ? "DEGREE_SORT_ORDER-error" : undefined
            }
            onChange={onEntryChange}
          />
          <FieldError
            id={"DEGREE_SORT_ORDER-error"}
            message={errors.SORT_ORDER}
          />
        </div>

        <div>
          <span className={"erp-field-label"} aria-hidden={"true"}>&nbsp;</span>
          <label className={"erp-switch-field"}>
            <input
              className={"erp-switch-control"}
              type={"checkbox"}
              role={"switch"}
              name={"STATUS"}
              checked={entryValues.STATUS === "1"}
              onChange={onEntryChange}
            />
            <span>Is Active</span>
          </label>
        </div>

        <button
          type={"button"}
          className={"erp-role-add-button"}
          aria-label={"Add degree"}
          title={"Add degree"}
          onClick={onAdd}
        >
          <span aria-hidden={"true"}>+</span>
        </button>
      </div>

      <div className={"erp-role-divider"} />

      <h2 className={"erp-employee-section-title"}>Degree & Education Mapping List</h2>
      <div className={"erp-table-wrap"}>
        <table className={"erp-table"} data-table={"HR_DEGREE"}>
          <thead>
            <tr>
              <th className={"erp-number-column"}>#</th>
              <th>Education Level</th>
              <th>Degree Name</th>
              <th>Short Name</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={"erp-empty-cell"} colSpan={7}>
                  No degree has been added.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.ID}>
                  <td className={"erp-number-column"}>{index + 1}</td>
                  <td>{getEducationLevelLabel(row.LEVEL_OF_EDU_ID, levelOfEducationOptions)}</td>
                  <td>{row.DEGREE_NAME}</td>
                  <td>{row.SHORT_NAME || "â€”"}</td>
                  <td>{row.SORT_ORDER || "â€”"}</td>
                  <td><StatusBadge status={row.STATUS} /></td>
                  <td>
                    <button
                      type={"button"}
                      className={"erp-role-delete-button"}
                      aria-label={`Remove ${row.DEGREE_NAME}`}
                      title={"Remove"}
                      onClick={() => onRemove(row.ID)}
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
      <FieldError id={"DEGREES-error"} message={errors.DEGREES} />
    </>
  );
}

export default DegreeEducationMappingForm;
