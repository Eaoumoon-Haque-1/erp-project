/**
 * @file List-page controller for Manual Attendance Update.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import { formatDateForDisplay } from "../../../../utils/dateFormat";
import {
  temporaryManualAttendanceBusinessUnits,
  temporaryManualAttendanceDepartments,
  temporaryManualAttendanceDesignations,
  temporaryManualAttendanceShifts,
} from "../validation/manualAttendanceUpdateValidation";

const listPath = "/hris/hris-forms/manual-attendance-update";

function findLabel(collection, value, key) {
  return collection.find((item) => String(item.ID) === String(value))?.[key] ?? value;
}

const filters = [
  {
    key: "BU_ID",
    label: "Search by Business Unit",
    placeholder: "--Search by Business Unit--",
    options: temporaryManualAttendanceBusinessUnits.map((unit) => ({
      label: unit.BUSINESS_UNIT,
      value: unit.ID,
    })),
  },
  {
    key: "DEPT_ID",
    label: "Search by Department",
    placeholder: "--Search by Department--",
    options: temporaryManualAttendanceDepartments.map((department) => ({
      label: department.DEPARTMENT,
      value: department.ID,
    })),
  },
  {
    key: "SHIFT_ID",
    label: "Search by Shift",
    placeholder: "--Search by Shift--",
    options: temporaryManualAttendanceShifts.map((shift) => ({
      label: shift.SHIFT_TITLE,
      value: shift.ID,
    })),
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
  {
    key: "BU_ID",
    label: "Business Unit",
    render: (value) =>
      findLabel(temporaryManualAttendanceBusinessUnits, value, "BUSINESS_UNIT"),
  },
  {
    key: "DEPT_ID",
    label: "Department Name",
    render: (value) =>
      findLabel(temporaryManualAttendanceDepartments, value, "DEPARTMENT"),
  },
  {
    key: "DESIG_ID",
    label: "Designation Name",
    render: (value) =>
      findLabel(temporaryManualAttendanceDesignations, value, "DESIGNATION"),
  },
  {
    key: "SHIFT_ID",
    label: "Shift",
    render: (value) =>
      findLabel(temporaryManualAttendanceShifts, value, "SHIFT_TITLE"),
  },
  {
    key: "ATTEN_DATE",
    label: "Attendance Date",
    render: (value) => formatDateForDisplay(value),
  },
  { key: "IN_TIME", label: "In Time" },
  { key: "OUT_TIME", label: "Out Time" },
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
    BG_ID: "1",
    BU_ID: "1",
    DEPT_ID: "1",
    DESIG_ID: "2",
    SHIFT_ID: "1",
    ATTEN_DATE: "2026-09-22",
    IN_TIME: "09:02",
    OUT_TIME: "17:35",
    NOTE: "Attendance updated after supervisor confirmation.",
    STATUS: "1",
  },
];

function ManualAttendanceUpdateList() {
  return (
    <ListPage
      title={"Manual Attendance Update List"}
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

export default ManualAttendanceUpdateList;
