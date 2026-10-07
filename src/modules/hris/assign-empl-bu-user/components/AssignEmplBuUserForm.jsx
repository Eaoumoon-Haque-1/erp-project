/**
 * @file Controlled form presentation for Assign Empl BU User.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import UserAssignmentTabs from "../../../../components/shared/UserAssignmentTabs";
import {
  mockBusinessUnitOptions,
  mockDepartmentOptions,
  mockDesignationOptions,
  mockEmployeeListOptions,
  mockUserOptions,
} from "../validation/assignEmplBuUserValidation";

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

function RequiredLabel({ htmlFor, children }) {
  return (
    <label className={"erp-field-label"} htmlFor={htmlFor}>
      {children}
      <span className={"erp-required"} aria-hidden={"true"}>*</span>
    </label>
  );
}

function AssignEmplBuUserForm({
  values,
  errors,
  businessGroup,
  onChange,
  employeeRows = [],
  buRows = [],
  onAddEmployeeRow,
  onRemoveEmployeeRow,
  onAddBuRow,
  onRemoveBuRow,
  activeTab,
  onTabChange,
}) {
  return (
    <div className={"erp-assign-empl-bu-user-form space-y-4"}>
      <div className={"erp-form-grid"}>
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
          />
        </div>

        <div>
          <RequiredLabel htmlFor={"BU_ID"}>Business Unit</RequiredLabel>
          <select
            id={"BU_ID"}
            name={"BU_ID"}
            className={fieldClass(errors.BU_ID)}
            value={values.BU_ID}
            onChange={onChange}
          >
            <option value={""}>Select Business Unit...</option>
            {mockBusinessUnitOptions.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
          <FieldError id={"BU_ID-error"} message={errors.BU_ID} />
        </div>

        <div>
          <RequiredLabel htmlFor={"DEPT_ID"}>Department Name</RequiredLabel>
          <select
            id={"DEPT_ID"}
            name={"DEPT_ID"}
            className={fieldClass(errors.DEPT_ID)}
            value={values.DEPT_ID}
            onChange={onChange}
          >
            <option value={""}>Select Department...</option>
            {mockDepartmentOptions.map((department) => (
              <option key={department.value} value={department.value}>
                {department.label}
              </option>
            ))}
          </select>
          <FieldError id={"DEPT_ID-error"} message={errors.DEPT_ID} />
        </div>

        <div>
          <RequiredLabel htmlFor={"DESIG_ID"}>Designation Name</RequiredLabel>
          <select
            id={"DESIG_ID"}
            name={"DESIG_ID"}
            className={fieldClass(errors.DESIG_ID)}
            value={values.DESIG_ID}
            onChange={onChange}
          >
            <option value={""}>Select Designation...</option>
            {mockDesignationOptions.map((designation) => (
              <option key={designation.value} value={designation.value}>
                {designation.label}
              </option>
            ))}
          </select>
          <FieldError id={"DESIG_ID-error"} message={errors.DESIG_ID} />
        </div>

        <div>
          <RequiredLabel htmlFor={"USER_ID"}>User Name</RequiredLabel>
          <select
            id={"USER_ID"}
            name={"USER_ID"}
            className={fieldClass(errors.USER_ID)}
            value={values.USER_ID}
            onChange={onChange}
          >
            <option value={""}>Select User...</option>
            {mockUserOptions.map((user) => (
              <option key={user.value} value={user.value}>
                {user.label}
              </option>
            ))}
          </select>
          <FieldError id={"USER_ID-error"} message={errors.USER_ID} />
        </div>
      </div>

      <UserAssignmentTabs
        employeeOptions={mockEmployeeListOptions}
        businessUnitOptions={mockBusinessUnitOptions}
        employeeRows={employeeRows}
        businessUnitRows={buRows}
        activeTab={activeTab}
        generalError={errors.GENERAL}
        onTabChange={onTabChange}
        onAddEmployee={onAddEmployeeRow}
        onRemoveEmployee={onRemoveEmployeeRow}
        onAddBusinessUnit={onAddBuRow}
        onRemoveBusinessUnit={onRemoveBuRow}
      />
    </div>
  );
}

export default AssignEmplBuUserForm;
