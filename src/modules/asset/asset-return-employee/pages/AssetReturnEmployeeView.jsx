/** @file Read-only Asset Return from Employee details loaded from the API with Audit Log. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import AuditLogSection from '../../../../components/shared/AuditLogSection'
import { getApiErrorMessage } from '../../../../api/errors'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { assetReturnApi } from '../api/assetReturnApi'
import { mapAssetReturnFromApi } from '../data/assetReturnEmployeeApiMapper'
import { loadAssetReturnReferences } from '../data/assetReturnEmployeeOptions'

const basePath = '/asset/asset-return-from-employee'

const formatCondition = (value) => (
  String(value || '')
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
)

function AssetReturnEmployeeView() {
  const { assetReturnId } = useParams()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetReturnApi.get(assetReturnId),
      loadAssetReturnReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setRecord(mapAssetReturnFromApi(apiRecord, refs))
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Unable to load Asset Return.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [assetReturnId, sessionBusinessUnitId])

  const editPath = record ? `${basePath}/${assetReturnId}/edit` : ''
  const activeStatus = String(record?.STATUS ?? 1) === '1'

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Asset Return from Employee View'}
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
                <dt>Employee</dt>
                <dd>{record.EMPLOYEE_NAME || 'N/A'}</dd>
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
                <dt>Condition on Return</dt>
                <dd>{record.CONDITION_ON_RETURN ? formatCondition(record.CONDITION_ON_RETURN) : 'N/A'}</dd>
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

export default AssetReturnEmployeeView

