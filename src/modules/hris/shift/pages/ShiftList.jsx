/**
 * @file List-page controller for Shift.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useNavigate } from "react-router-dom";
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";

const rows = [
  {
    ID: "1",
    BUSINESS_UNIT_NAME: "Head Office",
    SHIFT_TITLE: "General Shift",
    SHIFT_START_TIME: "09:00",
    SHIFT_END_TIME: "17:00",
    GRACE_TIME_MINUTES: "15",
    WEEKEND_DAYS: "Friday",
    STATUS: "1",
  },
  {
    ID: "2",
    BUSINESS_UNIT_NAME: "Head Office",
    SHIFT_TITLE: "Morning Shift",
    SHIFT_START_TIME: "06:00",
    SHIFT_END_TIME: "14:00",
    GRACE_TIME_MINUTES: "10",
    WEEKEND_DAYS: "Friday",
    STATUS: "1",
  },
  {
    ID: "3",
    BUSINESS_UNIT_NAME: "Factory Unit",
    SHIFT_TITLE: "Night Shift",
    SHIFT_START_TIME: "22:00",
    SHIFT_END_TIME: "06:00",
    GRACE_TIME_MINUTES: "15",
    WEEKEND_DAYS: "Friday",
    STATUS: "1",
  },
];

const filters = [
  {
    key: "SHIFT_TITLE",
    label: "Search by Shift Title",
    placeholder: "--Search by Shift Title--",
    matches: (row, value) =>
      row.SHIFT_TITLE.toLowerCase().includes(value.toLowerCase()),
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
  { key: "BUSINESS_UNIT_NAME", label: "Business Unit" },
  { key: "SHIFT_TITLE", label: "Shift Title" },
  { key: "SHIFT_START_TIME", label: "Start Time" },
  { key: "SHIFT_END_TIME", label: "End Time" },
  { key: "GRACE_TIME_MINUTES", label: "Grace Mins" },
  { key: "WEEKEND_DAYS", label: "Weekend" },
  {
    key: "STATUS",
    label: "Status",
    render: (value) => (
      <span
        className={[
          "inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm",
          value === "1" ? "bg-action-success" : "bg-action-danger",
        ].join(" ")}
      >
        {value === "1" ? "Active" : "Inactive"}
      </span>
    ),
  },
];

function ShiftList() {
  const navigate = useNavigate();
  return (
    <ListPage
      title={"Shift List"}
      createLabel={"New"}
      createTo={"/hris/attendance-settings/shift/create"}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={(selected) =>
            navigate(`/hris/attendance-settings/shift/${selected.ID}/edit`)
          }
        />
      )}
    />
  );
}

export default ShiftList;
