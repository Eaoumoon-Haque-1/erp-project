/** @file API-backed create controller for Asset Transfer. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetTransferForm from '../components/AssetTransferForm'
import { assetTransferApi } from '../api/assetTransferApi'
import { applyCurrentAssetTransferState, updateAssetTransferField } from '../data/assetTransferFormState'
import { mapAssetTransferToApi } from '../data/assetTransferApiMapper'
import { getInitialAssetTransferReferences, loadAssetTransferReferences } from '../data/assetTransferOptions'
import {
  ASSET_TRANSFER_TABLE,
  createInitialAssetTransferValues,
  validateAssetTransfer,
} from '../validation/assetTransferValidation'

const listPath = '/asset/asset-transfer'
const fieldMap = {
  itemId: 'ITEM_ID',
  fromCustodianId: 'FROM_CUSTODIAN_ID',
  fromSubCustodianId: 'FROM_SUB_CUSTODIAN_ID',
  fromDepartmentId: 'FROM_DEPARTMENT_ID',
  fromLocationId: 'FROM_LOCATION',
  fromAssignDate: 'FROM_ASSIGN_DATE',
  fromConditionOnIssue: 'FROM_CONDITION_ON_ISSUE',
  fromRemarks: 'FROM_REMARKS',
  toCustodianId: 'TO_CUSTODIAN_ID',
  toSubCustodianId: 'TO_SUB_CUSTODIAN_ID',
  toDepartmentId: 'TO_DEPARTMENT_ID',
  toLocationId: 'TO_LOCATION',
  toAssignDate: 'TO_ASSIGN_DATE',
  toConditionOnIssue: 'TO_CONDITION_ON_ISSUE',
  toRemarks: 'TO_REMARKS',
  status: 'STATUS',
}

function AssetTransferCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(createInitialAssetTransferValues)
  const [references, setReferences] = useState(getInitialAssetTransferReferences)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    loadAssetTransferReferences(sessionBusinessUnitId, sessionGroupId)
      .then((refs) => {
        if (active) setReferences(refs)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load references.'))
      })

    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

  const handleChange = async (event) => {
    const { name, value } = event.target
    const updated = updateAssetTransferField(values, name, value, references)
    setValues(updated)
    setErrors((current) => ({ ...current, [name]: undefined }))

    if (name === 'ITEM_ID' && value) {
      try {
        const currentRecord = await assetTransferApi.getCurrent(value).catch(() => null)
        if (currentRecord) {
          setValues((prev) => applyCurrentAssetTransferState(prev, currentRecord, references))
        }
      } catch {
        // Fallback: continue with manual entry if no prior transfer recorded
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateAssetTransfer(values, references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapAssetTransferToApi(result.values, {
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      })
      await assetTransferApi.create(payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to create Asset Transfer.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialAssetTransferValues())
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => document.getElementById('ITEM_ID')?.focus())
  }

  return (
    <FormPage
      title={'Asset Transfer Create'}
      listTo={listPath}
      tableName={ASSET_TRANSFER_TABLE}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <AssetTransferForm
        values={values}
        errors={errors}
        references={references}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetTransferCreate
