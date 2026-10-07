/**
 * @file List-page controller for Office Calendar.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import {
  officeCalendarMonthOptions,
  temporaryOfficeCalendarBusinessUnits,
} from "../validation/officeCalendarValidation";

const listPath = "/hris/attendance-settings/office-calendar";

function findBusinessUnits(ids) {
  return ids
    .map(
      (id) =>
        temporaryOfficeCalendarBusinessUnits.find(
          (unit) => String(unit.ID) === String(id),
        )?.BUSINESS_UNIT ?? id,
    )
    .join(", ");
}

function findMonth(value) {
  return (
    officeCalendarMonthOptions.find(
      (month) => String(month.value) === String(value),
    )?.label ?? value
  );
}

const filters = [
  {
    key: "BU_ID",
    label: "Search by Business Unit",
    placeholder: "--Search by Business Unit--",
    options: temporaryOfficeCalendarBusinessUnits.map((unit) => ({
      label: unit.BUSINESS_UNIT,
      value: unit.ID,
    })),
    matches: (row, value) => row.BU_ID.includes(value),
  },
  {
    key: "YEAR",
    label: "Search by Year",
    placeholder: "Search by Year",
  },
  {
    key: "MONTH_ID",
    label: "Search by Month",
    placeholder: "--Search by Month--",
    options: officeCalendarMonthOptions,
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
    render: (value) => findBusinessUnits(value),
  },
  { key: "YEAR", label: "Year" },
  {
    key: "MONTH_ID",
    label: "Month",
    render: (value) => findMonth(value),
  },
  { key: "TOTAL_DAYS", label: "Total Days" },
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
    BU_ID: ["1"],
    YEAR: "2027",
    MONTH_ID: "1",
    TOTAL_DAYS: "31",
    STATUS: "1",
  },
];

function OfficeCalendarList() {
  return (
    <ListPage
      title={"Office Calendar List"}
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

export default OfficeCalendarList;
