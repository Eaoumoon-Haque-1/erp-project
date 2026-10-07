/**
 * @file List-page controller for Mobile Notification.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import {
  temporaryMobileNotificationBusinessUnits,
  temporaryMobileNotificationDepartments,
  temporaryNotificationTypes,
} from "../validation/mobileNotificationValidation";

const listPath = "/hris/hris-forms/mobile-notification";

function statusBadge(value) {
  return (
    <span
      className={[
        "inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm",
        String(value) === "1" ? "bg-action-success" : "bg-action-danger",
      ].join(" ")}
    >
      {String(value) === "1" ? "Active" : "Inactive"}
    </span>
  );
}

const filters = [
  {
    key: "BU_ID",
    label: "Search by Business Unit",
    placeholder: "--Search by Business Unit--",
    options: temporaryMobileNotificationBusinessUnits.map((unit) => ({
      label: unit.BUSINESS_UNIT,
      value: unit.ID,
    })),
    matches: (row, value) => row.BU_ID.includes(value),
  },
  {
    key: "DEPT_ID",
    label: "Search by Department",
    placeholder: "--Search by Department--",
    options: temporaryMobileNotificationDepartments.map((department) => ({
      label: department.DEPARTMENT,
      value: department.ID,
    })),
    matches: (row, value) => row.DEPT_ID.includes(value),
  },
  {
    key: "NOTIFICATION_TYPE",
    label: "Search by Notification Type",
    placeholder: "--Search by Notification Type--",
    options: temporaryNotificationTypes,
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
  { key: "BUSINESS_UNITS", label: "Business Unit" },
  { key: "DEPARTMENTS", label: "Department Name" },
  { key: "EMPLOYEES", label: "Employee Name" },
  { key: "NOTIFICATION_TYPE_LABEL", label: "Notification Type" },
  { key: "TITLE", label: "Title" },
  { key: "STATUS", label: "Status", render: statusBadge },
];

const rows = [
  {
    ID: "1",
    BU_ID: ["1"],
    BUSINESS_UNITS: "Head Office",
    DEPT_ID: ["1"],
    DEPARTMENTS: "HR",
    EMPL_ID: ["1", "2"],
    EMPLOYEES: "MD Rahman, Nadia Islam",
    NOTIFICATION_TYPE: "ANNOUNCEMENT",
    NOTIFICATION_TYPE_LABEL: "Announcement",
    TITLE: "HR policy update",
    BODY: "Please review the latest HR policy update.",
    STATUS: "1",
  },
];

function MobileNotificationList() {
  return (
    <ListPage
      title={"Mobile Notification List"}
      createLabel={"New"}
      createTo={`${listPath}/create`}
      filters={filters}
      columns={columns}
      rows={rows}
      rowKey={"ID"}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  );
}

export default MobileNotificationList;
