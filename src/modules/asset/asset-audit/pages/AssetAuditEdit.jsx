/** @file API-backed edit controller for Asset Audit. */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetAuditForm from '../components/AssetAuditForm'
import { assetAuditApi } from '../api/assetAuditApi'
import { mapAssetAuditFromApi, mapAssetAuditToApi } from '../data/assetAuditApiMapper'
import { updateAssetAuditField } from '../data/assetAuditFormState'
import { getInitialAssetAuditReferences, loadAssetAuditReferences } from '../data/assetAuditOptions'
import {
  ASSET_AUDIT_TABLE,
  createInitialAssetAuditValues,
  validateAssetAudit,
} from '../validation/assetAuditValidation'

const listPath = '/asset/asset-audit'

const fieldMap = {
  itemId: 'ASSET_RECORD_ID',
  disposalDate: 'DISPOSAL_DATE',
  disposalType: 'DISPOSAL_TYPE',
  disposalValue: 'DISPOSAL_VALUE',
  writtenDownValue: 'WRITTEN_DOWN_VALUE',
  gainOnDisposal: 'GAIN_ON_DISPOSAL',
  lossOnDisposal: 'LOSS_ON_DISPOSAL',
  approvedBy: 'APPROVED_BY',
  reason: 'REASON',
  remark: 'REMARK',
  disposalStatus: 'DISPOSAL_STATUS',
  status: 'STATUS',
}

function AssetAuditEdit() {
  const { assetAuditId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const buId = session?.buId ? String(session.buId) : ''
  const bgId = session?.bgId ? String(session.bgId) : ''

  const [initialRecord, setInitialRecord] = useState(null)
  const [values, setValues] = useState(createInitialAssetAuditValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(getInitialAssetAuditReferences)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetAuditApi.get(assetAuditId),
      loadAssetAuditReferences(buId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapAssetAuditFromApi(apiRecord, refs)
        setInitialRecord(mapped)
        setValues(mapped)
      })
      .catch((err) => {
        if (active) setMessage(getApiErrorMessage(err, 'Failed to load Asset Audit.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [assetAuditId, buId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetAuditField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateAssetAudit(values, [], references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      setMessage('Please correct the validation errors below.')
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapAssetAuditToApi({
        ...initialRecord,
        ...result.values,
      }, {
        id: assetAuditId,
        buId: initialRecord?.buId || buId,
        bgId: initialRecord?.bgId || bgId,
      })
      await assetAuditApi.update(assetAuditId, payload)
      navigate(listPath)
    } catch (err) {
      const applied = applyApiFormErrors(err, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(err, 'Failed to update Asset Audit.'))
      }
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (initialRecord) setValues(initialRecord)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus())
  }

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <div className={'erp-form-card p-6'}>
          <p className={'text-gray-500'}>Loading Asset Audit...</p>
        </div>
      </div>
    )
  }

  return (
    <FormPage
      title={'Asset Audit Edit'}
      listTo={listPath}
      tableName={ASSET_AUDIT_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
      message={message}
    >
      <AssetAuditForm
        values={values}
        errors={errors}
        references={references}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetAuditEdit
