/**
 * @file Controlled form presentation for WiFi Information.
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

function WifiInformationForm({
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
        <RequiredLabel htmlFor={"WIFI_NAME"}>WiFi Name</RequiredLabel>
        <input
          id={"WIFI_NAME"}
          name={"WIFI_NAME"}
          type={"text"}
          className={fieldClass(errors.WIFI_NAME)}
          placeholder={"Enter WiFi name"}
          value={values.WIFI_NAME}
          maxLength={100}
          aria-invalid={Boolean(errors.WIFI_NAME)}
          aria-describedby={errors.WIFI_NAME ? "WIFI_NAME-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"WIFI_NAME-error"} message={errors.WIFI_NAME} />
      </div>

      <div>
        <RequiredLabel htmlFor={"MAC_ADDRESS"}>MAC Address</RequiredLabel>
        <input
          id={"MAC_ADDRESS"}
          name={"MAC_ADDRESS"}
          type={"text"}
          className={fieldClass(errors.MAC_ADDRESS)}
          placeholder={"Enter MAC address"}
          value={values.MAC_ADDRESS}
          maxLength={100}
          aria-invalid={Boolean(errors.MAC_ADDRESS)}
          aria-describedby={
            errors.MAC_ADDRESS ? "MAC_ADDRESS-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"MAC_ADDRESS-error"} message={errors.MAC_ADDRESS} />
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

export default WifiInformationForm;
