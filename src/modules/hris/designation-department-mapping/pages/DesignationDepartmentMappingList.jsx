/**
 * @file List-page controller for Designation Department Mapping.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  temporaryDesignationDepartmentMappings,
  temporaryMappingBusinessGroup,
  temporaryMappingBusinessUnits,
  temporaryMappingDepartments,
  temporaryMappingDesignations,
} from '../validation/designationDepartmentMappingValidation'

function findLabel(items, value, labelKey) {
  return items.find((item) => String(item.ID) === String(value))?.[labelKey] ?? value
}

const mappingFilters = [
  {
    key: 'BU_ID',
    label: 'Search by Business Unit',
    placeholder: '--Search by Business Unit--',
    options: temporaryMappingBusinessUnits.map((unit) => ({
      label: unit.BUSINESS_UNIT,
      value: unit.ID,
    })),
  },
  {
    key: 'DEPT_ID',
    label: 'Search by Department Name',
    placeholder: '--Search by Department Name--',
    options: temporaryMappingDepartments.map((department) => ({
      label: department.DEPARTMENT_NAME,
      value: department.ID,
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

const mappingColumns = [
  {
    key: 'BG_ID',
    label: 'Group Name',
    render: (value) =>
      String(value) === temporaryMappingBusinessGroup.ID
        ? temporaryMappingBusinessGroup.GROUP_NAME
        : value,
  },
  {
    key: 'BU_ID',
    label: 'Business Unit',
    render: (value) => findLabel(temporaryMappingBusinessUnits, value, 'BUSINESS_UNIT'),
  },
  {
    key: 'DEPT_ID',
    label: 'Department Name',
    render: (value) => findLabel(temporaryMappingDepartments, value, 'DEPARTMENT_NAME'),
  },
  {
    key: 'DESIG_ID',
    label: 'Designation Name',
    render: (value) => findLabel(temporaryMappingDesignations, value, 'DESIGNATION_NAME'),
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

function DesignationDepartmentMappingList() {
  return (
    <ListPage
      title={'Designation Department Mapping List'}
      createLabel={'New'}
      createTo={'/hris/employee-settings/designation-department-mapping/create'}
      filters={mappingFilters}
      columns={mappingColumns}
      rows={temporaryDesignationDepartmentMappings}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default DesignationDepartmentMappingList
