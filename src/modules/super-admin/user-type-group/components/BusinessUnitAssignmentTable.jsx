/**
 * @file Feature UI component for User Type Group: BusinessUnitAssignmentTable.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
function DeleteIcon() {
  return (
    <svg
      viewBox={"0 0 24 24"}
      className={"size-4"}
      fill={"none"}
      stroke={"currentColor"}
      strokeWidth={"2"}
      strokeLinecap={"round"}
      strokeLinejoin={"round"}
      aria-hidden={"true"}
    >
      <path d={"M4 7h16"} />
      <path d={"M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"} />
    </svg>
  );
}

function BusinessUnitAssignmentTable({ rows, query, onQueryChange, onDelete, onStatusChange }) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(
    (row) =>
      !normalizedQuery ||
      row.BUSINESS_UNIT_NAME.toLowerCase().includes(normalizedQuery),
  );

  return (
    <div>
      <div className={"erp-role-list-heading"}>
        <h3>Business Unit List</h3>
        <input
          className={"erp-list-control"}
          type={"search"}
          value={query}
          placeholder={"Search by Business Unit..."}
          aria-label={"Search by Business Unit"}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <div className={"erp-table-wrap"}>
        <table className={"erp-table"}>
          <thead>
            <tr>
              <th>Business Unit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td className={"erp-empty-cell"} colSpan={3}>
                  No data found
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.ID}>
                  <td>{row.BUSINESS_UNIT_NAME}</td>
                  <td>
                    <label className={"erp-switch-field"}>
                      <input
                        className={"erp-switch-control"}
                        type={"checkbox"}
                        role={"switch"}
                        checked={row.STATUS === "1"}
                        aria-label={`${row.BUSINESS_UNIT_NAME} status`}
                        onChange={() => onStatusChange(row.ID)}
                      />
                      <span>{row.STATUS === "1" ? "Active" : "Inactive"}</span>
                    </label>
                  </td>
                  <td>
                    <button
                      type={"button"}
                      className={"erp-role-delete-button"}
                      aria-label={`Delete ${row.BUSINESS_UNIT_NAME}`}
                      title={"Delete"}
                      onClick={() => onDelete(row.ID)}
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BusinessUnitAssignmentTable;
