/**
 * @file Controlled form presentation for Office Calendar.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import MultiSelectField from "../../../../components/shared/MultiSelectField";
import { formatDateForDisplay } from "../../../../utils/dateFormat";

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

function OfficeCalendarForm({
  values,
  rows,
  errors,
  rowErrors,
  businessUnitOptions,
  referencesLoading = false,
  allowMultipleBusinessUnits = true,
  months,
  eventTypes,
  businessUnitRef,
  onChange,
  onBusinessUnitChange,
  onRowChange,
}) {
  return (
    <>
      <div className={"erp-form-grid erp-office-calendar-header-grid"}>
        {allowMultipleBusinessUnits ? (
          <MultiSelectField
            id={"BU_ID"}
            name={"BU_ID"}
            label={"Business Unit"}
            placeholder={"--Select Business Unit--"}
            options={businessUnitOptions}
            value={values.BU_ID}
            error={errors.BU_ID}
            disabled={referencesLoading}
            required
            inputRef={businessUnitRef}
            onChange={onBusinessUnitChange}
          />
        ) : (
          <div>
            <RequiredLabel htmlFor={"BU_ID"}>Business Unit</RequiredLabel>
            <select
              ref={businessUnitRef}
              id={"BU_ID"}
              name={"BU_ID"}
              className={fieldClass(errors.BU_ID)}
              value={values.BU_ID[0] ?? ""}
              disabled={referencesLoading}
              required
              aria-invalid={Boolean(errors.BU_ID)}
              onChange={(event) => onBusinessUnitChange("BU_ID", event.target.value ? [event.target.value] : [])}
            >
              <option value={""}>--Select Business Unit--</option>
              {businessUnitOptions.map((unit) => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
            <FieldError id={"BU_ID-error"} message={errors.BU_ID} />
          </div>
        )}

        <div>
          <RequiredLabel htmlFor={"YEAR"}>Year</RequiredLabel>
          <input
            id={"YEAR"}
            name={"YEAR"}
            type={"text"}
            inputMode={"numeric"}
            className={fieldClass(errors.YEAR)}
            placeholder={"Enter year"}
            value={values.YEAR}
            maxLength={4}
            required
            aria-invalid={Boolean(errors.YEAR)}
            aria-describedby={errors.YEAR ? "YEAR-error" : undefined}
            onChange={onChange}
          />
          <FieldError id={"YEAR-error"} message={errors.YEAR} />
        </div>

        <div>
          <RequiredLabel htmlFor={"MONTH_ID"}>Month</RequiredLabel>
          <select
            id={"MONTH_ID"}
            name={"MONTH_ID"}
            className={fieldClass(errors.MONTH_ID)}
            value={values.MONTH_ID}
            required
            aria-invalid={Boolean(errors.MONTH_ID)}
            aria-describedby={errors.MONTH_ID ? "MONTH_ID-error" : undefined}
            onChange={onChange}
          >
            <option value={""}>--Select Month--</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <FieldError id={"MONTH_ID-error"} message={errors.MONTH_ID} />
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

      <div className={"erp-office-calendar-table-wrap"}>
        <table className={"erp-table erp-office-calendar-table"}>
          <thead>
            <tr>
              <th className={"erp-number-column"}>#</th>
              <th>Date</th>
              <th>Day</th>
              <th>
                Event Type
                <span className={"erp-required"} aria-hidden={"true"}>
                  *
                </span>
              </th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={"erp-empty-cell"} colSpan={5}>
                  Select a four-digit Year and Month to display the calendar.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const currentErrors = rowErrors[row.CALENDER_DATE] ?? {};
                return (
                  <tr key={row.CALENDER_DATE}>
                    <td className={"erp-number-column"}>{index + 1}</td>
                    <td>
                      <input
                        type={"hidden"}
                        name={`DETAILS[${index}][CALENDER_DATE]`}
                        value={row.CALENDER_DATE}
                      />
                      <span className={"erp-calendar-readonly-value"}>
                        {formatDateForDisplay(row.CALENDER_DATE)}
                      </span>
                    </td>
                    <td>
                      <input
                        type={"hidden"}
                        name={`DETAILS[${index}][CALENDER_DAY]`}
                        value={row.CALENDER_DAY}
                      />
                      <span className={"erp-calendar-readonly-value"}>
                        {row.CALENDER_DAY}
                      </span>
                    </td>
                    <td>
                      <select
                        name={`DETAILS[${index}][EVENT_TYPE_ID]`}
                        className={fieldClass(currentErrors.EVENT_TYPE_ID)}
                        value={row.EVENT_TYPE_ID}
                        disabled={referencesLoading}
                        aria-label={`Event Type for ${formatDateForDisplay(
                          row.CALENDER_DATE,
                        )}`}
                        aria-invalid={Boolean(currentErrors.EVENT_TYPE_ID)}
                        onChange={(event) =>
                          onRowChange(
                            row.CALENDER_DATE,
                            "EVENT_TYPE_ID",
                            event.target.value,
                          )
                        }
                      >
                        <option value={""}>--Select Event Type--</option>
                        {eventTypes.map((eventType) => (
                          <option
                            key={eventType.value}
                            value={eventType.value}
                          >
                            {eventType.label}
                          </option>
                        ))}
                      </select>
                      <FieldError
                        id={`${row.CALENDER_DATE}-EVENT_TYPE_ID-error`}
                        message={currentErrors.EVENT_TYPE_ID}
                      />
                    </td>
                    <td>
                      <textarea
                        name={`DETAILS[${index}][REMARKS]`}
                        rows={1}
                        className={"erp-form-control erp-textarea"}
                        value={row.REMARKS}
                        aria-label={`Remarks for ${formatDateForDisplay(
                          row.CALENDER_DATE,
                        )}`}
                        onChange={(event) =>
                          onRowChange(
                            row.CALENDER_DATE,
                            "REMARKS",
                            event.target.value,
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <FieldError id={"DETAILS-error"} message={errors.DETAILS} />
      </div>
    </>
  );
}

export default OfficeCalendarForm;
