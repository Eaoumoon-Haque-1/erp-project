/**
 * @file List-page controller for Sales Payment Process.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useState } from 'react'
import ListPage from '../../../../components/shared/ListPage'
import BillCollectionModal from '../components/BillCollectionModal'

export const SALES_PAYMENT_PROCESS_TABLE = 'HR_SALES_PAYMENT_PROCESS'

const businessUnits = [
  { value: '1', label: 'Head Office' },
  { value: '2', label: 'Factory Unit' },
  { value: '3', label: 'Sales Office' },
]

const billingCycles = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half Yearly' },
  { value: 'YEARLY', label: 'Yearly' },
]

function findLabel(options, value) {
  return options.find((option) => option.value === String(value))?.label ?? value
}

function formatAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value
}

const filters = [
  {
    key: 'BU_ID',
    label: 'Search by Business Unit',
    placeholder: '--Search by Business Unit--',
    options: businessUnits,
  },
  {
    key: 'PRODUCT_TITLE',
    label: 'Search by Product Title',
    placeholder: '--Search by Product Title--',
    matches: (row, value) => String(row.PRODUCT_TITLE || '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'BILLING_CYCLE',
    label: 'Search by Billing Cycle',
    placeholder: '--Search by Billing Cycle--',
    options: billingCycles,
  },
]

const columns = [
  {
    key: 'BU_ID',
    label: 'Business Unit',
    render: (value) => findLabel(businessUnits, value),
  },
  { key: 'PRODUCT_TITLE', label: 'Product Title' },
  {
    key: 'BILLING_CYCLE',
    label: 'Billing Cycle',
    render: (value) => findLabel(billingCycles, value),
  },
  { key: 'BILLING_AMOUNT', label: 'Billing Amount', render: formatAmount },
  { key: 'VAT', label: 'VAT', render: formatAmount },
  { key: 'TAX', label: 'TAX', render: formatAmount },
  { key: 'TOTAL_PAYABLE', label: 'Total Payable', render: formatAmount },
]

const initialRows = [
  {
    ID: '1',
    BU_ID: '1',
    AGRIMENT_ID: '1',
    AGREEMENT_NO: 'AGR-2026-001',
    PRODUCT_TITLE: 'HR Xpert',
    BILLING_CYCLE: 'MONTHLY',
    BILLING_AMOUNT: '50000',
    VAT: '7500',
    TAX: '2500',
    TOTAL_PAYABLE: '60000',
    IS_BILL_COLLECTED: '0',
  },
]

function CollectBillButton({ row, onClick }) {
  if (row.IS_BILL_COLLECTED === '1') {
    return (
      <span className={'inline-flex rounded-[5px] bg-action-success px-2 py-1 text-xs font-bold leading-none text-white shadow-sm'}>
        Collected
      </span>
    )
  }

  return (
    <button
      type={'button'}
      className={'primary-button whitespace-nowrap'}
      aria-label={`Collect bill for ${row.PRODUCT_TITLE}`}
      onClick={() => onClick(row)}
    >
      Collect Bill
    </button>
  )
}

function SalesPaymentProcessList() {
  const [rows, setRows] = useState(initialRows)
  const [selectedPayment, setSelectedPayment] = useState(null)

  const closeModal = () => setSelectedPayment(null)

  const handleSave = (collectionValues) => {
    setRows((current) => current.map((row) => (
      row.ID === selectedPayment.ID
        ? {
            ...row,
            IS_BILL_COLLECTED: collectionValues.IS_BILL_COLLECTED,
            BILL_COLLECTION_ID: `TEMP-${row.ID}`,
          }
        : row
    )))
    closeModal()
  }

  return (
    <>
      <div data-table={SALES_PAYMENT_PROCESS_TABLE}>
        <ListPage
          title={'Sales Payment Process List'}
          filters={filters}
          columns={columns}
          rows={rows}
          rowKey={'ID'}
          renderActions={(row) => (
            <CollectBillButton row={row} onClick={setSelectedPayment} />
          )}
        />
      </div>

      {selectedPayment && (
        <BillCollectionModal
          key={selectedPayment.ID}
          open
          payment={selectedPayment}
          businessUnitName={findLabel(businessUnits, selectedPayment.BU_ID)}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </>
  )
}

export default SalesPaymentProcessList
