/**
 * @file Controlled form presentation for Office Notice.
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

function OfficeNoticeForm({
  values,
  errors,
  businessUnits,
  businessUnitRef,
  onChange,
}) {
  return (
    <div className={"erp-form-grid"}>
      <div>
        <Label htmlFor={"BG_ID"} required>
          Business Unit
        </Label>
        <select
          ref={businessUnitRef}
          id={"BG_ID"}
          name={"BG_ID"}
          className={fieldClass(errors.BG_ID)}
          value={values.BG_ID}
          required
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? "BG_ID-error" : undefined}
          onChange={onChange}
        >
          <option value={""}>--Select Business Unit--</option>
          {businessUnits.map((unit) => (
            <option key={unit.ID} value={unit.ID}>
              {unit.BUSINESS_UNIT}
            </option>
          ))}
        </select>
        <FieldError id={"BG_ID-error"} message={errors.BG_ID} />
      </div>

      <div>
        <Label htmlFor={"TITLE"} required>
          Title
        </Label>
        <input
          id={"TITLE"}
          name={"TITLE"}
          type={"text"}
          className={fieldClass(errors.TITLE)}
          placeholder={"Enter notice title"}
          value={values.TITLE}
          aria-invalid={Boolean(errors.TITLE)}
          aria-describedby={errors.TITLE ? "TITLE-error" : undefined}
          onChange={onChange}
        />
        <FieldError id={"TITLE-error"} message={errors.TITLE} />
      </div>

      <div>
        <Label htmlFor={"PUBLISH_DATE"} required>
          Publish Date
        </Label>
        <DateInput
          id={"PUBLISH_DATE"}
          name={"PUBLISH_DATE"}
          className={fieldClass(errors.PUBLISH_DATE)}
          value={values.PUBLISH_DATE}
          required
          aria-invalid={Boolean(errors.PUBLISH_DATE)}
          aria-describedby={
            errors.PUBLISH_DATE ? "PUBLISH_DATE-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError
          id={"PUBLISH_DATE-error"}
          message={errors.PUBLISH_DATE}
        />
      </div>

      <div>
        <Label htmlFor={"EXPIRE_DATE"} required>
          Expire Date
        </Label>
        <DateInput
          id={"EXPIRE_DATE"}
          name={"EXPIRE_DATE"}
          min={values.PUBLISH_DATE || undefined}
          className={fieldClass(errors.EXPIRE_DATE)}
          value={values.EXPIRE_DATE}
          required
          aria-invalid={Boolean(errors.EXPIRE_DATE)}
          aria-describedby={
            errors.EXPIRE_DATE ? "EXPIRE_DATE-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"EXPIRE_DATE-error"} message={errors.EXPIRE_DATE} />
      </div>

      <div>
        <Label htmlFor={"ATTACHMENT"}>Attachment</Label>
        <input
          id={"ATTACHMENT"}
          name={"ATTACHMENT"}
          type={"text"}
          className={fieldClass(errors.ATTACHMENT)}
          placeholder={"Enter attachment"}
          value={values.ATTACHMENT}
          aria-invalid={Boolean(errors.ATTACHMENT)}
          aria-describedby={
            errors.ATTACHMENT ? "ATTACHMENT-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"ATTACHMENT-error"} message={errors.ATTACHMENT} />
      </div>

      <div>
        <Label htmlFor={"IS_IMPORTANT"}>Is Important?</Label>
        <select
          id={"IS_IMPORTANT"}
          name={"IS_IMPORTANT"}
          className={fieldClass(errors.IS_IMPORTANT)}
          value={values.IS_IMPORTANT}
          aria-invalid={Boolean(errors.IS_IMPORTANT)}
          aria-describedby={
            errors.IS_IMPORTANT ? "IS_IMPORTANT-error" : undefined
          }
          onChange={onChange}
        >
          <option value={"0"}>No</option>
          <option value={"1"}>Yes</option>
        </select>
        <FieldError id={"IS_IMPORTANT-error"} message={errors.IS_IMPORTANT} />
      </div>

      <div>
        <Label htmlFor={"DESCRIPTION"}>Description</Label>
        <textarea
          id={"DESCRIPTION"}
          name={"DESCRIPTION"}
          rows={3}
          className={fieldClass(errors.DESCRIPTION, "erp-textarea")}
          placeholder={"Enter notice description"}
          value={values.DESCRIPTION}
          aria-invalid={Boolean(errors.DESCRIPTION)}
          aria-describedby={
            errors.DESCRIPTION ? "DESCRIPTION-error" : undefined
          }
          onChange={onChange}
        />
        <FieldError id={"DESCRIPTION-error"} message={errors.DESCRIPTION} />
      </div>

      <div>
        <span className={"erp-field-label"} aria-hidden={"true"}>
          &nbsp;
        </span>
        <label className={"erp-switch-field"}>
          <input
            id={"STATUS"}
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

export default OfficeNoticeForm;
