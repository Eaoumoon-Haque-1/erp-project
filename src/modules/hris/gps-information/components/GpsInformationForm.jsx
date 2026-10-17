/**
 * @file Controlled form presentation for GPS Information.
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

function fieldClass(error, extra = "") {
  return ["erp-form-control", extra, error ? "erp-form-control-invalid" : ""]
    .filter(Boolean)
    .join(" ");
}

function RequiredLabel({ htmlFor, children }) {
  return (
    <label className={"erp-field-label"} htmlFor={htmlFor}>
      {children}
      <span className={"erp-required"} aria-hidden={"true"}>
        *
      </span>
    </label>
  );
}

function GpsInformationForm({
  values,
  errors,
  businessUnitOptions = [],
  businessUnitsLoading = false,
  onChange,
  businessUnitRef,
}) {
  return (
    <div className={"erp-form-grid"}>
      <div>
        <RequiredLabel htmlFor={"BU_ID"}>Business Unit</RequiredLabel>
        <select
          ref={businessUnitRef}
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

      <div>
        <RequiredLabel htmlFor={"LOCATION_NAME"}>Location Name</RequiredLabel>
        <input
          id={"LOCATION_NAME"}
          name={"LOCATION_NAME"}
          type={"number"}
          className={fieldClass(errors.LOCATION_NAME)}
          placeholder={"Enter location name"}
          value={values.LOCATION_NAME}
          maxLength={200}
          required
          aria-invalid={Boolean(errors.LOCATION_NAME)}
          aria-describedby={
            errors.LOCATION_NAME ? "LOCATION_NAME-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"LOCATION_NAME-error"} message={errors.LOCATION_NAME} />
      </div>

      <div>
        <RequiredLabel htmlFor={"LATITUDE"}>Latitude</RequiredLabel>
        <input
          id={"LATITUDE"}
          name={"LATITUDE"}
          type={"text"}
          className={fieldClass(errors.LATITUDE)}
          placeholder={"Enter latitude"}
          value={values.LATITUDE}
          min={"-90"}
          max={"90"}
          step={"any"}
          inputMode={"decimal"}
          required
          aria-invalid={Boolean(errors.LATITUDE)}
          aria-describedby={errors.LATITUDE ? "LATITUDE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"LATITUDE-error"} message={errors.LATITUDE} />
      </div>

      <div>
        <RequiredLabel htmlFor={"LONGITUDE"}>Longitude</RequiredLabel>
        <input
          id={"LONGITUDE"}
          name={"LONGITUDE"}
          type={"number"}
          className={fieldClass(errors.LONGITUDE)}
          placeholder={"Enter longitude"}
          value={values.LONGITUDE}
          min={"-180"}
          max={"180"}
          step={"any"}
          inputMode={"decimal"}
          required
          aria-invalid={Boolean(errors.LONGITUDE)}
          aria-describedby={errors.LONGITUDE ? "LONGITUDE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"LONGITUDE-error"} message={errors.LONGITUDE} />
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

export default GpsInformationForm;
