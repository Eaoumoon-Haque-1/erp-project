/**
 * @file List-page controller for HR Lookup Value.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  temporaryHrLookupTypeOptions,
  temporaryHrLookupValueBusinessGroup,
} from '../validation/hrLookupValueValidation'

const filters = [
  {
    key: 'TYPE_NAME',
    label: 'Search by Type',
    placeholder: '--Search by Type--',
    options: temporaryHrLookupTypeOptions,
  },
  {
    key: 'VALUE',
    label: 'Search by Value',
    placeholder: '--Search by Value--',
    matches: (row, value) => String(row.VALUE ?? '').toLowerCase().includes(value.toLowerCase()),
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
  {
    key: 'BG_ID',
    label: 'Group Name',
    render: (value) => String(value) === temporaryHrLookupValueBusinessGroup.ID
      ? temporaryHrLookupValueBusinessGroup.GROUP_NAME
      : value,
  },
  { key: 'TYPE_NAME', label: 'Type' },
  { key: 'VALUE', label: 'Value' },
  { key: 'SORT_ORDER', label: 'Sort Order' },
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

function HrLookupValueList() {
  return (
    <ListPage
      title={'HR Lookup Value List'}
      createLabel={'New'}
      createTo={'/hris/hr-lookup-settings/hr-lookup-value/create'}
      filters={filters}
      columns={columns}
      rows={[]}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default HrLookupValueList
