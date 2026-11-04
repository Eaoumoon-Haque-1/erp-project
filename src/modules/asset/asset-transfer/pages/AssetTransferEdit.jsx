/** @file API-backed edit controller for Asset Transfer. */
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetTransferForm from '../components/AssetTransferForm'
import { assetTransferApi } from '../api/assetTransferApi'
import { updateAssetTransferField } from '../data/assetTransferFormState'
import { mapAssetTransferFromApi, mapAssetTransferToApi } from '../data/assetTransferApiMapper'
import { getInitialAssetTransferReferences, loadAssetTransferReferences } from '../data/assetTransferOptions'
import {
  ASSET_TRANSFER_TABLE,
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

function AssetTransferEdit() {
  const { assetTransferId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(null)
  const [originalValues, setOriginalValues] = useState(null)
  const [references, setReferences] = useState(getInitialAssetTransferReferences)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      assetTransferApi.get(assetTransferId),
      loadAssetTransferReferences(sessionBusinessUnitId, sessionGroupId),
    ])
      .then(([record, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapAssetTransferFromApi(record, refs)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 404) {
          setNotFound(true)
        } else {
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Transfer.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [assetTransferId, sessionBusinessUnitId, sessionGroupId])

  if (notFound) {
    return <Navigate to={listPath} replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetTransferField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
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
        bgId: originalValues?.BG_ID || sessionGroupId,
        buId: originalValues?.BU_ID || sessionBusinessUnitId,
      })
      await assetTransferApi.update(assetTransferId, payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to update Asset Transfer.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalValues) {
      setValues(originalValues)
      setErrors({})
      setMessage('')
      requestAnimationFrame(() => document.getElementById('ITEM_ID')?.focus())
    }
  }

  return (
    <FormPage
      title={'Asset Transfer Edit'}
      listTo={listPath}
      tableName={ASSET_TRANSFER_TABLE}
      submitLabel={'Update'}
      loading={loading}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {values && (
        <AssetTransferForm
          values={values}
          errors={errors}
          references={references}
          onChange={handleChange}
        />
      )}
    </FormPage>
  )
}

export default AssetTransferEdit
