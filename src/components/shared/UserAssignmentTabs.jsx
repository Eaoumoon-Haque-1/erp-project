/**
 * @file Shared reusable UI/workflow component: UserAssignmentTabs.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { useState } from "react";

function FieldError({ message }) {
  if (!message) return null;
  return <p className={"erp-field-error"}>{message}</p>;
}

function fieldClass(error) {
  return [
    "erp-form-control",
    error ? "erp-form-control-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function RemoveButton({ label, onClick }) {
  return (
    <button
      type={"button"}
      className={
        "inline-flex size-8 items-center justify-center rounded bg-[#fa5c70] font-bold text-white shadow-sm transition-colors hover:bg-[#e04b5f]"
      }
      aria-label={label}
      title={"Remove"}
      onClick={onClick}
    >
      <span aria-hidden={"true"}>×</span>
    </button>
  );
}

function UserAssignmentTabs({
  employeeOptions,
  businessUnitOptions,
  employeeRows,
  businessUnitRows,
  maxEmployeeAssignments = Number.POSITIVE_INFINITY,
  showEmployeeStatus = true,
  showEmployeeHistory = false,
  activeTab,
  generalError,
  onTabChange,
  onAddEmployee,
  onAddBusinessUnit,
  onRemoveBusinessUnit,
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState("1");
  const [employeeError, setEmployeeError] = useState("");
  const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState("");
  const [businessUnitStatus, setBusinessUnitStatus] = useState("1");
  const [businessUnitError, setBusinessUnitError] = useState("");

  const handleAddEmployee = () => {
    if (!selectedEmployeeId) {
      setEmployeeError("Please select an Employee to add.");
      return;
    }
    const employee = employeeOptions.find(
      (option) => option.value === selectedEmployeeId,
    );
    if (!employee) return;
    if (employeeRows.some((row) => (
      row.EMPL_ID === selectedEmployeeId && String(row.STATUS) === "1"
    ))) {
      setEmployeeError("This Employee already has an active assignment.");
      return;
    }
    if (employeeRows.length >= maxEmployeeAssignments) {
      setEmployeeError("Only one Employee can be assigned to a User.");
      return;
    }

    onAddEmployee({
      id: `employee-map-${Date.now()}`,
      EMPL_ID: employee.value,
      CODE: employee.code,
      NAME: employee.name,
      BG_ID: employee.bgId ?? "",
      BU_ID: employee.buId ?? "",
      DEPT_ID: employee.deptId ?? "",
      DESIG_ID: employee.desigId ?? "",
      STATUS: showEmployeeStatus ? employeeStatus : "1",
      IS_CURRENT: "1",
      DISPLAY_NAME:
        employee.label ??
        `${employee.name ?? employee.value} (${employee.value})`,
    });
    setSelectedEmployeeId("");
    setEmployeeStatus("1");
    setEmployeeError("");
  };

  const handleAddBusinessUnit = () => {
    if (!selectedBusinessUnitId) {
      setBusinessUnitError("Please select a Business Unit to add.");
      return;
    }
    const businessUnit = businessUnitOptions.find(
      (option) => option.value === selectedBusinessUnitId,
    );
    if (!businessUnit) return;
    if (
      businessUnitRows.some((row) => row.BU_ID === selectedBusinessUnitId)
    ) {
      setBusinessUnitError("This Business Unit is already assigned.");
      return;
    }

    onAddBusinessUnit({
      id: `business-unit-map-${Date.now()}`,
      BU_ID: businessUnit.value,
      NAME: businessUnit.label,
      STATUS: businessUnitStatus,
    });
    setSelectedBusinessUnitId("");
    setBusinessUnitStatus("1");
    setBusinessUnitError("");
  };

  return (
    <section className={"erp-employee-card erp-employee-tabs mt-6"}>
      <div
        className={"erp-employee-tab-list"}
        role={"tablist"}
        aria-label={"Assign Employee and Business Unit tabs"}
      >
        {[
          { key: "employee", label: "Assign Employee" },
          { key: "bu", label: "Assign Business Unit" },
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
            aria-controls={`user-assignment-panel-${tab.key}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className={"erp-employee-tab-panel"}
        id={`user-assignment-panel-${activeTab}`}
        role={"tabpanel"}
      >
        {activeTab === "employee" ? (
          <div className={"space-y-4"}>
            <div className={"flex max-w-xl items-end gap-6"}>
              <div className={"flex-1"}>
                <label className={"erp-field-label"} htmlFor={"ASSIGN_EMPLOYEE_ID"}>
                  Employee
                </label>
                <select
                  id={"ASSIGN_EMPLOYEE_ID"}
                  className={fieldClass(employeeError)}
                  value={selectedEmployeeId}
                  onChange={(event) => {
                    setSelectedEmployeeId(event.target.value);
                    setEmployeeError("");
                  }}
                >
                  <option value={""}>Select Employee...</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee.value} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>
              {showEmployeeStatus && <div>
                <span className={"erp-field-label"} aria-hidden={"true"}>
                  &nbsp;
                </span>
                <label className={"erp-switch-field cursor-pointer"}>
                  <input
                    className={"erp-switch-control"}
                    type={"checkbox"}
                    role={"switch"}
                    checked={employeeStatus === "1"}
                    onChange={(event) =>
                      setEmployeeStatus(event.target.checked ? "1" : "0")
                    }
                  />
                  <span>Is Active?</span>
                </label>
              </div>}
            </div>
            <FieldError message={employeeError} />

            <div className={"erp-employee-attendance-table-wrap"}>
              <table className={"erp-table erp-employee-attendance-table"}>
                <thead>
                  <tr>
                    <th className={"w-[60px]"}>#</th>
                    <th className={showEmployeeHistory ? "w-[43%]" : undefined}>Employee Name</th>
                    {showEmployeeHistory && <th className={"w-[19%]"}>Active From</th>}
                    {showEmployeeHistory && <th className={"w-[19%]"}>Active To</th>}
                    {(showEmployeeStatus || showEmployeeHistory) && (
                      <th className={showEmployeeHistory ? "w-[19%]" : "w-[150px]"}>Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {employeeRows.length === 0 ? (
                    <tr>
                      <td className={"erp-empty-cell"} colSpan={showEmployeeHistory ? 5 : showEmployeeStatus ? 3 : 2}>
                        No employee assigned
                      </td>
                    </tr>
                  ) : (
                    employeeRows.map((row, index) => (
                      <tr key={row.id ?? `${row.EMPL_ID}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{row.DISPLAY_NAME || row.NAME}</td>
                        {showEmployeeHistory && <td>{row.ACTIVE_FROM || 'N/A'}</td>}
                        {showEmployeeHistory && <td>{row.ACTIVE_TO || '—'}</td>}
                        {(showEmployeeStatus || showEmployeeHistory) && <td>
                          <span
                            className={[
                              "inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm",
                              row.STATUS === "1"
                                ? "bg-action-success"
                                : "bg-action-danger",
                            ].join(" ")}
                          >
                            {row.STATUS === "1" ? "Active" : "Inactive"}
                          </span>
                        </td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              type={"button"}
              className={"primary-button erp-add-row-button"}
              onClick={handleAddEmployee}
            >
              + Add More
            </button>
          </div>
        ) : (
          <div className={"space-y-4"}>
            <div className={"flex max-w-xl items-end gap-6"}>
              <div className={"flex-1"}>
                <label className={"erp-field-label"} htmlFor={"ASSIGN_BUSINESS_UNIT_ID"}>
                  Business Unit
                </label>
                <select
                  id={"ASSIGN_BUSINESS_UNIT_ID"}
                  className={fieldClass(businessUnitError)}
                  value={selectedBusinessUnitId}
                  onChange={(event) => {
                    setSelectedBusinessUnitId(event.target.value);
                    setBusinessUnitError("");
                  }}
                >
                  <option value={""}>Select Business Unit...</option>
                  {businessUnitOptions.map((businessUnit) => (
                    <option
                      key={businessUnit.value}
                      value={businessUnit.value}
                    >
                      {businessUnit.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className={"erp-field-label"} aria-hidden={"true"}>
                  &nbsp;
                </span>
                <label className={"erp-switch-field cursor-pointer"}>
                  <input
                    className={"erp-switch-control"}
                    type={"checkbox"}
                    role={"switch"}
                    checked={businessUnitStatus === "1"}
                    onChange={(event) =>
                      setBusinessUnitStatus(event.target.checked ? "1" : "0")
                    }
                  />
                  <span>Is Active?</span>
                </label>
              </div>
            </div>
            <FieldError message={businessUnitError} />

            <div className={"erp-employee-attendance-table-wrap"}>
              <table className={"erp-table erp-employee-attendance-table"}>
                <thead>
                  <tr>
                    <th className={"w-[60px]"}>#</th>
                    <th>Business Unit</th>
                    <th className={"w-[150px]"}>Status</th>
                    <th className={"w-[100px] text-center"}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {businessUnitRows.length === 0 ? (
                    <tr>
                      <td className={"erp-empty-cell"} colSpan={4}>
                        No business unit assigned
                      </td>
                    </tr>
                  ) : (
                    businessUnitRows.map((row, index) => (
                      <tr key={row.id ?? `${row.BU_ID}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{row.NAME}</td>
                        <td>
                          <span
                            className={[
                              "inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm",
                              row.STATUS === "1"
                                ? "bg-action-success"
                                : "bg-action-danger",
                            ].join(" ")}
                          >
                            {row.STATUS === "1" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className={"text-center"}>
                          <RemoveButton
                            label={`Remove ${row.NAME}`}
                            onClick={() => onRemoveBusinessUnit(index)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              type={"button"}
              className={"primary-button erp-add-row-button"}
              onClick={handleAddBusinessUnit}
            >
              + Add More
            </button>
          </div>
        )}
      </div>
      <FieldError message={generalError} />
    </section>
  );
}

export default UserAssignmentTabs;
