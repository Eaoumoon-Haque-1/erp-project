/** @file API-backed create controller for Asset Audit. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetAuditForm from '../components/AssetAuditForm'
import { assetAuditApi } from '../api/assetAuditApi'
import { mapAssetAuditToApi } from '../data/assetAuditApiMapper'
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

function AssetAuditCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const buId = session?.buId ? String(session.buId) : ''
  const bgId = session?.bgId ? String(session.bgId) : ''

  const [values, setValues] = useState(createInitialAssetAuditValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(getInitialAssetAuditReferences)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    loadAssetAuditReferences(buId).then((refs) => {
      if (!active) return
      setReferences(refs)
    })

    return () => { active = false }
  }, [buId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetAuditField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateAssetAudit(values, references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapAssetAuditToApi(result.values, { buId, bgId })
      await assetAuditApi.create(payload)
      navigate(listPath)
    } catch (err) {
      const applied = applyApiFormErrors(err, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(err, 'Failed to create Asset Audit.'))
      }
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialAssetAuditValues())
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus())
  }

  return (
    <FormPage
      title={'Asset Audit Create'}
      listTo={listPath}
      tableName={ASSET_AUDIT_TABLE}
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

export default AssetAuditCreate
