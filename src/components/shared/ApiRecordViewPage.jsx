/** @file Shared read-only detail page for API-backed CRUD resources. */
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from './PageHeader'
import { getApiErrorMessage } from '../../api/errors'
import { getImageSource } from '../../utils/imageDataUrl'

function displayValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A'
  return String(value)
}

function getFieldValue(field, record) {
  return field.value ? field.value(record) : record?.[field.key]
}

function FieldValue({ field, record }) {
  const value = getFieldValue(field, record)

  if (field.type === 'status') {
    const active = String(value) === '1' || value === true
    return <span className={active ? 'erp-view-status-active' : 'erp-view-status-inactive'}>{active ? 'Active' : 'Inactive'}</span>
  }

  if (field.type === 'boolean') {
    if (value === null || value === undefined || value === '') return <span>N/A</span>
    return <span>{String(value) === '1' || value === true ? 'Yes' : 'No'}</span>
  }

  if (field.type === 'image') {
    const source = getImageSource(value)
    return source
      ? <img className={'erp-record-view-image'} src={source} alt={field.label} />
      : <span className={'erp-record-view-empty'}>No image available</span>
  }

  return <span>{displayValue(value)}</span>
}

function ApiRecordViewPage({ title, param, listTo, editTo, loader, fields, auditFields = [] }) {
  const params = useParams()
  const id = params[param]
  const loadRecord = useCallback(() => loader(id), [id, loader])
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const editPath = editTo && record ? editTo(id, record) : ''
  const visibleAuditFields = record
    ? auditFields.filter((field) => {
      const value = getFieldValue(field, record)
      return value !== null && value !== undefined && value !== ''
    })
    : []

  useEffect(() => {
    let active = true
    loadRecord()
      .then((result) => {
        if (active) setRecord(result)
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, `Unable to load ${title}.`))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loadRecord, title])

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={title}
        actionLabel={'List'}
        actionTo={listTo}
        actions={editPath ? [{ label: 'Edit', to: editPath, variant: 'secondary' }] : []}
      />
      <section className={'erp-form-card'}>
        {loading && <p className={'erp-record-view-message'}>Loading...</p>}
        {!loading && error && <p className={'erp-record-view-error'} role={'alert'}>{error}</p>}
        {!loading && !error && record && (
          <dl className={'erp-record-view-grid'}>
            {fields.map((field) => (
              <div key={field.label} className={field.wide ? 'erp-record-view-field-wide' : ''}>
                <dt>{field.label}</dt>
                <dd><FieldValue field={field} record={record} /></dd>
              </div>
            ))}
          </dl>
        )}
        {!loading && !error && record && visibleAuditFields.length > 0 && (
          <div className={'erp-record-view-audit'}>
            <h2>Audit Information</h2>
            <dl className={'erp-record-view-grid'}>
              {visibleAuditFields.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd><FieldValue field={field} record={record} /></dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>
    </div>
  )
}

export default ApiRecordViewPage
