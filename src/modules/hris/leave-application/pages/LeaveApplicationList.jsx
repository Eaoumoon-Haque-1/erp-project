/**
 * @file List-page controller for Leave Application.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import { formatDateForDisplay } from "../../../../utils/dateFormat";

const filters = [
  {
    key: "EMPLOYEE_ID",
    label: "Search by Employee",
    placeholder: "--Search by Employee--",
    options: [
      { label: "MD Rahman", value: "1" },
      { label: "Nadia Islam", value: "2" },
      { label: "Touhid Hossain", value: "3" },
    ],
  },
  {
    key: "LEAVE_CATEGORY_ID",
    label: "Search by Leave Category",
    placeholder: "--Search by Leave Category--",
    options: [
      { label: "Annual Leave", value: "1" },
      { label: "Casual Leave", value: "2" },
      { label: "Sick Leave", value: "3" },
    ],
  },
  {
    key: "STATUS",
    label: "Search by Status",
    placeholder: "--Search by Status--",
    options: [
      { label: "Submitted", value: "1" },
      { label: "Draft", value: "0" },
    ],
  },
];

const columns = [
  { key: "BUSINESS_UNIT", label: "Business Unit" },
  { key: "EMPLOYEE_NAME", label: "Employee" },
  { key: "DEPARTMENT", label: "Department" },
  { key: "DESIGNATION", label: "Designation" },
  {
    key: "FROM_DATE",
    label: "From Date",
    render: (value) => formatDateForDisplay(value),
  },
  {
    key: "TO_DATE",
    label: "To Date",
    render: (value) => formatDateForDisplay(value),
  },
  { key: "LEAVE_CATEGORY", label: "Leave Category" },
  { key: "TOTAL_LEAVE_DAYS", label: "Total Days" },
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
        {String(value) === "1" ? "Submitted" : "Draft"}
      </span>
    ),
  },
];

const rows = [
  {
    ID: "1",
    BU_ID: "1",
    BUSINESS_UNIT: "Head Office",
    EMPLOYEE_ID: "1",
    EMPLOYEE_NAME: "MD Rahman",
    DEPT_ID: "1",
    DEPARTMENT: "HR",
    DESIGNATION_ID: "1",
    DESIGNATION: "Manager",
    FROM_DATE: "2026-09-22",
    TO_DATE: "2026-09-24",
    LEAVE_CATEGORY_ID: "1",
    LEAVE_CATEGORY: "Annual Leave",
    TOTAL_LEAVE_DAYS: "3",
    STATUS: "1",
  },
];

function LeaveApplicationList() {
  return (
    <ListPage
      title={"Leave Application List"}
      createLabel={"New"}
      createTo={"/hris/hris-forms/leave-application/create"}
      filters={filters}
      columns={columns}
      rows={rows}
      rowKey={"ID"}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  );
}

export default LeaveApplicationList;
