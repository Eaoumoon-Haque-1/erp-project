/**
 * @file Asset Specification Mapping View page.
 * Supports both Bulk View (all specifications for this item) and Single View.
 * Displays read-only asset specification mapping details and audit log block.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import PageHeader from '../../../../components/shared/PageHeader'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { assetSpecificationMapsApi } from '../api/assetSpecificationMapApi'
import { mapAssetSpecificationMapFromApi } from '../data/assetSpecificationMapApiMapper'
import { loadAssetSpecificationMapReferences } from '../data/assetSpecificationMapOptions'

const listPath = '/asset/asset-specification-map'

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

function AssetSpecificationMapView() {
  const { assetSpecificationMapId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('mode') === 'bulk' ? 'bulk' : 'single'

  const [record, setRecord] = useState(null)
  const [allItemSpecs, setAllItemSpecs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      assetSpecificationMapsApi.get(assetSpecificationMapId),
      loadAssetSpecificationMapReferences(),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(async ([item, references, groups, units, users, employees]) => {
        if (!active) return

        // If itemName is missing, resolve from assetItemsApi
        let resolvedItemName = item.itemName
        if (!resolvedItemName && item.itemNameId) {
          try {
            const itemObj = await assetItemsApi.get(item.itemNameId)
            resolvedItemName = itemObj.itemName
          } catch {
            // fallback
          }
        }

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

        const rawItem = resolvedItemName ? { ...item, itemName: resolvedItemName } : item
        const mapped = mapAssetSpecificationMapFromApi(rawItem, references, userMap, empMap)

        setRecord({
          ...mapped,
          GROUP_NAME: groupMap.get(String(mapped.BG_ID)) || '',
          BUSINESS_UNIT: unitMap.get(String(mapped.BU_ID)) || '',
        })

        // Fetch all specifications for this item to display in bulk view
        try {
          const allSpecs = await assetSpecificationMapsApi.list({
            businessUnitId: item.buId,
            itemNameId: item.itemNameId,
          })
          if (active && Array.isArray(allSpecs)) {
            const mappedAll = allSpecs
              .map((s) => mapAssetSpecificationMapFromApi(s, references, userMap, empMap))
              .sort((a, b) => Number(a.SORT_ORDER || 0) - Number(b.SORT_ORDER || 0))
            setAllItemSpecs(mappedAll)
          }
        } catch {
          // fallback
        }
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Asset Specification Mapping.')
        navigate(listPath, { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [assetSpecificationMapId, navigate])

  const handleModeChange = (mode) => {
    setSearchParams({ mode })
  }

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader
          title={'Asset Specification Mapping Details'}
          actionLabel={'Back to List'}
          actionTo={listPath}
          actionVariant={'secondary'}
        />
        <section className={'erp-form-card p-8 text-center text-gray-500'}>
          Loading asset specification mapping details...
        </section>
      </div>
    )
  }

  if (!record) return null

  // In Single View, show specific single data; in Bulk View, show last specification map data
  const lastSpecRecord =
    allItemSpecs.length > 0 ? allItemSpecs[allItemSpecs.length - 1] : record
  const auditRecord = viewMode === 'bulk' ? (lastSpecRecord || record) : record

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Specification Mapping Details'}
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
            to: `${listPath}/${assetSpecificationMapId}/edit`,
            variant: 'primary',
          },
        ]}
      />

      <section className={'erp-form-card space-y-4'}>
        {/* Mode Switcher Tabs */}
        <div className={'flex items-center gap-2 mb-1'}>
          <button
            type={'button'}
            onClick={() => handleModeChange('bulk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              viewMode === 'bulk'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            📋 Bulk View (All Specifications)
          </button>
          <button
            type={'button'}
            onClick={() => handleModeChange('single')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              viewMode === 'single'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            📄 Single View
          </button>
        </div>

        {viewMode === 'bulk' ? (
          /* =========================================================================
              BULK VIEW: ASSET ITEM & ALL SPECIFICATIONS TABLE
              ========================================================================= */
          <div className={'space-y-4'}>
            {/* Asset Item Header Card */}
            <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
              <div className={'grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs'}>
                <div>
                  <span className={'block text-gray-400 font-medium mb-0.5'}>Asset Item Name</span>
                  <span className={'font-bold text-teal-800 text-sm'}>
                    {record.ITEM_NAME_LABEL || '-'}
                  </span>
                </div>
                <div>
                  <span className={'block text-gray-400 font-medium mb-0.5'}>Group Name</span>
                  <span className={'font-semibold text-gray-800'}>{record.GROUP_NAME || '-'}</span>
                </div>
                <div>
                  <span className={'block text-gray-400 font-medium mb-0.5'}>Business Unit</span>
                  <span className={'font-semibold text-gray-800'}>{record.BUSINESS_UNIT || '-'}</span>
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            <div className={'bg-white rounded border border-gray-200 shadow-xs overflow-hidden'}>
              <div className={'p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between'}>
                <span className={'text-xs font-bold text-gray-800 uppercase tracking-wider'}>
                  Mapped Specifications ({allItemSpecs.length})
                </span>
                <span className={'text-xs text-gray-500'}>
                  Ordered by Sort Order
                </span>
              </div>

              <div className={'overflow-x-auto'}>
                <table className={'w-full text-left border-collapse text-xs'}>
                  <thead>
                    <tr className={'bg-gray-100/75 border-b border-gray-200 text-gray-700 font-semibold'}>
                      <th className={'py-2.5 px-3 w-16 text-center'}>Sort Order</th>
                      <th className={'py-2.5 px-4'}>Specification</th>
                      <th className={'py-2.5 px-3 w-28 text-center'}>Status</th>
                      <th className={'py-2.5 px-4 w-44'}>Created By</th>
                      <th className={'py-2.5 px-4 w-44'}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allItemSpecs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={'py-8 text-center text-gray-400 italic'}>
                          No specifications mapped to this item yet.
                        </td>
                      </tr>
                    ) : (
                      allItemSpecs.map((itemSpec, idx) => (
                        <tr
                          key={itemSpec.ID || idx}
                          className={'border-b border-gray-100 hover:bg-gray-50/60 transition-colors'}
                        >
                          <td className={'py-2.5 px-3 text-center align-middle'}>
                            <span className={'inline-flex items-center justify-center w-7 h-6 rounded bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200'}>
                              {itemSpec.SORT_ORDER || idx + 1}
                            </span>
                          </td>
                          <td className={'py-2.5 px-4 font-semibold text-gray-800 align-middle'}>
                            {itemSpec.SPECIFICATION_NAME || itemSpec.SPECIFICATION || '-'}
                          </td>
                          <td className={'py-2.5 px-3 text-center align-middle'}>
                            <span
                              className={[
                                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                                itemSpec.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
                              ].join(' ')}
                            >
                              {itemSpec.STATUS === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className={'py-2.5 px-4 text-gray-600 align-middle'}>
                            {itemSpec.CREATED_EMP_NAME || itemSpec.CREATED_USER_NAME || '-'}
                          </td>
                          <td className={'py-2.5 px-4 text-gray-600 align-middle'}>
                            {formatAuditDateTime(itemSpec.CREATED_DATETIME)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              SINGLE VIEW: SINGLE SPECIFICATION MAPPING DETAILS
              ========================================================================= */
          <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
            <div className={'flex items-center justify-end pb-2 mb-3 border-b border-gray-100'}>
              <span
                className={[
                  'inline-flex rounded-[4px] px-[6px] py-[2px] text-[11px] font-bold leading-none text-white',
                  record.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
                ].join(' ')}
              >
                {record.STATUS === '1' ? 'Active' : 'Inactive'}
              </span>
            </div>

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
                <span className={'block text-gray-400 font-medium'}>Status</span>
                <span className={'font-semibold text-gray-800'}>
                  {record.STATUS === '1' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className={'block text-gray-400 font-medium'}>Asset Item Name</span>
                <div className={'mt-0.5'}>
                  <span className={'font-semibold text-teal-800 text-sm'}>
                    {record.ITEM_NAME_LABEL || '-'}
                  </span>
                </div>
              </div>
              <div>
                <span className={'block text-gray-400 font-medium'}>Specification</span>
                <span className={'font-semibold text-gray-800'}>
                  {record.SPECIFICATION_NAME || record.SPECIFICATION || '-'}
                </span>
              </div>
              <div>
                <span className={'block text-gray-400 font-medium'}>Sort Order</span>
                <span className={'font-semibold text-gray-800'}>
                  {record.SORT_ORDER || '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            AUDIT LOG CARD (LIKE CUSTODIAN AUDIT LOG BLOCK FOR BOTH BULK & SINGLE VIEW)
            ========================================================================= */}
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
                String(auditRecord.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(auditRecord.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
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
                  {auditRecord.CREATED_USER_NAME || auditRecord.CREATED_USER_ID || '-'}
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
                  {auditRecord.CREATED_EMP_NAME || auditRecord.CREATED_EMP_ID || '-'}
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
                  {formatAuditDateTime(auditRecord.CREATED_DATETIME)}
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
                  {auditRecord.CREATED_APP || '-'}
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
                  {auditRecord.UPDATED_USER_NAME || auditRecord.UPDATED_USER_ID || '-'}
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
                  {auditRecord.UPDATED_EMP_NAME || auditRecord.UPDATED_EMP_ID || '-'}
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
                  {formatAuditDateTime(auditRecord.UPDATED_DATETIME)}
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
                  {auditRecord.UPDATED_APP || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AssetSpecificationMapView
