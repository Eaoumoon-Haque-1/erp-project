/**
 * @file List-page controller for Leave Type Assign.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  temporaryLeaveTypeAssignBusinessGroup,
  temporaryLeaveTypeAssignBusinessUnits,
  temporaryLeaveTypeAssigns,
  temporarySelectedLeaveType,
} from '../validation/leaveTypeAssignValidation'

function findBusinessUnit(value) {
  return temporaryLeaveTypeAssignBusinessUnits.find(
    (unit) => String(unit.ID) === String(value),
  )?.BUSINESS_UNIT ?? value
}

const leaveTypeAssignFilters = [
  {
    key: 'LEAVE_TYPE_ID',
    label: 'Search by Leave Type',
    placeholder: '--Search by Leave Type--',
    options: [
      {
        label: temporarySelectedLeaveType.TYPE_NAME,
        value: temporarySelectedLeaveType.ID,
      },
    ],
  },
  {
    key: 'BU_ID',
    label: 'Search by Business Unit',
    placeholder: '--Search by Business Unit--',
    options: temporaryLeaveTypeAssignBusinessUnits.map((unit) => ({
      label: unit.BUSINESS_UNIT,
      value: unit.ID,
    })),
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

const leaveTypeAssignColumns = [
  {
    key: 'BG_ID',
    label: 'Group Name',
    render: (value) =>
      String(value) === temporaryLeaveTypeAssignBusinessGroup.ID
        ? temporaryLeaveTypeAssignBusinessGroup.GROUP_NAME
        : value,
  },
  {
    key: 'LEAVE_TYPE_ID',
    label: 'Leave Type',
    render: (value) =>
      String(value) === temporarySelectedLeaveType.ID
        ? temporarySelectedLeaveType.TYPE_NAME
        : value,
  },
  {
    key: 'BU_ID',
    label: 'Business Unit',
    render: (value) => findBusinessUnit(value),
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

function LeaveTypeAssignList() {
  return (
    <ListPage
      title={'Leave Type Assign List'}
      createLabel={'New'}
      createTo={'/hris/leave-settings/leave-type-assign/create'}
      filters={leaveTypeAssignFilters}
      columns={leaveTypeAssignColumns}
      rows={temporaryLeaveTypeAssigns}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default LeaveTypeAssignList
