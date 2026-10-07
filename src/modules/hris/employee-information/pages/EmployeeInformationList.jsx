/**
 * @file List-page controller for Employee Information.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import { businessUnitOptions, departmentOptions, employmentStatusOptions } from '../data/employeeOptions'

const columns = [
  { key: 'EMPLOYEE_ID', label: 'Employee ID' },
  { key: 'EMPLOYEE_NAME', label: 'Employee Name' },
  { key: 'DEPARTMENT_NAME', label: 'Department' },
  { key: 'DESIGNATION_NAME', label: 'Designation' },
  {
    key: 'EMPLOYMENT_STATUS',
    label: 'Employment Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
          value === 'ACTIVE' ? 'bg-action-success' : 'bg-action-danger',
        ].join(' ')}
      >
        {value === 'ACTIVE' ? 'Active' : value}
      </span>
    ),
  },
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
]

const filters = [
  { key: 'BUSINESS_UNIT_ID', label: 'Business Unit', placeholder: '--Search by Business Unit--', options: businessUnitOptions },
  { key: 'DEPARTMENT_ID', label: 'Department', placeholder: '--Search by Department--', options: departmentOptions },
  { key: 'EMPLOYMENT_STATUS', label: 'Employment Status', placeholder: '--Search by Employment Status--', options: employmentStatusOptions },
]

const rows = [
  {
    ID: '1',
    EMPLOYEE_ID: 'EMP-0101',
    EMPLOYEE_NAME: 'Samira Rahman',
    DEPARTMENT_NAME: 'Human Resources',
    DESIGNATION_NAME: 'HR Executive',
    EMPLOYMENT_STATUS: 'ACTIVE',
    BUSINESS_UNIT_NAME: 'Head Office',
    BUSINESS_UNIT_ID: '1',
    DEPARTMENT_ID: '1',
  },
  {
    ID: '2',
    EMPLOYEE_ID: 'EMP-0102',
    EMPLOYEE_NAME: 'Tanvir Hasan',
    DEPARTMENT_NAME: 'Administration',
    DESIGNATION_NAME: 'Senior Officer',
    EMPLOYMENT_STATUS: 'ACTIVE',
    BUSINESS_UNIT_NAME: 'Head Office',
    BUSINESS_UNIT_ID: '1',
    DEPARTMENT_ID: '3',
  },
  {
    ID: '3',
    EMPLOYEE_ID: 'EMP-0103',
    EMPLOYEE_NAME: 'Md. Eaoumoon Haque',
    DEPARTMENT_NAME: 'Software & IT',
    DESIGNATION_NAME: 'Software Engineer',
    EMPLOYMENT_STATUS: 'ACTIVE',
    BUSINESS_UNIT_NAME: 'Factory Unit',
    BUSINESS_UNIT_ID: '2',
    DEPARTMENT_ID: '2',
  },
]

function ActionButton({ label, className, onClick, children }) {
  return (
    <button
      type={'button'}
      className={[
        'inline-flex h-6 w-[34px] items-center justify-center rounded px-2 py-[3px] text-sm text-white shadow-sm transition',
        'hover:-translate-y-px hover:brightness-95 hover:shadow',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      ].join(' ')}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function EmployeeInformationList() {
  const navigate = useNavigate()
  return (
    <ListPage
      title={'Employee Information List'}
      createLabel={'New'}
      createTo={'/hris/hris-forms/employee-information/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <div className={'inline-flex items-center gap-1'}>
          {/* 1. View Button */}
          <ActionButton
            label={'View'}
            className={'bg-action-view'}
            onClick={() => navigate(`/hris/hris-forms/employee-information/${row.ID}`)}
          >
            <svg
              viewBox={'0 0 24 24'}
              className={'size-4'}
              fill={'none'}
              stroke={'currentColor'}
              strokeWidth={'2'}
              strokeLinecap={'round'}
              strokeLinejoin={'round'}
            >
              <path d={'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z'} />
              <circle cx={'12'} cy={'12'} r={'2.5'} />
            </svg>
          </ActionButton>

          {/* 2. Edit Button */}
          <ActionButton
            label={'Edit'}
            className={'bg-action-edit'}
            onClick={() => navigate(`/hris/hris-forms/employee-information/${row.ID}/edit`)}
          >
            <svg
              viewBox={'0 0 24 24'}
              className={'size-4'}
              fill={'none'}
              stroke={'currentColor'}
              strokeWidth={'2'}
              strokeLinecap={'round'}
              strokeLinejoin={'round'}
            >
              <path d={'M12 20h9'} />
              <path d={'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z'} />
            </svg>
          </ActionButton>

          {/* 3. Delete Button */}
          <ActionButton
            label={'Delete'}
            className={'bg-action-danger'}
            onClick={() => {}}
          >
            <svg
              viewBox={'0 0 24 24'}
              className={'size-4'}
              fill={'none'}
              stroke={'currentColor'}
              strokeWidth={'2'}
              strokeLinecap={'round'}
              strokeLinejoin={'round'}
            >
              <path d={'M4 7h16'} />
              <path d={'M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5'} />
            </svg>
          </ActionButton>

          {/* 4. Human / User Profile Icon Button */}
          <ActionButton
            label={'User Creation From Employee'}
            className={'bg-[#02aab0]'}
            onClick={() => navigate(`/hris/hris-forms/employee-information/${row.ID}/user-creation`)}
          >
            <svg
              viewBox={'0 0 24 24'}
              className={'size-4'}
              fill={'none'}
              stroke={'currentColor'}
              strokeWidth={'2'}
              strokeLinecap={'round'}
              strokeLinejoin={'round'}
            >
              <path d={'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'} />
              <circle cx={'12'} cy={'7'} r={'4'} />
            </svg>
          </ActionButton>
        </div>
      )}
    />
  )
}

export default EmployeeInformationList
