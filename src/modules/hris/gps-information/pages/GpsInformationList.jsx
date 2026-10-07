/**
 * @file List-page controller for GPS Information.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import {
  temporaryGpsInformationBusinessUnits,
} from "../validation/gpsInformationValidation";

function findBusinessUnit(value) {
  return (
    temporaryGpsInformationBusinessUnits.find(
      (unit) => String(unit.ID) === String(value),
    )?.BUSINESS_UNIT ?? value
  );
}

const gpsInformationFilters = [
  {
    key: "BU_ID",
    label: "Search by Business Unit",
    placeholder: "--Search by Business Unit--",
    options: temporaryGpsInformationBusinessUnits.map((unit) => ({
      label: unit.BUSINESS_UNIT,
      value: unit.ID,
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

const gpsInformationColumns = [
  {
    key: "BU_ID",
    label: "Business Unit",
    render: (value) => findBusinessUnit(value),
  },
  { key: "LOCATION_NAME", label: "Location Name" },
  { key: "LATITUDE", label: "Latitude" },
  { key: "LONGITUDE", label: "Longitude" },
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

const gpsInformationRows = [
  {
    ID: 1,
    BU_ID: "1",
    LOCATION_NAME: "Head Office",
    LATITUDE: "23.8103",
    LONGITUDE: "90.4125",
    STATUS: "1",
  },
  {
    ID: 2,
    BU_ID: "2",
    LOCATION_NAME: "Factory Unit",
    LATITUDE: "23.8200",
    LONGITUDE: "90.4200",
    STATUS: "1",
  },
];

function GpsInformationList() {
  return (
    <ListPage
      title={"GPS Information List"}
      createLabel={"New"}
      createTo={"/hris/attendance-settings/gps-information/create"}
      filters={gpsInformationFilters}
      columns={gpsInformationColumns}
      rows={gpsInformationRows}
      rowKey={"ID"}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  );
}

export default GpsInformationList;
