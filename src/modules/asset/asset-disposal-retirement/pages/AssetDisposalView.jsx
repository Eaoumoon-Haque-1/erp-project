/** @file Read-only Asset Disposal details loaded from the API with workflow transitions and Audit Log. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import AuditLogSection from '../../../../components/shared/AuditLogSection'
import { getApiErrorMessage } from '../../../../api/errors'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { assetDisposalApi } from '../api/assetDisposalApi'
import { mapAssetDisposalFromApi } from '../data/assetDisposalApiMapper'
import { loadAssetDisposalReferences } from '../data/assetDisposalOptions'

const basePath = '/asset/asset-disposal-retirement'

function AssetDisposalView() {
  const { disposalId } = useParams()
  const { session } = useAuth()
  const sessionBusinessUnitId = session?.buId ? String(session.buId) : ''
  const employeeId = session?.employeeId || session?.userEmpId

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const reloadData = async () => {
    try {
      const [apiRecord, refs] = await Promise.all([
        assetDisposalApi.get(disposalId),
        loadAssetDisposalReferences(sessionBusinessUnitId),
      ])
      setRecord(mapAssetDisposalFromApi(apiRecord, refs))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reload Asset Disposal.'))
    }
  }

  useEffect(() => {
    let active = true

    Promise.all([
      assetDisposalApi.get(disposalId),
      loadAssetDisposalReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setRecord(mapAssetDisposalFromApi(apiRecord, refs))
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Unable to load Asset Disposal.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [disposalId, sessionBusinessUnitId])

  const handleWorkflowAction = async (actionFn, actionName) => {
    if (!window.confirm(`Are you sure you want to ${actionName} this disposal record?`)) return
    setActionLoading(true)
    try {
      await actionFn()
      await reloadData()
    } catch (err) {
      alert(getApiErrorMessage(err, `Failed to ${actionName} Asset Disposal.`))
    } finally {
      setActionLoading(false)
    }
  }

  const editPath = record ? `${basePath}/${disposalId}/edit` : ''
  const activeStatus = String(record?.STATUS ?? 1) === '1'
  const disposalStatus = record?.DISPOSAL_STATUS || 'DRAFT'

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-rose-100 text-rose-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-amber-100 text-amber-800',
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Disposal / Retirement View'}
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
                <span className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${statusColors[disposalStatus] || 'bg-gray-100 text-gray-800'}`}>
                  {disposalStatus}
                </span>
                <span className={activeStatus ? 'erp-view-status-active' : 'erp-view-status-inactive'}>
                  {activeStatus ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Workflow Actions */}
              <div className={'flex flex-wrap items-center gap-2'}>
                {disposalStatus === 'DRAFT' && (
                  <button
                    type={'button'}
                    disabled={actionLoading}
                    className={'inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50'}
                    onClick={() => handleWorkflowAction(() => assetDisposalApi.submit(disposalId), 'submit')}
                  >
                    Submit
                  </button>
                )}

                {disposalStatus === 'SUBMITTED' && (
                  <>
                    <button
                      type={'button'}
                      disabled={actionLoading}
                      className={'inline-flex items-center rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50'}
                      onClick={() => handleWorkflowAction(() => assetDisposalApi.approve(disposalId, employeeId), 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      type={'button'}
                      disabled={actionLoading}
                      className={'inline-flex items-center rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50'}
                      onClick={() => handleWorkflowAction(() => assetDisposalApi.reject(disposalId), 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}

                {disposalStatus === 'APPROVED' && (
                  <button
                    type={'button'}
                    disabled={actionLoading}
                    className={'inline-flex items-center rounded bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50'}
                    onClick={() => handleWorkflowAction(() => assetDisposalApi.complete(disposalId), 'complete')}
                  >
                    Complete
                  </button>
                )}

                {!['COMPLETED', 'CANCELLED'].includes(disposalStatus) && (
                  <button
                    type={'button'}
                    disabled={actionLoading}
                    className={'inline-flex items-center rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50'}
                    onClick={() => handleWorkflowAction(() => assetDisposalApi.cancel(disposalId), 'cancel')}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <h2 className={'erp-employee-section-title mt-6'}>Asset Information</h2>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>Asset Item</dt>
                <dd>{record.ITEM_NAME_LABEL || 'N/A'}</dd>
              </div>
              <div>
                <dt>Written Down Value</dt>
                <dd>{record.WRITTEN_DOWN_VALUE ? Number(record.WRITTEN_DOWN_VALUE).toFixed(2) : '0.00'}</dd>
              </div>
            </dl>

            <div className={'erp-role-divider'} />
            <h2 className={'erp-employee-section-title'}>Asset Disposal Information</h2>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>Disposal Date</dt>
                <dd>{formatDateForDisplay(record.DISPOSAL_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Disposal Type</dt>
                <dd>{record.DISPOSAL_TYPE_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Disposal Value</dt>
                <dd>{record.DISPOSAL_VALUE ? Number(record.DISPOSAL_VALUE).toFixed(2) : '0.00'}</dd>
              </div>
              <div>
                <dt>Gain on Disposal</dt>
                <dd>{record.GAIN_ON_DISPOSAL ? Number(record.GAIN_ON_DISPOSAL).toFixed(2) : '0.00'}</dd>
              </div>
              <div>
                <dt>Loss on Disposal</dt>
                <dd>{record.LOSS_ON_DISPOSAL ? Number(record.LOSS_ON_DISPOSAL).toFixed(2) : '0.00'}</dd>
              </div>
              <div>
                <dt>Approved By</dt>
                <dd>{record.APPROVED_BY_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Reason</dt>
                <dd>{record.REASON_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Disposal Status</dt>
                <dd>{record.DISPOSAL_STATUS || 'N/A'}</dd>
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

export default AssetDisposalView

