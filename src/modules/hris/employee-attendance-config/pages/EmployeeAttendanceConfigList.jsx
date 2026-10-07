/**
 * @file List-page controller for Employee Attendance Config.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";

const attendanceConfigRows = [
  {
    ID: 1,
    BU_ID: "1",
    BUSINESS_UNIT: "Head Office",
    EMPLOYEE_ID: "101",
    EMPLOYEE_CODE: "EMP-0101",
    DEPARTMENT: "Human Resources",
    EMPLOYEE_NAME: "Samira Rahman",
    ATTENDANCE_PERMISSION: "WiFi/GPS/Machine",
    STATUS: "1",
  },
  {
    ID: 2,
    BU_ID: "2",
    BUSINESS_UNIT: "Factory Unit",
    EMPLOYEE_ID: "103",
    EMPLOYEE_CODE: "EMP-0103",
    DEPARTMENT: "Software & IT",
    EMPLOYEE_NAME: "Md. Eaoumoon Haque",
    ATTENDANCE_PERMISSION: "GPS",
    STATUS: "1",
  },
];

const attendanceConfigFilters = [
  {
    key: "BU_ID",
    label: "Search by Business Unit",
    placeholder: "--Search by Business Unit--",
    options: [
      { label: "Head Office", value: "1" },
      { label: "Factory Unit", value: "2" },
      { label: "Regional Office", value: "3" },
    ],
  },
  {
    key: "EMPLOYEE_NAME",
    label: "Search by Employee",
    placeholder: "--Search by Employee--",
    matches: (row, value) =>
      String(row.EMPLOYEE_NAME ?? "")
        .toLowerCase()
        .includes(value.toLowerCase()),
  },
  {
    key: "STATUS",
    label: "Search by Status",
    placeholder: "--Search by Status--",
    options: [
      { label: "Active", value: "1" },
      { label: "Inactive", value: "0" },
    ],
  },
];

const attendanceConfigColumns = [
  { key: "BUSINESS_UNIT", label: "Business Unit" },
  { key: "EMPLOYEE_CODE", label: "Employee ID" },
  { key: "DEPARTMENT", label: "Department" },
  { key: "EMPLOYEE_NAME", label: "Employee Name" },
  { key: "ATTENDANCE_PERMISSION", label: "Attendance Permission" },
  {
    key: "STATUS",
    label: "Status",
    render: (value) => (
      <span
        className={[
          "inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm",
          String(value) === "1" ? "bg-action-success" : "bg-action-danger",
        ].join(" ")}
      >
        {String(value) === "1" ? "Active" : "Inactive"}
      </span>
    ),
  },
];

function EmployeeAttendanceConfigList() {
  return (
    <ListPage
      title={"Employee Attendance Config List"}
      createLabel={"New"}
      createTo={"/hris/hris-forms/employee-attendance-config/create"}
      filters={attendanceConfigFilters}
      columns={attendanceConfigColumns}
      rows={attendanceConfigRows}
      rowKey={"ID"}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  );
}

export default EmployeeAttendanceConfigList;
