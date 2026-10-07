/**
 * @file List-page controller for Assign Empl BU User.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useNavigate } from "react-router-dom";
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";

const rows = [
  {
    ID: "1",
    GROUP_NAME: "Demo Business Group",
    BUSINESS_UNIT_NAME: "Head Office",
    DEPARTMENT_NAME: "Human Resources",
    DESIGNATION_NAME: "HR Executive",
    USER_NAME: "samira.rahman",
    ASSIGNED_EMPLOYEES: "Samira Rahman (EMP-0101)",
    ASSIGNED_BUS: "Head Office, Factory Unit",
  },
  {
    ID: "2",
    GROUP_NAME: "Demo Business Group",
    BUSINESS_UNIT_NAME: "Head Office",
    DEPARTMENT_NAME: "Administration",
    DESIGNATION_NAME: "Senior Officer",
    USER_NAME: "tanvir.hasan",
    ASSIGNED_EMPLOYEES: "Tanvir Hasan (EMP-0102)",
    ASSIGNED_BUS: "Head Office",
  },
];

const filters = [
  {
    key: "USER_NAME",
    label: "Search by User Name",
    placeholder: "--Search by User Name--",
    matches: (row, value) =>
      row.USER_NAME.toLowerCase().includes(value.toLowerCase()),
  },
];

const columns = [
  { key: "GROUP_NAME", label: "Group Name" },
  { key: "BUSINESS_UNIT_NAME", label: "Business Unit" },
  { key: "DEPARTMENT_NAME", label: "Department" },
  { key: "DESIGNATION_NAME", label: "Designation" },
  { key: "USER_NAME", label: "User Name" },
  { key: "ASSIGNED_EMPLOYEES", label: "Assigned Employee" },
  { key: "ASSIGNED_BUS", label: "Assigned BU" },
];

function AssignEmplBuUserList() {
  const navigate = useNavigate();
  return (
    <ListPage
      title={"Assign Empl and BU to User List"}
      createLabel={"New"}
      createTo={"/hris/employee-settings/assign-empl-bu-user/create"}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={(selected) =>
            navigate(`/hris/employee-settings/assign-empl-bu-user/${selected.ID}/edit`)
          }
        />
      )}
    />
  );
}

export default AssignEmplBuUserList;
