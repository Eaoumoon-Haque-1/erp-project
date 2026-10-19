/**
 * @file List-page controller for Employee Information.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { employeesApi } from '../api/employeeApi'
import { mapEmployeeListFromApi } from '../data/employeeApiMapper'
import { createEmployeeReferenceNames, loadEmployeeReferences } from '../data/employeeReferences'

const columns = [
  { key: 'EMPLOYEE_ID', label: 'Employee ID' },
  { key: 'EMPLOYEE_NAME', label: 'Employee Name' },
  { key: 'DEPARTMENT_NAME', label: 'Department' },
  { key: 'DESIGNATION_NAME', label: 'Designation' },
  {
    key: 'EMPLOYMENT_STATUS_NAME',
    label: 'Employment Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
          /active|confirm|probation/i.test(value) ? 'bg-action-success' : 'bg-action-danger',
        ].join(' ')}
      >
        {value || 'N/A'}
      </span>
    ),
  },
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
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
  const [rows, setRows] = useState([])
  const [options, setOptions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([employeesApi.list(), loadEmployeeReferences()])
      .then(([records, referenceResult]) => {
        if (!active) return
        const names = createEmployeeReferenceNames(referenceResult.references)
        setRows(records.map((record) => mapEmployeeListFromApi(record, names)))
        setOptions(referenceResult.options)
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Employees.'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BUSINESS_UNIT_ID', label: 'Business Unit', placeholder: '--Search by Business Unit--', options: options.businessUnitOptions || [] },
    { key: 'DEPARTMENT_ID', label: 'Department', placeholder: '--Search by Department--', options: options.departmentOptions || [] },
    { key: 'EMPLOYMENT_STATUS', label: 'Employment Status', placeholder: '--Search by Employment Status--', options: options.employmentStatusOptions || [] },
  ], [options])

  return (
    <ListPage
      title={'Employee Information List'}
      createLabel={'New'}
      createTo={'/hris/hris-forms/employee-information/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <div className={'inline-flex items-center gap-1'}>
          <ListRowActions
            row={row}
            entityName={'Employee Information'}
            onView={() => navigate(`/hris/hris-forms/employee-information/${row.ID}/view`)}
            onEdit={() => navigate(`/hris/hris-forms/employee-information/${row.ID}/edit`)}
          />

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
