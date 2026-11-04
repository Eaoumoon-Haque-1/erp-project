/** @file Read-only Asset Transfer details loaded from the API with Audit Log. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import AuditLogSection from '../../../../components/shared/AuditLogSection'
import { getApiErrorMessage } from '../../../../api/errors'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { assetTransferApi } from '../api/assetTransferApi'
import { mapAssetTransferFromApi } from '../data/assetTransferApiMapper'
import { loadAssetTransferReferences } from '../data/assetTransferOptions'

const basePath = '/asset/asset-transfer'

const formatCondition = (value) => (
  String(value || '')
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
)

function AssetTransferView() {
  const { assetTransferId } = useParams()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetTransferApi.get(assetTransferId),
      loadAssetTransferReferences(sessionBusinessUnitId, sessionGroupId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setRecord(mapAssetTransferFromApi(apiRecord, refs))
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Unable to load Asset Transfer.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [assetTransferId, sessionBusinessUnitId, sessionGroupId])

  const editPath = record ? `${basePath}/${assetTransferId}/edit` : ''
  const activeStatus = String(record?.STATUS ?? 1) === '1'

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Transfer View'}
        actionLabel={'List'}
        actionTo={basePath}
        actions={editPath ? [{ label: 'Edit', to: editPath, variant: 'secondary' }] : []}
      />
      <section className={'erp-form-card'}>
        {loading && <p className={'erp-record-view-message'}>Loading...</p>}
        {!loading && error && <p className={'erp-record-view-error'} role={'alert'}>{error}</p>}
        {!loading && !error && record && (
          <>
            <h2 className={'erp-employee-section-title'}>Asset Information</h2>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>Asset Item</dt>
                <dd>{record.ITEM_NAME_LABEL || 'N/A'}</dd>
              </div>
              <div>
                <dt>Transfer Date</dt>
                <dd>{formatDateForDisplay(record.TO_ASSIGN_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={activeStatus ? 'erp-view-status-active' : 'erp-view-status-inactive'}>
                    {activeStatus ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>

            <div className={'erp-role-divider'} />
            <h2 className={'erp-employee-section-title'}>Before Asset Transfer</h2>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>From Custodian</dt>
                <dd>{record.FROM_CUSTODIAN_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>From Sub Custodian</dt>
                <dd>{record.FROM_SUB_CUSTODIAN_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>From Department</dt>
                <dd>{record.FROM_DEPARTMENT_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>From Location</dt>
                <dd>{record.FROM_LOCATION_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>From Building</dt>
                <dd>{record.FROM_BUILDING || 'N/A'}</dd>
              </div>
              <div>
                <dt>From Floor / Room</dt>
                <dd>{[record.FROM_FLOOR, record.FROM_ROOM].filter(Boolean).join(' / ') || 'N/A'}</dd>
              </div>
              <div>
                <dt>From Assign Date</dt>
                <dd>{formatDateForDisplay(record.FROM_ASSIGN_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>From Condition</dt>
                <dd>{record.FROM_CONDITION_ON_ISSUE ? formatCondition(record.FROM_CONDITION_ON_ISSUE) : 'N/A'}</dd>
              </div>
              <div className={'erp-record-view-field-wide'}>
                <dt>From Remarks</dt>
                <dd>{record.FROM_REMARKS || 'N/A'}</dd>
              </div>
            </dl>

            <div className={'erp-role-divider'} />
            <h2 className={'erp-employee-section-title'}>After Asset Transfer</h2>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>To Custodian</dt>
                <dd>{record.TO_CUSTODIAN_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>To Sub Custodian</dt>
                <dd>{record.TO_SUB_CUSTODIAN_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>To Department</dt>
                <dd>{record.TO_DEPARTMENT_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>To Location</dt>
                <dd>{record.TO_LOCATION_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>To Building</dt>
                <dd>{record.TO_BUILDING || 'N/A'}</dd>
              </div>
              <div>
                <dt>To Floor / Room</dt>
                <dd>{[record.TO_FLOOR, record.TO_ROOM].filter(Boolean).join(' / ') || 'N/A'}</dd>
              </div>
              <div>
                <dt>To Condition on Issue</dt>
                <dd>{record.TO_CONDITION_ON_ISSUE ? formatCondition(record.TO_CONDITION_ON_ISSUE) : 'N/A'}</dd>
              </div>
              <div className={'erp-record-view-field-wide'}>
                <dt>To Remarks</dt>
                <dd>{record.TO_REMARKS || 'N/A'}</dd>
              </div>
            </dl>

            <AuditLogSection record={record} />
          </>
        )}
      </section>
    </div>
  )
}

export default AssetTransferView

