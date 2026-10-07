/**
 * @file List-page controller for Payscale.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

const columns = [
  { key: 'GRADE_NAME', label: 'Grade Name' },
  { key: 'TOTAL_STAGES', label: 'Total Stages' },
]

function PayscaleList() {
  return (
    <ListPage
      title={'Pay Scale List'}
      createLabel={'New'}
      createTo={'/hris/employee-settings/payscale/create'}
      columns={columns}
      rows={[]}
      renderActions={(row) => <ListRowActions row={row} />}
    />
  )
}

export default PayscaleList
