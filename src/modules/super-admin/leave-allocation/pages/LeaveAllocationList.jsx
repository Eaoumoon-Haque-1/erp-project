/**
 * @file List-page controller for Leave Allocation.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";

const filters = [
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
    key: "EMP_TYPE_ID",
    label: "Search by Employee Type",
    placeholder: "--Search by Employee Type--",
    options: [
      { label: "Permanent", value: "1" },
      { label: "Contractual", value: "2" },
      { label: "Project Based", value: "3" },
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
      { label: "Active", value: "1" },
      { label: "Inactive", value: "0" },
    ],
  },
];

const columns = [
  { key: "BUSINESS_UNIT", label: "Business Unit" },
  { key: "EMPLOYEE_TYPE", label: "Employee Type" },
  { key: "LEAVE_CATEGORY", label: "Leave Category" },
  { key: "TOTAL_LEAVE_DAYS", label: "Total Leave Days" },
  { key: "LEAVE_YEAR", label: "Year" },
  { key: "SANDWICH_LEAVE_APPLICABLE", label: "Sandwich Leave" },
  { key: "WITH_PAY", label: "With Pay" },
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

const rows = [
  {
    ID: "1",
    BU_ID: "1",
    BUSINESS_UNIT: "Head Office",
    EMP_TYPE_ID: "1",
    EMPLOYEE_TYPE: "Permanent",
    LEAVE_CATEGORY_ID: "1",
    LEAVE_CATEGORY: "Annual Leave",
    TOTAL_LEAVE_DAYS: "20",
    LEAVE_YEAR: "2026",
    SANDWICH_LEAVE_APPLICABLE: "No",
    WITH_PAY: "Yes",
    STATUS: "1",
  },
];

function LeaveAllocationList() {
  return (
    <ListPage
      title={"Leave Allocation List"}
      createLabel={"New"}
      createTo={"/hris/leave-settings/leave-allocation/create"}
      filters={filters}
      columns={columns}
      rows={rows}
      rowKey={"ID"}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  );
}

export default LeaveAllocationList;
