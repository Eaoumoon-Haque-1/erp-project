/**
 * @file List-page controller for Business Unit.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { businessGroupsApi } from "../../business-group/api/businessGroupApi";
import { businessUnitsApi } from "../api/businessUnitApi";
import { getApiErrorMessage } from "../../../../api/errors";
import ListPage from "../../../../components/shared/ListPage";
import ListRowActions from "../../../../components/shared/ListRowActions";
import {
  mapBusinessUnitFromApi,
  mapBusinessUnitToApi,
} from "../data/businessUnitApiMapper";

const businessUnitColumns = [
  {
    key: "BG_ID",
    label: "Group Name",
    render: (_, row) => row.GROUP_NAME,
  },
  {
    key: "BUSINESS_UNIT",
    label: "Unit Name",
  },
  {
    key: "E_MAIL",
    label: "Email",
  },
  {
    key: "MOBILE_NO",
    label: "Mobile No",
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

function BusinessUnitList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([businessUnitsApi.list(), businessGroupsApi.list()])
      .then(([units, groups]) => {
        if (!active) return;
        const groupNames = new Map(
          groups.map((group) => [String(group.id), group.groupName]),
        );
        setRows(
          units.map((unit) => ({
            ...mapBusinessUnitFromApi(unit),
            GROUP_NAME: groupNames.get(String(unit.bgId)) || String(unit.bgId),
          })),
        );
      })
      .catch((error) => {
        if (active) {
          setMessage(getApiErrorMessage(error, "Unable to load Business Units."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleEdit = (row) => {
    if (!row?.ID) return;
    navigate(`/super-admin/business-unit/${row.ID}/edit`);
  };

  const handleDelete = async (row) => {
    try {
      await businessUnitsApi.remove(row.ID);
      setRows((current) => current.filter((item) => item.ID !== row.ID));
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to delete Business Unit."));
    }
  };

  const handleStatusChange = async (row) => {
    try {
      const next = { ...row, STATUS: row.STATUS === "1" ? "0" : "1" };
      const updated = await businessUnitsApi.update(
        row.ID,
        await mapBusinessUnitToApi(next),
      );
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID
            ? { ...mapBusinessUnitFromApi(updated), GROUP_NAME: row.GROUP_NAME }
            : item,
        ),
      );
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "Unable to update Business Unit status."),
      );
    }
  };

  return (
    <ListPage
      title={"Business Unit List"}
      createLabel={"New"}
      createTo={"/super-admin/business-unit/create"}
      columns={businessUnitColumns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() =>
            navigate(`/super-admin/business-unit/${row.ID}/view`)
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  );
}

export default BusinessUnitList;
