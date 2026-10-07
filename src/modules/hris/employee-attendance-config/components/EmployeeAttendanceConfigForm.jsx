/**
 * @file Controlled form presentation for Employee Attendance Config.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import MultiSelectField from "../../../../components/shared/MultiSelectField";
import {
  EMPLOYEE_ATTENDANCE_GPS_TABLE,
  EMPLOYEE_ATTENDANCE_MACHINE_TABLE,
  EMPLOYEE_ATTENDANCE_WIFI_TABLE,
  mockEmployeeOptions,
  mockGpsOptions,
  mockShiftOptions,
  mockWifiOptions,
} from "../validation/employeeAttendanceConfigValidation";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={"erp-field-error"}>
      {message}
    </p>
  );
}

function fieldClass(error, disabled = false) {
  return [
    "erp-form-control",
    disabled ? "erp-readonly" : "",
    error ? "erp-form-control-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function FieldLabel({ htmlFor, required = false, children }) {
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

function ReadonlyField({ id, label, value }) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={"text"}
        className={"erp-form-control erp-readonly"}
        value={value || ""}
        readOnly
      />
    </div>
  );
}

function BinaryChoice({
  name,
  label,
  value,
  disabled = false,
  onChange,
}) {
  return (
    <div className={"erp-attendance-binary-field"}>
      <span className={"erp-attendance-binary-label"}>{label}</span>
      <div className={"erp-attendance-binary-options"}>
        {[
          { value: "1", label: "Yes" },
          { value: "0", label: "No" },
        ].map((option) => (
          <label key={option.value} className={"erp-attendance-radio-option"}>
            <input
              type={"radio"}
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={onChange}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DeleteButton({ label, onClick }) {
  return (
    <button
      type={"button"}
      className={"erp-attendance-remove-button"}
      aria-label={label}
      title={"Remove"}
      onClick={onClick}
    >
      ×
    </button>
  );
}

function EmployeeAttendanceConfigForm({
  values,
  errors,
  businessUnitRef,
  businessUnits = [],
  wifiRows = [],
  gpsRows = [],
  machineRows = [],
  activeTab,
  onTabChange,
  onChange,
  onShiftMultiSelectChange,
  onEmployeeChange,
  onPermissionChange,
  onWifiSelection,
  onGpsSelection,
  onMachineChange,
  onAddWifiRow,
  onRemoveWifiRow,
  onAddGpsRow,
  onRemoveGpsRow,
  onAddMachineRow,
  onRemoveMachineRow,
}) {
  const hasWifiPermission = values.ATTENDANCE_PERMISSIONS.includes("WiFi");
  const hasGpsPermission = values.ATTENDANCE_PERMISSIONS.includes("GPS");
  const hasMachinePermission =
    values.ATTENDANCE_PERMISSIONS.includes("Machine");
  const isGpsTrackingEnabled =
    hasGpsPermission && values.GPS_TRACKING === "1";
  const availableEmployees = mockEmployeeOptions.filter(
    (employee) => !values.BU_ID || employee.buId === values.BU_ID,
  );
  const availableWifi = mockWifiOptions.filter(
    (wifi) => !values.BU_ID || wifi.BU_ID === values.BU_ID,
  );
  const availableGps = mockGpsOptions.filter(
    (location) => !values.BU_ID || location.BU_ID === values.BU_ID,
  );

  return (
    <div className={"erp-attendance-config-form"}>
      <div className={"erp-attendance-summary-grid"}>
        <div>
          <FieldLabel htmlFor={"BU_ID"} required>
            Business Unit
          </FieldLabel>
          <select
            ref={businessUnitRef}
            id={"BU_ID"}
            name={"BU_ID"}
            className={fieldClass(errors.BU_ID)}
            value={values.BU_ID}
            required
            aria-invalid={Boolean(errors.BU_ID)}
            aria-describedby={errors.BU_ID ? "BU_ID-error" : undefined}
            onChange={onChange}
          >
            <option value={""}>--Select Business Unit--</option>
            {businessUnits.map((unit) => (
              <option key={unit.ID} value={unit.ID}>
                {unit.BUSINESS_UNIT}
              </option>
            ))}
          </select>
          <FieldError id={"BU_ID-error"} message={errors.BU_ID} />
        </div>

        <div>
          <FieldLabel htmlFor={"EMPLOYEE_ID"} required>
            Employee Name
          </FieldLabel>
          <select
            id={"EMPLOYEE_ID"}
            name={"EMPLOYEE_ID"}
            className={fieldClass(errors.EMPLOYEE_ID)}
            value={values.EMPLOYEE_ID}
            required
            disabled={!values.BU_ID}
            aria-invalid={Boolean(errors.EMPLOYEE_ID)}
            aria-describedby={
              errors.EMPLOYEE_ID ? "EMPLOYEE_ID-error" : undefined
            }
            onChange={onEmployeeChange}
          >
            <option value={""}>--Select Employee--</option>
            {availableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <FieldError id={"EMPLOYEE_ID-error"} message={errors.EMPLOYEE_ID} />
        </div>

        <ReadonlyField
          id={"EMPLOYEE_CODE"}
          label={"Employee ID"}
          value={values.EMPLOYEE_CODE}
        />
        <ReadonlyField
          id={"EMPLOYEE_TYPE"}
          label={"Employee Type"}
          value={values.EMPLOYEE_TYPE}
        />
        <ReadonlyField
          id={"DEPARTMENT_NAME"}
          label={"Department"}
          value={values.DEPARTMENT_NAME}
        />
        <ReadonlyField
          id={"DESIGNATION_NAME"}
          label={"Designation"}
          value={values.DESIGNATION_NAME}
        />
      </div>

      <section className={"erp-attendance-permission-section"}>
        <h2 className={"erp-attendance-block-title"}>
          Attendance Permission
        </h2>
        <div
          id={"ATTENDANCE_PERMISSION_GROUP"}
          className={[
            "erp-attendance-permission-control",
            "erp-attendance-permission-inline",
            errors.ATTENDANCE_PERMISSIONS ? "erp-form-control-invalid" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {["WiFi", "GPS", "Machine"].map((permission) => (
            <label key={permission} className={"erp-checkbox-field"}>
              <input
                type={"checkbox"}
                checked={values.ATTENDANCE_PERMISSIONS.includes(permission)}
                onChange={() => onPermissionChange(permission)}
              />
              <span>{permission}</span>
            </label>
          ))}
        </div>
        <FieldError
          id={"ATTENDANCE_PERMISSIONS-error"}
          message={errors.ATTENDANCE_PERMISSIONS}
        />
      </section>

      <div className={"erp-attendance-policy-grid"}>
        <section className={"erp-attendance-policy-column"}>
          <BinaryChoice
            name={"WIFI_FLEXIBLE"}
            label={"WiFi Flexibility:"}
            value={hasWifiPermission ? values.WIFI_FLEXIBLE : "0"}
            disabled={!hasWifiPermission}
            onChange={onChange}
          />
          <div className={"erp-attendance-policy-box"}>
            <BinaryChoice
              name={"WIFI_IN_FLEXIBLE"}
              label={"WiFi In Time Flexible:"}
              value={values.WIFI_IN_FLEXIBLE}
              disabled={!hasWifiPermission || values.WIFI_FLEXIBLE !== "1"}
              onChange={onChange}
            />
            <BinaryChoice
              name={"WIFI_OUT_FLEXIBLE"}
              label={"WiFi Out Time Flexible:"}
              value={values.WIFI_OUT_FLEXIBLE}
              disabled={!hasWifiPermission || values.WIFI_FLEXIBLE !== "1"}
              onChange={onChange}
            />
          </div>
        </section>

        <section className={"erp-attendance-policy-column"}>
          <BinaryChoice
            name={"GPS_FLEXIBLE"}
            label={"GPS Flexibility:"}
            value={hasGpsPermission ? values.GPS_FLEXIBLE : "0"}
            disabled={!hasGpsPermission}
            onChange={onChange}
          />
          <div className={"erp-attendance-policy-box"}>
            <BinaryChoice
              name={"GPS_IN_FLEXIBLE"}
              label={"GPS In Time Flexible:"}
              value={values.GPS_IN_FLEXIBLE}
              disabled={!hasGpsPermission || values.GPS_FLEXIBLE !== "1"}
              onChange={onChange}
            />
            <BinaryChoice
              name={"GPS_OUT_FLEXIBLE"}
              label={"GPS Out Time Flexible:"}
              value={values.GPS_OUT_FLEXIBLE}
              disabled={!hasGpsPermission || values.GPS_FLEXIBLE !== "1"}
              onChange={onChange}
            />
          </div>
        </section>

        <section className={"erp-attendance-policy-column"}>
          <BinaryChoice
            name={"GPS_TRACKING"}
            label={"Is GPS Tracking?"}
            value={hasGpsPermission ? values.GPS_TRACKING : "0"}
            disabled={!hasGpsPermission}
            onChange={onChange}
          />
          <div className={"erp-attendance-policy-box erp-attendance-tracking-box"}>
            <div>
              <FieldLabel
                htmlFor={"TRACKING_FROM_TIME"}
                required={isGpsTrackingEnabled}
              >
                Tracking From Time
              </FieldLabel>
              <input
                id={"TRACKING_FROM_TIME"}
                name={"TRACKING_FROM_TIME"}
                type={"time"}
                className={fieldClass(
                  errors.TRACKING_FROM_TIME,
                  !isGpsTrackingEnabled,
                )}
                value={values.TRACKING_FROM_TIME}
                required={isGpsTrackingEnabled}
                disabled={!isGpsTrackingEnabled}
                aria-invalid={Boolean(errors.TRACKING_FROM_TIME)}
                aria-describedby={
                  errors.TRACKING_FROM_TIME
                    ? "TRACKING_FROM_TIME-error"
                    : undefined
                }
                onChange={onChange}
              />
              <FieldError
                id={"TRACKING_FROM_TIME-error"}
                message={errors.TRACKING_FROM_TIME}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor={"TRACKING_TO_TIME"}
                required={isGpsTrackingEnabled}
              >
                Tracking To Time
              </FieldLabel>
              <input
                id={"TRACKING_TO_TIME"}
                name={"TRACKING_TO_TIME"}
                type={"time"}
                className={fieldClass(
                  errors.TRACKING_TO_TIME,
                  !isGpsTrackingEnabled,
                )}
                value={values.TRACKING_TO_TIME}
                required={isGpsTrackingEnabled}
                disabled={!isGpsTrackingEnabled}
                aria-invalid={Boolean(errors.TRACKING_TO_TIME)}
                aria-describedby={
                  errors.TRACKING_TO_TIME
                    ? "TRACKING_TO_TIME-error"
                    : undefined
                }
                onChange={onChange}
              />
              <FieldError
                id={"TRACKING_TO_TIME-error"}
                message={errors.TRACKING_TO_TIME}
              />
            </div>
          </div>
        </section>
      </div>

      <div className={"erp-attendance-shift-grid"}>
        <div>
          <FieldLabel htmlFor={"SHIFT_MODE"} required>
            Attendance Shift
          </FieldLabel>
          <div className={"erp-attendance-permission-control"}>
            {["Single", "Multiple"].map((mode) => (
              <label key={mode} className={"erp-checkbox-field"}>
                <input
                  type={"radio"}
                  name={"SHIFT_MODE"}
                  value={mode}
                  checked={values.SHIFT_MODE === mode}
                  onChange={onChange}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </div>
        {values.SHIFT_MODE === "Multiple" ? (
          <MultiSelectField
            id={"SHIFT_ID"}
            name={"SHIFT_ID"}
            label={"Shift Name"}
            placeholder={"--Select Shifts--"}
            options={mockShiftOptions}
            value={Array.isArray(values.SHIFT_ID) ? values.SHIFT_ID : []}
            error={errors.SHIFT_ID}
            required
            onChange={onShiftMultiSelectChange}
          />
        ) : (
          <div>
            <FieldLabel htmlFor={"SHIFT_ID"} required>
              Shift Name
            </FieldLabel>
            <select
              id={"SHIFT_ID"}
              name={"SHIFT_ID"}
              className={fieldClass(errors.SHIFT_ID)}
              value={Array.isArray(values.SHIFT_ID) ? "" : values.SHIFT_ID}
              required
              aria-invalid={Boolean(errors.SHIFT_ID)}
              aria-describedby={errors.SHIFT_ID ? "SHIFT_ID-error" : undefined}
              onChange={onChange}
            >
              <option value={""}>--Select Shift--</option>
              {mockShiftOptions.map((shift) => (
                <option key={shift.value} value={shift.value}>
                  {shift.label}
                </option>
              ))}
            </select>
            <FieldError id={"SHIFT_ID-error"} message={errors.SHIFT_ID} />
          </div>
        )}
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

      <section className={"erp-attendance-config-tabs erp-employee-tabs"}>
        <div
          className={"erp-employee-tab-list"}
          role={"tablist"}
          aria-label={"Attendance configuration details"}
        >
          {[
            { key: "wifi", label: "WiFi" },
            { key: "gps", label: "GPS" },
            { key: "machine", label: "Machine" },
          ].map((tab) => (
            <button
              key={tab.key}
              type={"button"}
              role={"tab"}
              className={[
                "erp-employee-tab",
                activeTab === tab.key ? "erp-employee-tab-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-selected={activeTab === tab.key}
              aria-controls={`attendance-config-tab-${tab.key}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id={`attendance-config-tab-${activeTab}`}
          className={"erp-employee-tab-panel"}
          role={"tabpanel"}
        >
          {activeTab === "wifi" ? (
            <>
              <div className={"erp-employee-attendance-table-wrap"}>
                <table
                  className={"erp-table erp-employee-attendance-table"}
                  data-table={EMPLOYEE_ATTENDANCE_WIFI_TABLE}
                >
                  <thead>
                    <tr>
                      <th className={"erp-number-column"}>#</th>
                      <th>WiFi Name</th>
                      <th>MAC Address</th>
                      <th className={"erp-attendance-status-column"}>Status</th>
                      <th className={"erp-action-column"}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wifiRows.map((row, index) => (
                      <tr key={row.CLIENT_ID}>
                        <td className={"erp-number-column"}>{index + 1}</td>
                        <td>
                          <select
                            className={"erp-form-control"}
                            value={row.WIFI_ID}
                            disabled={!hasWifiPermission || !values.BU_ID}
                            onChange={(event) =>
                              onWifiSelection(index, event.target.value)
                            }
                          >
                            <option value={""}>--Select WiFi--</option>
                            {availableWifi.map((wifi) => (
                              <option key={wifi.ID} value={wifi.ID}>
                                {wifi.WIFI_NAME}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{row.MAC_ADDRESS}</td>
                        <td className={"erp-attendance-status-column"}>
                          {row.STATUS}
                        </td>
                        <td className={"erp-action-column"}>
                          <DeleteButton
                            label={`Remove WiFi row ${index + 1}`}
                            onClick={() => onRemoveWifiRow(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <FieldError id={"WIFI_ROWS-error"} message={errors.WIFI_ROWS} />
              <button
                type={"button"}
                className={"primary-button erp-attendance-table-add-button"}
                disabled={!hasWifiPermission}
                onClick={onAddWifiRow}
              >
                + Add More
              </button>
            </>
          ) : activeTab === "gps" ? (
            <>
              <div className={"erp-employee-attendance-table-wrap"}>
                <table
                  className={"erp-table erp-employee-attendance-table"}
                  data-table={EMPLOYEE_ATTENDANCE_GPS_TABLE}
                >
                  <thead>
                    <tr>
                      <th className={"erp-number-column"}>#</th>
                      <th>Location Name</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th className={"erp-attendance-status-column"}>Status</th>
                      <th className={"erp-action-column"}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gpsRows.map((row, index) => (
                      <tr key={row.CLIENT_ID}>
                        <td className={"erp-number-column"}>{index + 1}</td>
                        <td>
                          <select
                            className={"erp-form-control"}
                            value={row.LOCATION_ID}
                            disabled={!hasGpsPermission || !values.BU_ID}
                            onChange={(event) =>
                              onGpsSelection(index, event.target.value)
                            }
                          >
                            <option value={""}>--Select Location--</option>
                            {availableGps.map((location) => (
                              <option key={location.ID} value={location.ID}>
                                {location.LOCATION_NAME}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{row.LATITUDE}</td>
                        <td>{row.LONGITUDE}</td>
                        <td className={"erp-attendance-status-column"}>
                          {row.STATUS}
                        </td>
                        <td className={"erp-action-column"}>
                          <DeleteButton
                            label={`Remove GPS row ${index + 1}`}
                            onClick={() => onRemoveGpsRow(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <FieldError id={"GPS_ROWS-error"} message={errors.GPS_ROWS} />
              <button
                type={"button"}
                className={"primary-button erp-attendance-table-add-button"}
                disabled={!hasGpsPermission}
                onClick={onAddGpsRow}
              >
                + Add More
              </button>
            </>
          ) : (
            <>
              <div className={"erp-employee-attendance-table-wrap"}>
                <table
                  className={"erp-table erp-employee-attendance-table"}
                  data-table={EMPLOYEE_ATTENDANCE_MACHINE_TABLE}
                >
                  <thead>
                    <tr>
                      <th className={"erp-number-column"}>#</th>
                      <th>Machine ID</th>
                      <th>IP Address</th>
                      <th className={"erp-action-column"}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineRows.map((row, index) => (
                      <tr key={row.CLIENT_ID}>
                        <td className={"erp-number-column"}>{index + 1}</td>
                        <td>
                          <input
                            type={"text"}
                            className={"erp-form-control"}
                            value={row.MACHINE_ID}
                            placeholder={"Enter machine ID"}
                            disabled={!hasMachinePermission}
                            onChange={(event) =>
                              onMachineChange(
                                index,
                                "MACHINE_ID",
                                event.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type={"text"}
                            className={"erp-form-control"}
                            value={row.IP_ADDRESS}
                            placeholder={"Enter IP address"}
                            disabled={!hasMachinePermission}
                            onChange={(event) =>
                              onMachineChange(
                                index,
                                "IP_ADDRESS",
                                event.target.value,
                              )
                            }
                          />
                        </td>
                        <td className={"erp-action-column"}>
                          <DeleteButton
                            label={`Remove Machine row ${index + 1}`}
                            onClick={() => onRemoveMachineRow(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <FieldError
                id={"MACHINE_ROWS-error"}
                message={errors.MACHINE_ROWS}
              />
              <button
                type={"button"}
                className={"primary-button erp-attendance-table-add-button"}
                disabled={!hasMachinePermission}
                onClick={onAddMachineRow}
              >
                + Add More
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default EmployeeAttendanceConfigForm;
