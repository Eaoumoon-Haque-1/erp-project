/**
 * @file Edit-page controller for User Type Group.
 * Sections: record loading, controlled state, update/reset handlers, and form/assignment composition.
 * Future fetch/update API calls belong here; preserve route-parameter and list-link contracts.
 */
import { useState } from "react";
import { currentUser } from "../../../../app/currentUser";
import PageHeader from "../../../../components/shared/PageHeader";
import BusinessUnitAssignment from "../components/BusinessUnitAssignment";
import BusinessUnitAssignmentTable from "../components/BusinessUnitAssignmentTable";
import UserTypeGroupForm from "../components/UserTypeGroupForm";
import { getBusinessUnitName } from "../data/userTypeGroupOptions";
import {
  initialBusinessUnitAssignment,
  validateBusinessUnitAssignment,
  validateUserTypeGroup,
} from "../validation/userTypeGroupValidation";

function UserTypeGroupEdit() {
  const [values, setValues] = useState({
    BG_ID: currentUser.businessGroup.id,
    USER_TYPE_ID: "1",
    STATUS: "1",
  });
  const [errors, setErrors] = useState({});
  const [assignment, setAssignment] = useState(initialBusinessUnitAssignment);
  const [assignmentErrors, setAssignmentErrors] = useState({});
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const handleAssignmentChange = (event) => {
    const { name, type, value, checked } = event.target;
    setAssignment((current) => ({
      ...current,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
    setAssignmentErrors((current) => ({ ...current, [name]: undefined }));
  };
  const handleAdd = (event) => {
    event.preventDefault();
    const groupResult = validateUserTypeGroup(values);
    const assignmentResult = validateBusinessUnitAssignment(assignment, rows);
    setValues(groupResult.values);
    setErrors(groupResult.errors);
    setAssignment(assignmentResult.values);
    setAssignmentErrors(assignmentResult.errors);
    if (!groupResult.isValid || !assignmentResult.isValid) {
      requestAnimationFrame(() =>
        document.querySelector("[aria-invalid=true]")?.focus(),
      );
      return;
    }
    setRows((current) => [
      ...current,
      {
        ID: `${Date.now()}-${current.length}`,
        ...assignmentResult.values,
        BUSINESS_UNIT_NAME: getBusinessUnitName(assignmentResult.values.BU_ID),
      },
    ]);
    setAssignment(initialBusinessUnitAssignment);
    setAssignmentErrors({});
  };

  return (
    <div className={"erp-list-page"}>
      <PageHeader
        title={"User Type Group Edit"}
        actionLabel={"List"}
        actionTo={"/super-admin/user-creation/user-type-group"}
      />
      <section className={"erp-form-card erp-role-edit-card"}>
        <form onSubmit={handleAdd} noValidate>
          <UserTypeGroupForm
            values={values}
            errors={errors}
            groupName={currentUser.businessGroup.name}
            onChange={handleChange}
          />
          <div className={"erp-role-divider"} />
          <BusinessUnitAssignment
            values={assignment}
            errors={assignmentErrors}
            onChange={handleAssignmentChange}
          />
        </form>
        <BusinessUnitAssignmentTable
          rows={rows}
          query={query}
          onQueryChange={setQuery}
          onDelete={(id) =>
            setRows((current) => current.filter((row) => row.ID !== id))
          }
        />
      </section>
    </div>
  );
}

export default UserTypeGroupEdit;
