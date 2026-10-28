/**
 * @file Modal dialog rendering full printable Chart of Accounts report.
 */
import { useMemo } from 'react'
import Modal from '../../../../components/shared/Modal'
import { buildAccountTree } from './AfmChartOfAccountsTree'

function flattenTreeForReport(nodes, depth = 0) {
  let list = []
  nodes.forEach((node) => {
    list.push({ ...node, depth })
    if (node.children && node.children.length > 0) {
      list = list.concat(flattenTreeForReport(node.children, depth + 1))
    }
  })
  return list
}

function AfmChartOfAccountsReportModal({
  open,
  onClose,
  accounts = [],
  businessUnitName = '',
}) {
  const tree = useMemo(() => buildAccountTree(accounts), [accounts])
  const flatRows = useMemo(() => flattenTreeForReport(tree), [tree])

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      title="Chart of Accounts Report"
      open={open}
      onClose={onClose}
      panelClassName="max-w-5xl w-full"
    >
      <div className="p-4 space-y-4">
        {/* Printable Header */}
        <div className="flex justify-between items-start pb-3 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {businessUnitName || 'Business Unit'} - Chart of Accounts Report
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Date: {new Date().toLocaleDateString()} | Total Accounts: {flatRows.length}
            </p>
          </div>
          <div className="flex space-x-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00a8b5] hover:bg-[#00929d] rounded shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-2a1 1 0 011-1h8a1 1 0 011 1v2h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm2 0h6v3H7V4zm-2 9v4h10v-4H5zm9-3a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              Print Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2 px-3 border-r border-gray-200 w-36">Account Code</th>
                <th className="py-2 px-3 border-r border-gray-200">Account Head Name</th>
                <th className="py-2 px-3 border-r border-gray-200 w-28">Ledger Head</th>
                <th className="py-2 px-3 border-r border-gray-200 w-28">Account Type</th>
                <th className="py-2 px-3 border-r border-gray-200 w-24">Usage</th>
                <th className="py-2 px-3 border-r border-gray-200 w-16 text-center">Level</th>
                <th className="py-2 px-3 w-20 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {flatRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    No account heads recorded for this business unit.
                  </td>
                </tr>
              ) : (
                flatRows.map((row) => {
                  const code = row.accountCode ?? row.ACCOUNT_CODE ?? ''
                  const name = row.accountHeadName ?? row.ACCOUNT_HEAD_NAME ?? ''
                  const ledger = row.ledgerHead ?? row.LEDGER_HEAD ?? ''
                  const type = row.accountHeadType ?? row.ACCOUNT_HEAD_TYPE ?? ''
                  const usage = row.accountUsage ?? row.ACCOUNT_USAGE ?? 'None'
                  const level = row.level ?? row.LEVEL ?? (row.depth + 1)
                  const isActive = String(row.status ?? row.STATUS ?? 1) === '1'

                  return (
                    <tr
                      key={row._id || row.id}
                      className={row.depth === 0 ? 'bg-gray-50/70 font-semibold' : 'hover:bg-gray-50/50'}
                    >
                      <td className="py-1.5 px-3 border-r border-gray-200 font-mono text-gray-900">
                        {code}
                      </td>
                      <td className="py-1.5 px-3 border-r border-gray-200 text-gray-800">
                        <span style={{ paddingLeft: `${row.depth * 18}px` }} className="inline-flex items-center">
                          {row.depth > 0 && <span className="text-gray-400 mr-1.5">└─</span>}
                          {name}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 border-r border-gray-200 text-gray-700">
                        {ledger}
                      </td>
                      <td className="py-1.5 px-3 border-r border-gray-200 text-gray-700">
                        {type}
                      </td>
                      <td className="py-1.5 px-3 border-r border-gray-200 text-gray-700">
                        {usage}
                      </td>
                      <td className="py-1.5 px-3 border-r border-gray-200 text-center text-gray-600">
                        {level}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                            isActive ? 'bg-emerald-600' : 'bg-rose-500'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

export default AfmChartOfAccountsReportModal
