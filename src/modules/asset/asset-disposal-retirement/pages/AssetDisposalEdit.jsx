/** @file API-backed edit controller for Asset Disposal / Retirement. */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetDisposalForm from '../components/AssetDisposalForm'
import { assetDisposalApi } from '../api/assetDisposalApi'
import { mapAssetDisposalFromApi, mapAssetDisposalToApi } from '../data/assetDisposalApiMapper'
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

function AssetDisposalEdit() {
  const { disposalId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = session?.buId ? String(session.buId) : ''
  const sessionGroupId = session?.bgId ? String(session.bgId) : ''

  const [initialRecord, setInitialRecord] = useState(null)
  const [values, setValues] = useState(createInitialAssetDisposalValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(getInitialAssetDisposalReferences)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetDisposalApi.get(disposalId),
      loadAssetDisposalReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapAssetDisposalFromApi(apiRecord, refs)
        setInitialRecord(mapped)
        setValues(mapped)
      })
      .catch((err) => {
        if (active) setMessage(getApiErrorMessage(err, 'Failed to load Asset Disposal.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [disposalId, sessionBusinessUnitId])

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
      const payload = mapAssetDisposalToApi(
        {
          ...initialRecord,
          ...result.values,
        },
        {
          id: disposalId,
          buId: initialRecord?.buId || sessionBusinessUnitId,
          bgId: initialRecord?.bgId || sessionGroupId,
        },
      )
      await assetDisposalApi.update(disposalId, payload)
      navigate(listPath)
    } catch (err) {
      const applied = applyApiFormErrors(err, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(err, 'Failed to update Asset Disposal.'))
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
          <p className={'text-gray-500'}>Loading Asset Disposal...</p>
        </div>
      </div>
    )
  }

  return (
    <FormPage
      title={'Asset Disposal / Retirement Edit'}
      listTo={listPath}
      tableName={ASSET_DISPOSAL_TABLE}
      submitLabel={'Update'}
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

export default AssetDisposalEdit
