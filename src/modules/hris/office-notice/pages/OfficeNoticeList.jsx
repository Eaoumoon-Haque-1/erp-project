/**
 * @file List-page controller for Office Notice.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import { formatDateForDisplay } from "../../../../utils/dateFormat";
import {
  temporaryOfficeNoticeBusinessUnits,
} from "../validation/officeNoticeValidation";

const listPath = "/hris/hris-forms/office-notice";

function findBusinessUnit(value) {
  return (
    temporaryOfficeNoticeBusinessUnits.find(
      (unit) => String(unit.ID) === String(value),
    )?.BUSINESS_UNIT ?? value
  );
}

const filters = [
  {
    key: "BG_ID",
    label: "Search by Business Unit",
    placeholder: "--Search by Business Unit--",
    options: temporaryOfficeNoticeBusinessUnits.map((unit) => ({
      label: unit.BUSINESS_UNIT,
      value: unit.ID,
    })),
  },
  {
    key: "IS_IMPORTANT",
    label: "Search by Importance",
    placeholder: "--Search by Importance--",
    options: [
      { label: "Important", value: "1" },
      { label: "Regular", value: "0" },
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
  {
    key: "BG_ID",
    label: "Business Unit",
    render: (value) => findBusinessUnit(value),
  },
  { key: "TITLE", label: "Title" },
  {
    key: "PUBLISH_DATE",
    label: "Publish Date",
    render: (value) => formatDateForDisplay(value),
  },
  {
    key: "EXPIRE_DATE",
    label: "Expire Date",
    render: (value) => formatDateForDisplay(value),
  },
  {
    key: "IS_IMPORTANT",
    label: "Important",
    render: (value) => (String(value) === "1" ? "Yes" : "No"),
  },
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
    TITLE: "Office closure notice",
    PUBLISH_DATE: "2026-09-22",
    EXPIRE_DATE: "2026-09-30",
    ATTACHMENT: "",
    IS_IMPORTANT: "1",
    DESCRIPTION: "The office will remain closed on the announced date.",
    STATUS: "1",
  },
];

function OfficeNoticeList() {
  return (
    <ListPage
      title={"Office Notice List"}
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

export default OfficeNoticeList;
