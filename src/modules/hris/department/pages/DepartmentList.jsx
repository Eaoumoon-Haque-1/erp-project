/**
 * @file List-page controller for Department.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  temporaryDepartmentBusinessGroup,
  temporaryDepartments,
} from '../validation/departmentValidation'

/**
 * REFERENCE LIST PAGE
 *
 * Keep filters and columns outside the component when they are static. The
 * shared ListPage supplies search, filtering, serial numbers, empty state, and
 * pagination; this page supplies feature-specific data and action handlers.
 */

// A filter with `options` performs exact matching. Use `matches` when the
// feature needs contains/range/custom matching.
const departmentFilters = [
  {
    key: 'DEPARTMENT_NAME',
    label: 'Search by Department Name',
    placeholder: '--Search by Department Name--',
    matches: (row, value) =>
      String(row.DEPARTMENT_NAME ?? '')
        .toLowerCase()
        .includes(value.toLowerCase()),
  },
  {
    key: 'STATUS',
    label: 'Search by Status',
    placeholder: '--Search by Status--',
    options: [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
    ],
  },
]

// Column keys match row/backend keys. `render` converts stored values into a
// readable display without changing the original row.
const departmentColumns = [
  {
    key: 'BG_ID',
    label: 'Group Name',
    render: (value) =>
      String(value) === temporaryDepartmentBusinessGroup.ID
        ? temporaryDepartmentBusinessGroup.GROUP_NAME
        : value,
  },
  {
    key: 'DEPARTMENT_NAME',
    label: 'Department Name',
  },
  {
    key: 'SHORT_NAME',
    label: 'Short Name',
  },
  {
    key: 'SORT_ORDER',
    label: 'Sort Order',
  },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
          String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function DepartmentList() {
  const navigate = useNavigate()

  // Put navigation or state-changing logic in named handlers, then pass only
  // implemented handlers to ListRowActions. Missing handlers stay disabled.
  const handleEdit = (row) => {
    navigate(`/hris/employee-settings/department/${row.ID}/edit`)
  }

  return (
    // Replace temporaryDepartments with API state when integration is ready;
    // ListPage's public props can remain unchanged.
    <ListPage
      title={'Department List'}
      createLabel={'New'}
      createTo={'/hris/employee-settings/department/create'}
      filters={departmentFilters}
      columns={departmentColumns}
      rows={temporaryDepartments}
      renderActions={(row) => <ListRowActions row={row} onEdit={handleEdit} />}
    />
  )
}

export default DepartmentList
