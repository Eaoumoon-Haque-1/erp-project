/**
 * @file AFM Lookup Type View page.
 * Displays read-only master lookup type data and the full table of associated lookup values.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import PageHeader from '../../../../components/shared/PageHeader'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { afmLookupApi } from '../api/afmLookupApi'
import { mapLookupTypeFromApi } from '../data/afmLookupApiMapper'

const listPath = '/accounts/voucher-setup/lookup'

function formatAuditDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `${day}/${month}/${year} ${time}`
}

function AfmLookupView() {
  const { lookupId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      afmLookupApi.get(lookupId),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([item, groups, units, users, employees]) => {
        if (!active) return
        const groupMap = new Map(groups.map((g) => [String(g.id), g.groupName]))
        const unitMap = new Map(units.map((u) => [String(u.id), u.businessUnit]))
        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display =
              code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )
        setRecord(mapLookupTypeFromApi(item, groupMap, unitMap, userMap, empMap))
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Lookup Type.')
        navigate(listPath, { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [lookupId, navigate])

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader title={'Lookup Type Details'} actionLabel={'List'} actionTo={listPath} />
        <section className={'erp-form-card p-8 text-center text-gray-500'}>
          Loading lookup type details...
        </section>
      </div>
    )
  }

  if (!record) return null

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Lookup Type Details'} actionLabel={'List'} actionTo={listPath} />

      <section className={'erp-form-card space-y-6'}>
        {/* Master Lookup Type Card */}
        <div className={'bg-white p-3.5 rounded border border-gray-200'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h2 className={'text-sm font-semibold text-gray-800'}>{record.TYPE_NAME}</h2>
              {record.TYPE_CODE && (
                <span className={'px-1.5 py-0.2 text-[11px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase font-mono'}>
                  {record.TYPE_CODE}
                </span>
              )}
            </div>
            <span
              className={[
                'inline-flex rounded-[4px] px-[6px] py-[2px] text-[11px] font-bold leading-none text-white',
                record.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {record.STATUS === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs'}>
            <div>
              <span className={'block text-gray-400 font-medium'}>Group Name</span>
              <span className={'font-semibold text-gray-800'}>{record.GROUP_NAME || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Business Unit</span>
              <span className={'font-semibold text-gray-800'}>{record.BUSINESS_UNIT || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Total Values</span>
              <span className={'font-semibold text-gray-800'}>{record.VALUE_COUNT} values</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Active Values</span>
              <span className={'font-semibold text-teal-700'}>{record.ACTIVE_VALUE_COUNT} active</span>
            </div>
          </div>
        </div>

        {/* Lookup Values Table */}
        <div className={'bg-white p-3.5 rounded border border-gray-200'}>
          <div className={'flex items-center gap-2 pb-2 mb-2.5 border-b border-gray-100'}>
            <div className={'w-1.5 h-4 bg-[#0b7562] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800'}>
              Lookup Values
            </h3>
          </div>

          <div className={'erp-table-wrap overflow-x-auto rounded border border-gray-200'}>
            <table className={'w-full text-xs text-left border-collapse'}>
              <thead className={'bg-[#0b7562] text-white font-semibold'}>
                <tr>
                  <th className={'w-12 px-2 py-1.5 text-center border-r border-[#096353]'}>#</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Lookup Value</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Lookup Value Code</th>
                  <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Note</th>
                  <th className={'w-24 px-2.5 py-1.5 text-center border-r border-[#096353]'}>Sort Order</th>
                  <th className={'w-24 px-2 py-1.5 text-center'}>Status</th>
                </tr>
              </thead>
              <tbody className={'divide-y divide-gray-200 bg-white'}>
                {record.LOOKUP_VALUES.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50 text-xs'}>
                      No lookup values recorded.
                    </td>
                  </tr>
                ) : (
                  record.LOOKUP_VALUES.map((val, index) => (
                    <tr
                      key={val._ROW_ID || val.ID}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        index % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
                      }`}
                    >
                      <td className={'px-2.5 py-2 text-center text-gray-500 font-mono text-xs border-r border-gray-100'}>
                        {index + 1}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 font-medium text-gray-800'}>
                        {val.VALUE || '-'}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 font-mono text-gray-800'}>
                        {val.VALUE_CODE ? (
                          <span className={'px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold'}>
                            {val.VALUE_CODE}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 text-gray-700 whitespace-pre-wrap break-words'}>
                        {val.NOTE || '-'}
                      </td>
                      <td className={'px-3 py-2 border-r border-gray-100 text-center font-mono text-gray-700'}>
                        {val.SORT_ORDER || '-'}
                      </td>
                      <td className={'px-2 py-2 text-center'}>
                        <span
                          className={[
                            'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                            val.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
                          ].join(' ')}
                        >
                          {val.STATUS === '1' ? 'Active' : 'Inactive'}
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
          <Link to={`${listPath}/${record.ID}/edit`} className={'primary-button'}>
            Edit Lookup Type
          </Link>
        </div>

        {/* Audit Log Block */}
        <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
                Audit Log :
              </h3>
            </div>
            <span
              data-column={'STATUS'}
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                String(record.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(record.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'space-y-3 text-xs'}>
            {/* Row 1: Created Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div
                data-column={'CREATED_USER_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.CREATED_USER_NAME || record.CREATED_USER_ID || '-'}
                </span>
              </div>

              <div
                data-column={'CREATED_EMP_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.CREATED_EMP_NAME || record.CREATED_EMP_ID || '-'}
                </span>
              </div>

              <div
                data-column={'CREATED_DATETIME'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created At:
                </span>
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(record.CREATED_DATETIME)}
                </span>
              </div>

              <div
                data-column={'CREATED_APP'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.CREATED_APP || '-'}
                </span>
              </div>
            </div>

            {/* Row 2: Updated Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div
                data-column={'UPDATED_USER_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.UPDATED_USER_NAME || record.UPDATED_USER_ID || '-'}
                </span>
              </div>

              <div
                data-column={'UPDATED_EMP_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.UPDATED_EMP_NAME || record.UPDATED_EMP_ID || '-'}
                </span>
              </div>

              <div
                data-column={'UPDATED_DATETIME'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated At:
                </span>
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(record.UPDATED_DATETIME)}
                </span>
              </div>

              <div
                data-column={'UPDATED_APP'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.UPDATED_APP || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AfmLookupView
