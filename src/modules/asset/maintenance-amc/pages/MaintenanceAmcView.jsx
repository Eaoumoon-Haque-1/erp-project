/** @file Read-only Maintenance / AMC details loaded from the API with Audit Log. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import AuditLogSection from '../../../../components/shared/AuditLogSection'
import { getApiErrorMessage } from '../../../../api/errors'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { maintenanceAmcApi } from '../api/maintenanceAmcApi'
import { mapMaintenanceAmcFromApi } from '../data/maintenanceAmcApiMapper'
import { loadMaintenanceReferences } from '../data/maintenanceAmcOptions'

const basePath = '/asset/maintenance-amc'

function MaintenanceAmcView() {
  const { maintenanceId } = useParams()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      maintenanceAmcApi.get(maintenanceId),
      loadMaintenanceReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setRecord(mapMaintenanceAmcFromApi(apiRecord, refs))
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Unable to load Maintenance / AMC record.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [maintenanceId, sessionBusinessUnitId])

  const editPath = record ? `${basePath}/${maintenanceId}/edit` : ''
  const activeStatus = String(record?.STATUS ?? 1) === '1'

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Maintenance / AMC View'}
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
                <dt>Asset Item</dt>
                <dd>{record.ITEM_NAME_LABEL || 'N/A'}</dd>
              </div>
              <div>
                <dt>Maintenance Type</dt>
                <dd>{record.MAINTENANCE_TYPE_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{record.MAINTENANCE_PRIORITY || 'N/A'}</dd>
              </div>
              <div>
                <dt>Vendor</dt>
                <dd>{record.VENDOR_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Start Date</dt>
                <dd>{formatDateForDisplay(record.START_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>End Date</dt>
                <dd>{formatDateForDisplay(record.END_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Cost</dt>
                <dd>{record.COST ? Number(record.COST).toFixed(2) : 'N/A'}</dd>
              </div>
              <div>
                <dt>Next Due Date</dt>
                <dd>{formatDateForDisplay(record.NEXT_DUE_DATE) || 'N/A'}</dd>
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
                <dt>Remark</dt>
                <dd>{record.REMARK || 'N/A'}</dd>
              </div>
            </dl>

            <AuditLogSection record={record} />
          </>
        )}
      </section>
    </div>
  )
}

export default MaintenanceAmcView

