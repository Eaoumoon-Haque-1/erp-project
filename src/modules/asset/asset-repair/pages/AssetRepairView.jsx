/** @file Read-only Asset Repair details loaded from the API with Audit Log. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import AuditLogSection from '../../../../components/shared/AuditLogSection'
import { getApiErrorMessage } from '../../../../api/errors'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { assetRepairApi } from '../api/assetRepairApi'
import { mapAssetRepairFromApi } from '../data/assetRepairApiMapper'
import { loadAssetRepairReferences } from '../data/assetRepairOptions'

const basePath = '/asset/asset-repair'

function AssetRepairView() {
  const { repairId } = useParams()
  const { session } = useAuth()
  const sessionBusinessUnitId = session?.buId ? String(session.buId) : ''

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetRepairApi.get(repairId),
      loadAssetRepairReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setRecord(mapAssetRepairFromApi(apiRecord, refs))
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Unable to load Asset Repair.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [repairId, sessionBusinessUnitId])

  const editPath = record ? `${basePath}/${repairId}/edit` : ''
  const activeStatus = String(record?.STATUS ?? 1) === '1'
  const isDelivered = Boolean(record?.DELIVERY_DATE)

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Repair View'}
        actionLabel={'List'}
        actionTo={basePath}
        actions={editPath ? [{ label: 'Edit', to: editPath, variant: 'secondary' }] : []}
      />

      <section className={'erp-form-card'}>
        {loading && <p className={'erp-record-view-message'}>Loading...</p>}
        {!loading && error && <p className={'erp-record-view-error'} role={'alert'}>{error}</p>}
        {!loading && !error && record && (
          <>
            <div className={'flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4'}>
              <div className={'flex items-center gap-3'}>
                <span className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${isDelivered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isDelivered ? 'Delivered' : 'Open'}
                </span>
                <span className={activeStatus ? 'erp-view-status-active' : 'erp-view-status-inactive'}>
                  {activeStatus ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <h2 className={'erp-employee-section-title mt-6'}>Asset & Receiver Information</h2>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>Asset Item</dt>
                <dd>{record.ITEM_NAME_LABEL || 'N/A'}</dd>
              </div>
              <div>
                <dt>Receive By (Vendor)</dt>
                <dd>{record.RECEIVE_BY_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Support Engineer</dt>
                <dd>{record.SUPPORT_ENGINEER_NAME || 'N/A'}</dd>
              </div>
            </dl>

            <div className={'erp-role-divider'} />
            <h2 className={'erp-employee-section-title'}>Repair Dates & Timeline</h2>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>Receive Date</dt>
                <dd>{formatDateForDisplay(record.RECEIVE_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Start Date</dt>
                <dd>{formatDateForDisplay(record.START_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Finish Date</dt>
                <dd>{formatDateForDisplay(record.FINISH_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Delivery Date</dt>
                <dd>{formatDateForDisplay(record.DELIVERY_DATE) || 'Open / In Progress'}</dd>
              </div>
            </dl>

            <div className={'erp-role-divider'} />
            <h2 className={'erp-employee-section-title'}>Problem Details & Remarks</h2>
            <dl className={'erp-record-view-grid'}>
              <div className={'sm:col-span-2 md:col-span-3'}>
                <dt>Problem Specification</dt>
                <dd>{record.PROB_SPEC || 'None'}</dd>
              </div>
              <div className={'sm:col-span-2 md:col-span-3'}>
                <dt>Remarks</dt>
                <dd>{record.REMARK || 'None'}</dd>
              </div>
            </dl>

            <AuditLogSection
              createdUser={record.createdUserId}
              createdDate={record.createdDatetime}
              updatedUser={record.updatedUserId}
              updatedDate={record.updatedDatetime}
            />
          </>
        )}
      </section>
    </div>
  )
}

export default AssetRepairView

