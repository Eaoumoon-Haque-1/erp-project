/**
 * @file Feature UI component for Role: RolePermissionTable.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
function DeleteIcon() {
  return (
    <svg viewBox={'0 0 24 24'} className={'size-4'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'}>
      <path d={'M4 7h16'} />
      <path d={'M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5'} />
    </svg>
  )
}

function RolePermissionTable({ rows, query, onQueryChange, onDelete }) {
  const normalizedQuery = query.trim().toLowerCase()
  const visibleRows = rows.filter((row) => (
    !normalizedQuery || row.MENU_NAME.toLowerCase().includes(normalizedQuery)
  ))

  return (
    <div className={'erp-role-permission-list'}>
      <div className={'erp-role-list-heading'}>
        <h3>Permission List</h3>
        <input className={'erp-list-control'} type={'search'} value={query} placeholder={'Search by Menu Name...'} aria-label={'Search permissions by menu name'} onChange={(event) => onQueryChange(event.target.value)} />
      </div>
      <div className={'erp-table-wrap'}>
        <table className={'erp-table erp-role-permission-table'}>
          <thead>
            <tr>
              <th className={'erp-number-column'}>#</th>
              <th>Module Name</th>
              <th>Menu Name</th>
              <th>Permission</th>
              <th className={'erp-action-column'}>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr><td className={'erp-empty-cell'} colSpan={5}>No data found</td></tr>
            ) : visibleRows.map((row, index) => (
              <tr key={row.ID}>
                <td className={'erp-number-column'}>{index + 1}</td>
                <td>{row.MODULE_NAME}</td>
                <td>{row.MENU_NAME}</td>
                <td>{row.PERMISSION_NAME}</td>
                <td className={'erp-action-column'}>
                  <button type={'button'} className={'erp-role-delete-button'} aria-label={`Delete ${row.MENU_NAME} permission`} title={'Delete'} onClick={() => onDelete(row)}>
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RolePermissionTable
