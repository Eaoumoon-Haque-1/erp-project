/**
 * @file List-page controller for Level Of Education.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

const levelOfEduFilters = [
  {
    key: 'LEVEL_OF_EDU',
    label: 'Level of Education',
    placeholder: '--Search by Level of Education--',
    matches: (row, value) =>
      String(row.LEVEL_OF_EDU ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'STATUS',
    label: 'Status',
    placeholder: '--Search by Status--',
    options: [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
    ],
  },
]

const levelOfEduColumns = [
  {
    key: 'LEVEL_OF_EDU',
    label: 'Level of Education',
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

const initialRows = [
  { ID: '1', LEVEL_OF_EDU: 'Secondary (SSC)', SHORT_NAME: 'SSC', SORT_ORDER: '1', STATUS: '1' },
  { ID: '2', LEVEL_OF_EDU: 'Higher Secondary (HSC)', SHORT_NAME: 'HSC', SORT_ORDER: '2', STATUS: '1' },
  { ID: '3', LEVEL_OF_EDU: 'Bachelor / Honors', SHORT_NAME: 'BSc', SORT_ORDER: '3', STATUS: '1' },
  { ID: '4', LEVEL_OF_EDU: 'Master Degree', SHORT_NAME: 'MSc', SORT_ORDER: '4', STATUS: '1' },
]

function LevelOfEducationList() {
  return (
    <ListPage
      title={'Level of Education List'}
      createLabel={'New'}
      createTo={'/hris/employee-settings/level-of-education/create'}
      filters={levelOfEduFilters}
      columns={levelOfEduColumns}
      rows={initialRows}
      renderActions={(row) => <ListRowActions row={row} editTo={`/hris/employee-settings/level-of-education/${row.ID}/edit`} />}
    />
  )
}

export default LevelOfEducationList
