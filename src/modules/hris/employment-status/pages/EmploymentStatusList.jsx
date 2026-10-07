/**
 * @file List-page controller for Employment Status.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

const employmentStatusFilters = [
  {
    key: 'STATUS_NAME',
    label: 'Search by Status Name',
    placeholder: '--Search by Status Name--',
    matches: (row, value) =>
      String(row.STATUS_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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

const employmentStatusColumns = [
  {
    key: 'STATUS_NAME',
    label: 'Status Name',
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

function EmploymentStatusList() {
  return (
    <ListPage
      title={'Employment Status List'}
      createLabel={'New'}
      createTo={'/hris/employee-settings/employment-status/create'}
      filters={employmentStatusFilters}
      columns={employmentStatusColumns}
      rows={[]}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default EmploymentStatusList
