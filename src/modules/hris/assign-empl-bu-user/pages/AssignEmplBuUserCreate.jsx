/**
 * @file Create-page controller for Assign Empl BU User.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import AssignEmplBuUserForm from "../components/AssignEmplBuUserForm";
import {
  ASSIGN_EMPL_BU_USER_TABLE,
  initialAssignEmplBuUserValues,
  temporaryAssignBusinessGroup,
  validateAssignEmplBuUser,
} from "../validation/assignEmplBuUserValidation";

function AssignEmplBuUserCreate() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialAssignEmplBuUserValues);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("employee");
  const [employeeRows, setEmployeeRows] = useState([]);
  const [buRows, setBuRows] = useState([]);

  const handleChange = (event) => {
    if (!event || !event.target) return;
    const { name, type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? (checked ? "1" : "0") : value;
    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined, GENERAL: undefined }));
  };

  const handleAddEmployeeRow = (newRow) => {
    setEmployeeRows((current) => [...current, newRow]);
    setErrors((current) => ({ ...current, GENERAL: undefined }));
  };

  const handleRemoveEmployeeRow = (indexToRemove) => {
    setEmployeeRows((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAddBuRow = (newRow) => {
    setBuRows((current) => [...current, newRow]);
    setErrors((current) => ({ ...current, GENERAL: undefined }));
  };

  const handleRemoveBuRow = (indexToRemove) => {
    setBuRows((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateAssignEmplBuUser(values, employeeRows, buRows);

    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      return;
    }

    navigate("/hris/employee-settings/assign-empl-bu-user");
  };

  const handleReset = () => {
    setValues(initialAssignEmplBuUserValues);
    setErrors({});
    setActiveTab("employee");
    setEmployeeRows([]);
    setBuRows([]);
  };

  return (
    <FormPage
      title={"Assign Empl and BU to User"}
      listTo={"/hris/employee-settings/assign-empl-bu-user"}
      tableName={ASSIGN_EMPL_BU_USER_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <AssignEmplBuUserForm
        values={values}
        errors={errors}
        businessGroup={temporaryAssignBusinessGroup}
        onChange={handleChange}
        employeeRows={employeeRows}
        buRows={buRows}
        onAddEmployeeRow={handleAddEmployeeRow}
        onRemoveEmployeeRow={handleRemoveEmployeeRow}
        onAddBuRow={handleAddBuRow}
        onRemoveBuRow={handleRemoveBuRow}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </FormPage>
  );
}

export default AssignEmplBuUserCreate;
