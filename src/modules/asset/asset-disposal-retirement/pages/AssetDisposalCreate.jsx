/** @file API-backed create controller for Asset Disposal / Retirement. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetDisposalForm from '../components/AssetDisposalForm'
import { assetDisposalApi } from '../api/assetDisposalApi'
import { mapAssetDisposalToApi } from '../data/assetDisposalApiMapper'
import { updateAssetDisposalField } from '../data/assetDisposalFormState'
import { getInitialAssetDisposalReferences, loadAssetDisposalReferences } from '../data/assetDisposalOptions'
import {
  ASSET_DISPOSAL_TABLE,
  createInitialAssetDisposalValues,
  validateAssetDisposal,
} from '../validation/assetDisposalValidation'

const listPath = '/asset/asset-disposal-retirement'

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

function AssetDisposalCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = session?.buId ? String(session.buId) : ''
  const sessionGroupId = session?.bgId ? String(session.bgId) : ''

  const [values, setValues] = useState(createInitialAssetDisposalValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(getInitialAssetDisposalReferences)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    loadAssetDisposalReferences(sessionBusinessUnitId).then((refs) => {
      if (!active) return
      setReferences(refs)
    })

    return () => { active = false }
  }, [sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetDisposalField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateAssetDisposal(values, references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      setMessage('Please correct the validation errors below.')
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapAssetDisposalToApi(result.values, {
        buId: sessionBusinessUnitId,
        bgId: sessionGroupId,
      })
      await assetDisposalApi.create(payload)
      navigate(listPath)
    } catch (err) {
      const applied = applyApiFormErrors(err, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(err, 'Failed to create Asset Disposal.'))
      }
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialAssetDisposalValues())
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => document.getElementById('ASSET_RECORD_ID')?.focus())
  }

  return (
    <FormPage
      title={'Asset Disposal / Retirement Create'}
      listTo={listPath}
      tableName={ASSET_DISPOSAL_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
      message={message}
    >
      <AssetDisposalForm
        values={values}
        errors={errors}
        references={references}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetDisposalCreate
