/**
 * @file Asset Book Register View page.
 * Displays read-only asset basic information, asset allocation, and audit log block.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import PageHeader from '../../../../components/shared/PageHeader'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { assetBookRegisterApi } from '../api/assetBookRegisterApi'
import { mapAssetBookRegisterFromApi } from '../data/assetBookRegisterApiMapper'
import { loadAssetBookRegisterReferences } from '../data/assetBookRegisterOptions'

const listPath = '/asset/asset-book-register'

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

function AssetBookRegisterView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      assetBookRegisterApi.get(id),
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
            const uId = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? uId
            return [uId, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const eId = String(e.id ?? e.ID ?? '')
            const code = String(e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '').trim()
            const name = String(e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '').trim()
            const display = code && name ? `${code}: ${name}` : code || name || eId
            return [eId, display]
          }),
        )

        const references = await loadAssetBookRegisterReferences(item.buId, item.bgId).catch(
          () => ({}),
        )

        if (!active) return
        setRecord(
          mapAssetBookRegisterFromApi(item, references, userMap, empMap, groupMap, unitMap),
        )
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Asset Book Register.')
        navigate(listPath, { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader
          title={'Asset Book Register Details'}
          actionLabel={'Back to List'}
          actionTo={listPath}
          actionVariant={'secondary'}
        />
        <section className={'erp-form-card p-8 text-center text-gray-500'}>
          Loading asset book register details...
        </section>
      </div>
    )
  }

  if (!record) return null

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Book Register Details'}
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
            to: `${listPath}/${id}/edit`,
            variant: 'primary',
          },
        ]}
      />

      <section className={'erp-form-card space-y-4'}>
        {/* Section 1: Asset Basic Information (4 Columns) */}
        <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs space-y-3.5'}>
          <div className={'flex items-center gap-2 pb-2 border-b border-gray-100'}>
            <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Asset Basic Information
            </h3>
          </div>

          <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs'}>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset No</span>
              <span className={'font-semibold text-teal-800 text-sm'}>
                {record.ASSET_NO || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Item</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ASSET_ITEM_NAME || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Unit</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ASSET_UNIT || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Depreciation Major Category</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ASSET_MAJOR_CATEGORY_NAME || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Owner</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ASSET_OWNER_NAME || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Asset Allocation (4 Columns) */}
        <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs space-y-3.5'}>
          <div className={'flex items-center gap-2 pb-2 border-b border-gray-100'}>
            <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Asset Allocation
            </h3>
          </div>

          <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs'}>
            <div>
              <span className={'block text-gray-400 font-medium'}>Allocation Type</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ALLOCATION_TYPE || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Employee Name</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ALLOCATION_REF_NAME || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Usages Status</span>
              <span className={'font-semibold text-gray-800'}>
                {record.USAGE_STATUS || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Condition</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ASSET_CONDITION || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Asset Status</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ASSET_STATUS || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Allocation Date</span>
              <span className={'font-semibold text-gray-800'}>
                {record.ALLOCATION_DATE || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Status</span>
              <span
                className={[
                  'inline-flex rounded-[4px] px-[6px] py-[2px] text-[11px] font-bold leading-none text-white',
                  record.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
                ].join(' ')}
              >
                {record.STATUS === '1' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
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
                String(record.STATUS ?? '1') === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
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

export default AssetBookRegisterView
