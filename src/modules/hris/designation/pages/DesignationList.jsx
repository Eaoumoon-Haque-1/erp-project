/**
 * @file List-page controller for Designation.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  temporaryDesignationBusinessGroup,
  temporaryDesignations,
} from '../validation/designationValidation'

const designationFilters = [
  {
    key: 'DESIGNATION_NAME',
    label: 'Search by Designation Name',
    placeholder: '--Search by Designation Name--',
    matches: (row, value) =>
      String(row.DESIGNATION_NAME ?? '')
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

const designationColumns = [
  {
    key: 'BG_ID',
    label: 'Group Name',
    render: (value) =>
      String(value) === temporaryDesignationBusinessGroup.ID
        ? temporaryDesignationBusinessGroup.GROUP_NAME
        : value,
  },
  {
    key: 'DESIGNATION_NAME',
    label: 'Designation Name',
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

function DesignationList() {
  const navigate = useNavigate()

  const handleEdit = (row) => {
    navigate(`/hris/employee-settings/designation/${row.ID}/edit`)
  }

  return (
    <ListPage
      title={'Designation List'}
      createLabel={'New'}
      createTo={'/hris/employee-settings/designation/create'}
      filters={designationFilters}
      columns={designationColumns}
      rows={temporaryDesignations}
      renderActions={(row) => <ListRowActions row={row} onEdit={handleEdit} />}
    />
  )
}

export default DesignationList
