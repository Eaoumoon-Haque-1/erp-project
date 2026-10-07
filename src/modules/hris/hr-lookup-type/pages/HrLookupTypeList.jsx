/**
 * @file List-page controller for HR Lookup Type.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

const filters = [
  {
    key: 'TYPE_NAME',
    label: 'Search by Type Name',
    placeholder: '--Search by Type Name--',
    matches: (row, value) => String(row.TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'CODE',
    label: 'Search by Code',
    placeholder: '--Search by Code--',
    matches: (row, value) => String(row.CODE ?? '').toLowerCase().includes(value.toLowerCase()),
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

const columns = [
  { key: 'TYPE_NAME', label: 'Type Name' },
  { key: 'CODE', label: 'Code' },
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

function HrLookupTypeList() {
  return (
    <ListPage
      title={'HR Lookup Type List'}
      createLabel={'New'}
      createTo={'/hris/hr-lookup-settings/hr-lookup-type/create'}
      filters={filters}
      columns={columns}
      rows={[]}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default HrLookupTypeList
