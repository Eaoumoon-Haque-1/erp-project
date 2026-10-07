/**
 * @file List-page controller for Sales Agreement.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import {
  subscriptionStatusOptions,
  temporaryBusinessUnits,
  temporarySalesPeople,
} from '../validation/salesAgreementValidation'

const listPath = '/admin/sales-agreement'

function findLabel(options, value, valueKey = 'value', labelKey = 'label') {
  return options.find((option) => String(option[valueKey]) === String(value))?.[labelKey] ?? value
}

const filters = [
  {
    key: 'AGREEMENT_NO',
    label: 'Search by Agreement No.',
    placeholder: '--Search by Agreement No.--',
    matches: (row, value) => String(row.AGREEMENT_NO || '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'BU_ID',
    label: 'Search by Business Unit',
    placeholder: '--Search by Business Unit--',
    options: temporaryBusinessUnits.map((unit) => ({ label: unit.BUSINESS_UNIT, value: unit.ID })),
  },
  {
    key: 'SUBSCRIPTION_STATUS',
    label: 'Search by Subscription Status',
    placeholder: '--Search by Subscription Status--',
    options: subscriptionStatusOptions,
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
  { key: 'AGREEMENT_NO', label: 'Agreement No.' },
  {
    key: 'BU_ID',
    label: 'Business Unit',
    render: (value) => findLabel(temporaryBusinessUnits, value, 'ID', 'BUSINESS_UNIT'),
  },
  { key: 'AGREEMENT_DATE', label: 'Agreement Date', render: formatDateForDisplay },
  { key: 'CUSTOMER', label: 'Customer Contact Person' },
  {
    key: 'SALES_PERSON_ID',
    label: 'Sales Person',
    render: (value) => findLabel(temporarySalesPeople, value, 'ID', 'EMPLOYEE_NAME'),
  },
  {
    key: 'SUBSCRIPTION_STATUS',
    label: 'Subscription Status',
    render: (value) => findLabel(subscriptionStatusOptions, value),
  },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', String(value) === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

const rows = [
  {
    ID: '1',
    BU_ID: '1',
    AGREEMENT_NO: 'AGR-2026-001',
    AGREEMENT_DATE: '2026-09-23',
    CUSTOMER: 'Nadia Rahman',
    SALES_PERSON_ID: '3',
    SUBSCRIPTION_STATUS: 'ACTIVE',
    STATUS: '1',
  },
]

function SalesAgreementList() {
  return (
    <ListPage
      title={'Sales Agreement List'}
      createLabel={'New'}
      createTo={`${listPath}/create`}
      filters={filters}
      columns={columns}
      rows={rows}
      rowKey={'ID'}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default SalesAgreementList
