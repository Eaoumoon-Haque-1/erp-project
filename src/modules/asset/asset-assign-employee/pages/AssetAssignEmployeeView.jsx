/** @file Read-only Asset Assign to Employee details loaded from the API with Audit Log. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import AuditLogSection from '../../../../components/shared/AuditLogSection'
import { getApiErrorMessage } from '../../../../api/errors'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { assetAssignmentApi } from '../api/assetAssignmentApi'
import { mapAssetAssignmentFromApi } from '../data/assetAssignEmployeeApiMapper'
import { loadAssetAssignReferences } from '../data/assetAssignEmployeeOptions'

const basePath = '/asset/asset-assign-to-employee'

function AssetAssignEmployeeView() {
  const { assetAssignmentId } = useParams()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetAssignmentApi.get(assetAssignmentId),
      loadAssetAssignReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setRecord(mapAssetAssignmentFromApi(apiRecord, refs))
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Unable to load Asset Assignment.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [assetAssignmentId, sessionBusinessUnitId])

  const editPath = record ? `${basePath}/${assetAssignmentId}/edit` : ''
  const activeStatus = String(record?.STATUS ?? 1) === '1'

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Assign to Employee View'}
        actionLabel={'List'}
        actionTo={basePath}
        actions={editPath ? [{ label: 'Edit', to: editPath, variant: 'secondary' }] : []}
      />
      <section className={'erp-form-card'}>
        {loading && <p className={'erp-record-view-message'}>Loading...</p>}
        {!loading && error && <p className={'erp-record-view-error'} role={'alert'}>{error}</p>}
        {!loading && !error && record && (
          <>
            <dl className={'erp-record-view-grid'}>
              <div>
                <dt>Assign Date</dt>
                <dd>{formatDateForDisplay(record.ASSET_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Asset Item</dt>
                <dd>{record.ITEM_NAME_LABEL || 'N/A'}</dd>
              </div>
              <div>
                <dt>Assign To Employee</dt>
                <dd>{record.EMPLOYEE_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Condition on Issue</dt>
                <dd>
                  {record.CONDITION_ON_ISSUE
                    ? record.CONDITION_ON_ISSUE.charAt(0) + record.CONDITION_ON_ISSUE.slice(1).toLowerCase()
                    : 'N/A'}
                </dd>
              </div>
              <div>
                <dt>Expected Return Date</dt>
                <dd>{formatDateForDisplay(record.EXPECTED_RETURN_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Actual Return Date</dt>
                <dd>{formatDateForDisplay(record.ACTUAL_RETURN_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={activeStatus ? 'erp-view-status-active' : 'erp-view-status-inactive'}>
                    {activeStatus ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className={'erp-record-view-field-wide'}>
                <dt>Remarks</dt>
                <dd>{record.REMARKS || 'N/A'}</dd>
              </div>
            </dl>

            <AuditLogSection record={record} />
          </>
        )}
      </section>
    </div>
  )
}

export default AssetAssignEmployeeView

