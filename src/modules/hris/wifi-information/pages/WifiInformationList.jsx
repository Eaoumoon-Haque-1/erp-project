/**
 * @file List-page controller for WiFi Information.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import {
  temporaryWifiInformationBusinessUnits,
} from "../validation/wifiInformationValidation";

function findBusinessUnit(value) {
  return (
    temporaryWifiInformationBusinessUnits.find(
      (unit) => String(unit.ID) === String(value),
    )?.BUSINESS_UNIT ?? value
  );
}

const wifiInformationFilters = [
  {
    key: "BU_ID",
    label: "Search by Business Unit",
    placeholder: "--Search by Business Unit--",
    options: temporaryWifiInformationBusinessUnits.map((unit) => ({
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

const wifiInformationColumns = [
  {
    key: "BU_ID",
    label: "Business Unit",
    render: (value) => findBusinessUnit(value),
  },
  { key: "WIFI_NAME", label: "WiFi Name" },
  { key: "MAC_ADDRESS", label: "MAC Address" },
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

const wifiInformationRows = [
  {
    ID: 1,
    BU_ID: "1",
    WIFI_NAME: "HQ WiFi",
    MAC_ADDRESS: "AA:BB:CC:DD:EE:FF",
    STATUS: "1",
  },
  {
    ID: 2,
    BU_ID: "2",
    WIFI_NAME: "Factory WiFi",
    MAC_ADDRESS: "11:22:33:44:55:66",
    STATUS: "1",
  },
];

function WifiInformationList() {
  return (
    <ListPage
      title={"WiFi Information List"}
      createLabel={"New"}
      createTo={"/hris/attendance-settings/wifi-information/create"}
      filters={wifiInformationFilters}
      columns={wifiInformationColumns}
      rows={wifiInformationRows}
      rowKey={"ID"}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  );
}

export default WifiInformationList;
