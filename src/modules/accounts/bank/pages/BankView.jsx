/**
 * @file Bank Information View page.
 * Displays read-only master bank data and the full table of associated branch/account records.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import PageHeader from '../../../../components/shared/PageHeader'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { bankApi } from '../api/bankApi'
import { mapBankFromApi } from '../data/bankApiMapper'

const listPath = '/accounts/voucher-setup/bank'

function BankView() {
  const { bankId } = useParams()
  const navigate = useNavigate()
  const [bank, setBank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      bankApi.get(bankId),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
    ])
      .then(([record, groups, units]) => {
        if (!active) return
        const groupMap = new Map(groups.map((g) => [String(g.id), g.groupName]))
        const unitMap = new Map(units.map((u) => [String(u.id), u.businessUnit]))
        setBank(mapBankFromApi(record, groupMap, unitMap))
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Bank Information.')
        navigate(listPath, { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [bankId, navigate])

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader title={'Bank Information Details'} actionLabel={'List'} actionTo={listPath} />
        <section className={'erp-form-card p-8 text-center text-gray-500'}>
          Loading bank details...
        </section>
      </div>
    )
  }

  if (!bank) return null

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Bank Information Details'} actionLabel={'List'} actionTo={listPath} />

      <section className={'erp-form-card space-y-6'}>
        {/* Master Bank Card */}
        <div className={'bg-white p-3.5 rounded border border-gray-200'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h2 className={'text-sm font-semibold text-gray-800'}>{bank.BANK_NAME}</h2>
              {bank.SHORT_NAME && (
                <span className={'px-1.5 py-0.2 text-[11px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-200'}>
                  {bank.SHORT_NAME}
                </span>
              )}
            </div>
            <span
              className={[
                'inline-flex rounded-[4px] px-[6px] py-[2px] text-[11px] font-bold leading-none text-white',
                bank.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {bank.STATUS === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs'}>
            <div>
              <span className={'block text-gray-400 font-medium'}>Group Name</span>
              <span className={'font-semibold text-gray-800'}>{bank.GROUP_NAME || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Business Unit</span>
              <span className={'font-semibold text-gray-800'}>{bank.BUSINESS_UNIT || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Total Accounts</span>
              <span className={'font-semibold text-gray-800'}>{bank.ACCOUNT_COUNT} accounts</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Active Accounts</span>
              <span className={'font-semibold text-teal-700'}>{bank.ACTIVE_ACCOUNT_COUNT} active</span>
            </div>
          </div>
        </div>

        {/* Branch & Account Table */}
        <div className={'bg-white p-3.5 rounded border border-gray-200'}>
          <div className={'flex items-center gap-2 pb-2 mb-2.5 border-b border-gray-100'}>
            <div className={'w-1.5 h-4 bg-[#0b7562] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800'}>
              Branch &amp; Account Details
            </h3>
          </div>

          <div className={'erp-table-wrap overflow-x-auto rounded border border-gray-200'}>
            <table className={'w-full text-xs text-left border-collapse'}>
              <thead className={'bg-[#0b7562] text-white font-semibold'}>
                <tr>
                  <th className={'w-10 px-2 py-1.5 text-center border-r border-[#096353]'}>#</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Branch Name</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Address</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Account Type</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Account Name</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Account Number</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Opening Date</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Opening Balance</th>
                  <th className={'w-20 px-2 py-1.5 text-center'}>Status</th>
                </tr>
              </thead>
              <tbody className={'divide-y divide-gray-200 bg-white'}>
                {bank.BANK_DETAILS.length === 0 ? (
                  <tr>
                    <td colSpan={9} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50 text-xs'}>
                      No bank accounts or branches listed.
                    </td>
                  </tr>
                ) : (
                  bank.BANK_DETAILS.map((detail, index) => (
                    <tr
                      key={detail._ROW_ID || detail.ID}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        index % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
                      }`}
                    >
                      <td className={'px-2.5 py-2 text-center text-gray-500 font-mono text-xs border-r border-gray-100'}>
                        {index + 1}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 font-medium text-gray-800'}>
                        {detail.BRANCH_NAME || '-'}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 text-gray-600'}>
                        {detail.ADDRESS || '-'}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 text-gray-700'}>
                        <span className={'px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium'}>
                          {detail.ACCOUNT_TYPE || 'Current'}
                        </span>
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 font-semibold text-gray-800'}>
                        {detail.ACCOUNT_NAME || '-'}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 font-mono text-gray-800 font-semibold'}>
                        {detail.ACCOUNT_NUMBER || '-'}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 text-gray-600'}>
                        {detail.OPENING_DATE || '-'}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 text-right font-mono text-gray-800'}>
                        {Number(detail.OPENING_BALANCE || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className={'px-2 py-2 text-center'}>
                        <span
                          className={[
                            'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                            detail.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
                          ].join(' ')}
                        >
                          {detail.STATUS === '1' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={'flex items-center justify-end gap-3 pt-2'}>
          <Link to={listPath} className={'secondary-button'}>
            Back to List
          </Link>
          <Link to={`${listPath}/${bank.ID}/edit`} className={'primary-button'}>
            Edit Bank
          </Link>
        </div>
      </section>
    </div>
  )
}

export default BankView
