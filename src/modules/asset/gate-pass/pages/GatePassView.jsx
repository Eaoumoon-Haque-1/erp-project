/** @file Read-only Gate Pass details loaded from the API with Item Details and Audit Log. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import AuditLogSection from '../../../../components/shared/AuditLogSection'
import { getApiErrorMessage } from '../../../../api/errors'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { gatePassApi } from '../api/gatePassApi'
import { mapGatePassFromApi } from '../data/gatePassApiMapper'
import { loadGatePassReferences } from '../data/gatePassOptions'

const basePath = '/asset/gate-pass'

function GatePassView() {
  const { gatePassId } = useParams()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      gatePassApi.get(gatePassId),
      loadGatePassReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setRecord(mapGatePassFromApi(apiRecord, refs))
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Unable to load Gate Pass.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [gatePassId, sessionBusinessUnitId])

  const editPath = record ? `${basePath}/${gatePassId}/edit` : ''
  const activeStatus = String(record?.STATUS ?? 1) === '1'

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Gate Pass View'}
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
                <dt>Gate Pass Date</dt>
                <dd>{formatDateForDisplay(record.GATE_PASS_DATE) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Gate Pass No</dt>
                <dd>{record.GATE_PASS_NO || 'N/A'}</dd>
              </div>
              <div>
                <dt>Supplier</dt>
                <dd>{record.SUPPLIER_NAME || 'N/A'}</dd>
              </div>
              <div>
                <dt>Custodian</dt>
                <dd>{record.CUSTODIAN_NAME || 'N/A'}</dd>
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
                <dd>{record.REMARK || 'N/A'}</dd>
              </div>
            </dl>

            <div className={'erp-role-divider'} />
            <h2 className={'erp-employee-section-title'}>Item Details</h2>
            <div className={'erp-table-wrap erp-gate-pass-table-wrap'}>
              <table className={'erp-table erp-gate-pass-table'} data-table={'ASSET_GATE_PASS_DTLS'}>
                <thead>
                  <tr>
                    <th className={'erp-number-column'}>#</th>
                    <th>Asset Item Name and ID</th>
                    <th className={'erp-quantity-column'}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {!record.ITEMS || record.ITEMS.length === 0 ? (
                    <tr>
                      <td className={'erp-empty-cell'} colSpan={3}>No Asset Item details found.</td>
                    </tr>
                  ) : (
                    record.ITEMS.map((row, index) => (
                      <tr key={row.ID || index}>
                        <td className={'erp-number-column'}>{index + 1}</td>
                        <td>{row.ITEM_NAME} - {row.ITEM_NAME_LABEL}</td>
                        <td className={'erp-quantity-column'}>{row.QUANTITY}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <AuditLogSection record={record} />
          </>
        )}
      </section>
    </div>
  )
}

export default GatePassView

