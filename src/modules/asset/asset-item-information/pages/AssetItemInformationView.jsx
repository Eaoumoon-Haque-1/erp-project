/**
 * @file Asset Item Information View page.
 * Displays read-only asset item information details and audit log block.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import PageHeader from '../../../../components/shared/PageHeader'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { assetItemsApi } from '../api/assetItemApi'
import { mapAssetItemFromApi } from '../data/assetItemApiMapper'
import { loadAssetItemReferences } from '../data/assetItemInformationOptions'

const listPath = '/asset/asset-item-information'

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

function AssetItemInformationView() {
  const { assetItemId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      assetItemsApi.get(assetItemId),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(async ([item, groups, units, users, employees]) => {
        if (!active) return

        const groupMap = new Map((groups || []).map((g) => [String(g.id), g.groupName]))
        const unitMap = new Map((units || []).map((u) => [String(u.id), u.businessUnit]))
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
            const display = code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        const references = await loadAssetItemReferences(item.buId, item.bgId).catch(() => ({}))

        if (!active) return
        setRecord(
          mapAssetItemFromApi(
            item,
            references,
            userMap,
            empMap,
            groupMap,
            unitMap,
          ),
        )
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Asset Item.')
        navigate(listPath, { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [assetItemId, navigate])

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader
          title={'Asset Item Information Details'}
          actionLabel={'Back to List'}
          actionTo={listPath}
          actionVariant={'secondary'}
        />
        <section className={'erp-form-card p-8 text-center text-gray-500'}>
          Loading asset item details...
        </section>
      </div>
    )
  }

  if (!record) return null

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Item Information Details'}
        actionLabel={'Back to List'}
        actionTo={listPath}
        actionVariant={'secondary'}
        actions={[
          {
            label: 'Create New',
            to: `${listPath}/create`,
            variant: 'secondary',
          },
          {
            label: 'Edit',
            to: `${listPath}/${assetItemId}/edit`,
            variant: 'primary',
          },
        ]}
      />

      <section className={'erp-form-card space-y-6'}>
        {/* Main Details Card */}
        <div className={'bg-white p-4 rounded border border-gray-200'}>
          <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs'}>
            <div>
              <span className={'block text-gray-400 font-medium'}>Group Name</span>
              <span className={'font-semibold text-gray-800'}>{record.GROUP_NAME || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Business Unit</span>
              <span className={'font-semibold text-gray-800'}>{record.BUSINESS_UNIT || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Item Name</span>
              <div className={'mt-0.5'}>
                <span className={'font-semibold text-teal-800 text-sm'}>
                  {record.ITEM_NAME || '-'}
                </span>
              </div>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Item Group</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ITEM_GROUP_NAME || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Major Category</span>
              <span className={'font-semibold text-gray-800'}>
                {record.DEPRI_CATEGORY_NAME || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Depreciation Method</span>
              <span className={'font-semibold text-gray-800'}>
                {record.DEPRI_METHOD || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Type</span>
              <span className={'font-semibold text-gray-800'}>
                {record.CATEGORY_TYPE || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Depreciation Life (Months)</span>
              <span className={'font-semibold text-gray-800'}>
                {record.DEPRI_LIFE ? `${record.DEPRI_LIFE} Months` : '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Depreciation (%)</span>
              <span className={'font-semibold text-gray-800'}>
                {record.DEPRI_PERCENTAGE ? `${record.DEPRI_PERCENTAGE}%` : '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Owner</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ASSET_OWNER || '-'}
              </span>
            </div>
            <div data-column={'ITEM_PIECE_OR_SET'}>
              <span className={'block text-gray-400 font-medium'}>Item Unit</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ITEM_PIECE_OR_SET || 'Piece'}
              </span>
            </div>
          </div>
        </div>

        {/* Asset Item Sets (ASSET_ITEM_SET) — shown only when Item Unit is Set */}
        {record.ITEM_PIECE_OR_SET === 'Set' && (
          <div className={'bg-white p-3.5 rounded border border-gray-200'}>
            <div className={'flex items-center gap-2 pb-2 mb-2.5 border-b border-gray-100'}>
              <div className={'w-1.5 h-4 bg-[#0b7562] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800'}>
                Asset Item Sets
              </h3>
              <span className={'ml-2 px-1.5 py-0.2 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded'}>
                {(record.ITEM_SETS || []).length} {(record.ITEM_SETS || []).length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div className={'erp-table-wrap overflow-x-auto rounded border border-gray-200'}>
              <table className={'w-full text-xs text-left border-collapse'}>
                <thead className={'bg-[#0b7562] text-white font-semibold'}>
                  <tr>
                    <th className={'w-12 px-2 py-1.5 text-center border-r border-[#096353]'}>#</th>
                    <th className={'px-2.5 py-1.5 border-r border-[#096353]'}>Item Name</th>
                    <th className={'w-24 px-2.5 py-1.5 text-center border-r border-[#096353]'}>Sort Order</th>
                    <th className={'w-24 px-2.5 py-1.5 text-center'}>Status</th>
                  </tr>
                </thead>
                <tbody className={'divide-y divide-gray-200 bg-white'}>
                  {!record.ITEM_SETS || record.ITEM_SETS.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50 text-xs'}>
                        No set items recorded.
                      </td>
                    </tr>
                  ) : (
                    record.ITEM_SETS.map((setRow, idx) => (
                      <tr
                        key={setRow.ID || setRow._ROW_ID || idx}
                        className={`hover:bg-teal-50/20 transition-colors ${
                          idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                        }`}
                      >
                        <td className={'px-2 py-1 text-center text-gray-500 font-mono text-xs border-r border-gray-100'}>
                          {idx + 1}
                        </td>
                        <td className={'px-2.5 py-1.5 font-semibold text-gray-800 border-r border-gray-100'}>
                          {setRow.ITEM_NAME || '-'}
                        </td>
                        <td className={'px-2.5 py-1.5 text-center font-mono text-gray-700 border-r border-gray-100'}>
                          {setRow.SORT_ORDER || idx + 1}
                        </td>
                        <td className={'px-2.5 py-1.5 text-center'}>
                          <span
                            className={[
                              'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                              String(setRow.STATUS ?? '1') === '1'
                                ? 'bg-[#32c497]'
                                : 'bg-[#fa5c70]',
                            ].join(' ')}
                          >
                            {String(setRow.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                  {record.CREATED_USER_NAME || record.CREATED_USER_ID || record.CREATED_BY || '-'}
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
                  {formatAuditDateTime(record.CREATED_DATETIME || record.CREATED_AT)}
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
                  {record.UPDATED_USER_NAME || record.UPDATED_USER_ID || record.UPDATED_BY || '-'}
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
                  {formatAuditDateTime(record.UPDATED_DATETIME || record.UPDATED_AT)}
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

export default AssetItemInformationView
