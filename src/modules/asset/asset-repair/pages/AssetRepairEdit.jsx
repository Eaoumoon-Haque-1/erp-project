/** @file API-backed edit controller for Asset Repair. */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetRepairForm from '../components/AssetRepairForm'
import { assetRepairApi } from '../api/assetRepairApi'
import { mapAssetRepairFromApi, mapAssetRepairToApi } from '../data/assetRepairApiMapper'
import { updateAssetRepairField } from '../data/assetRepairFormState'
import { getInitialAssetRepairReferences, loadAssetRepairReferences } from '../data/assetRepairOptions'
import {
  ASSET_REPAIR_TABLE,
  createInitialAssetRepairValues,
  validateAssetRepair,
} from '../validation/assetRepairValidation'

const listPath = '/asset/asset-repair'

const fieldMap = {
  itemId: 'ASSET_RECORD_ID',
  receiveDate: 'RECEIVE_DATE',
  receiveId: 'RECEIVE_ID',
  probSpec: 'PROB_SPEC',
  supportEngineer: 'SUPPORT_ENGINEER',
  startDate: 'START_DATE',
  finishDate: 'FINISH_DATE',
  deliveryDate: 'DELIVERY_DATE',
  remark: 'REMARK',
  status: 'STATUS',
}

function AssetRepairEdit() {
  const { repairId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = session?.buId ? String(session.buId) : ''
  const sessionGroupId = session?.bgId ? String(session.bgId) : ''

  const [initialRecord, setInitialRecord] = useState(null)
  const [values, setValues] = useState(createInitialAssetRepairValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(getInitialAssetRepairReferences)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetRepairApi.get(repairId),
      loadAssetRepairReferences(sessionBusinessUnitId),
    ])
      .then(([apiRecord, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapAssetRepairFromApi(apiRecord, refs)
        setInitialRecord(mapped)
        setValues(mapped)
      })
      .catch((err) => {
        if (active) setMessage(getApiErrorMessage(err, 'Failed to load Asset Repair.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [repairId, sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetRepairField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateAssetRepair(values, references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      setMessage('Please correct the validation errors below.')
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapAssetRepairToApi(
        {
          ...initialRecord,
          ...result.values,
        },
        {
          id: repairId,
          buId: initialRecord?.buId || sessionBusinessUnitId,
          bgId: initialRecord?.bgId || sessionGroupId,
        },
        references,
      )
      await assetRepairApi.update(repairId, payload)
      navigate(listPath)
    } catch (err) {
      const applied = applyApiFormErrors(err, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(err, 'Failed to update Asset Repair.'))
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
          <p className={'text-gray-500'}>Loading Asset Repair...</p>
        </div>
      </div>
    )
  }

  return (
    <FormPage
      title={'Asset Repair Edit'}
      listTo={listPath}
      tableName={ASSET_REPAIR_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
      message={message}
    >
      <AssetRepairForm
        values={values}
        errors={errors}
        references={references}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetRepairEdit
