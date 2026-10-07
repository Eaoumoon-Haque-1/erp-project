/**
 * @file List-page controller for Degree Education Mapping.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { levelOfEducationOptions } from '../validation/degreeEducationMappingValidation'

const degreeFilters = [
  {
    key: 'LEVEL_OF_EDU_ID',
    label: 'Search by Education Level',
    placeholder: '--Search by Education Level--',
    options: levelOfEducationOptions,
  },
  {
    key: 'DEGREE_NAME',
    label: 'Search by Degree Name',
    placeholder: '--Search by Degree Name--',
    matches: (row, value) =>
      String(row.DEGREE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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

const degreeColumns = [
  {
    key: 'LEVEL_OF_EDU_ID',
    label: 'Education Level',
    render: (value) =>
      levelOfEducationOptions.find(
        (option) => String(option.value) === String(value),
      )?.label ?? value,
  },
  {
    key: 'DEGREE_NAME',
    label: 'Degree Name',
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

function DegreeEducationMappingList() {
  return (
    <ListPage
      title={'Degree & Education Mapping List'}
      createLabel={'New'}
      createTo={'/hris/employee-settings/degree-education-mapping/create'}
      filters={degreeFilters}
      columns={degreeColumns}
      rows={[]}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default DegreeEducationMappingList
